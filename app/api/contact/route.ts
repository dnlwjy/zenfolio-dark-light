import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { buildOwnerEmailTemplate, buildVisitorAutoReplyTemplate } from '@/lib/contact/email-template'
import { checkRateLimit, getClientIp } from '@/lib/contact/rate-limit'
import { contactFormSchema, type ContactApiResponse } from '@/lib/contact/schema'
import { envServer } from '@/lib/env.server'

const resend = new Resend(envServer.RESEND_API_KEY)
const OWNER_SUBJECT_PREFIX = 'New Contact Message from'
const VISITOR_SUBJECT = 'Thanks for reaching out to Daniel'

function logEvent(level: 'info' | 'error', event: string, context: Record<string, unknown>) {
  const payload = JSON.stringify({ level, event, ...context })
  if (level === 'error') {
    console.error(payload)
    return
  }
  console.info(payload)
}

function jsonResponse(body: ContactApiResponse, status: number) {
  return NextResponse.json(body, { status })
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request)
  const limiter = checkRateLimit(clientIp)
  if (!limiter.allowed) {
    logEvent('info', 'contact.rate_limited', { clientIp, retryAfterSec: limiter.retryAfterSec })
    return jsonResponse(
      {
        success: false,
        code: 'RATE_LIMITED',
        message: 'Too many attempts. Please try again in a few minutes.',
      },
      429,
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return jsonResponse(
      {
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Invalid request format.',
      },
      400,
    )
  }

  const parsedPayload = contactFormSchema.safeParse(payload)
  if (!parsedPayload.success) {
    return jsonResponse(
      {
        success: false,
        code: 'VALIDATION_ERROR',
        message: parsedPayload.error.issues[0]?.message ?? 'Invalid input.',
      },
      400,
    )
  }

  const { name, email, message, recaptcha } = parsedPayload.data

  try {
    const verify = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: new URLSearchParams({
        secret: envServer.RECAPTCHA_SECRET_KEY,
        response: recaptcha,
      }),
    })

    const verifyResult = (await verify.json()) as { success?: boolean }
    if (!verifyResult.success) {
      logEvent('info', 'contact.bot_check_failed', { clientIp })
      return jsonResponse(
        {
          success: false,
          code: 'BOT_CHECK_FAILED',
          message: 'Security verification failed. Please retry reCAPTCHA and try again.',
        },
        400,
      )
    }
  } catch (error) {
    logEvent('error', 'contact.bot_check_error', {
      clientIp,
      message: error instanceof Error ? error.message : 'unknown',
    })
    return jsonResponse(
      {
        success: false,
        code: 'BOT_CHECK_FAILED',
        message: 'Security verification is temporarily unavailable. Please try again shortly.',
      },
      500,
    )
  }

  const submittedAt = new Date()
  const ownerEmail = buildOwnerEmailTemplate({ name, email, message, submittedAt })
  const ownerSubject = `${OWNER_SUBJECT_PREFIX} ${name}`

  const ownerResult = await resend.emails.send({
    from: envServer.CONTACT_FROM_EMAIL,
    to: [envServer.CONTACT_TO_EMAIL],
    replyTo: [email],
    subject: ownerSubject,
    html: ownerEmail.html,
    text: ownerEmail.text,
  })

  if (ownerResult.error) {
    logEvent('error', 'contact.owner_email_failed', {
      clientIp,
      error: ownerResult.error.message,
    })
    return jsonResponse(
      {
        success: false,
        code: 'EMAIL_SEND_FAILED',
        message: 'Your message could not be sent. Please try again.',
      },
      500,
    )
  }

  const visitorEmail = buildVisitorAutoReplyTemplate({ name })
  const autoReplyResult = await resend.emails.send({
    from: envServer.CONTACT_FROM_EMAIL,
    to: [email],
    subject: VISITOR_SUBJECT,
    html: visitorEmail.html,
    text: visitorEmail.text,
  })

  if (autoReplyResult.error) {
    logEvent('error', 'contact.auto_reply_failed', {
      clientIp,
      error: autoReplyResult.error.message,
      ownerEmailId: ownerResult.data?.id,
    })
  }

  logEvent('info', 'contact.message_accepted', {
    clientIp,
    ownerEmailId: ownerResult.data?.id,
    autoReplyEmailId: autoReplyResult.data?.id,
  })

  return jsonResponse(
    {
      success: true,
      code: 'MESSAGE_ACCEPTED',
      message: 'Your message has been sent successfully. I will reply within an estimated 24 hours.',
    },
    200,
  )
}