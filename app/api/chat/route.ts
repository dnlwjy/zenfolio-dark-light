/**
 * Endpoint chat: satu-satunya jalur server untuk widget.
 *
 * Alur satu permintaan:
 *   validasi payload → rate limit → reCAPTCHA → susun prompt → panggil provider (streaming)
 *   → saring token penalaran → kirim event SSE ke widget.
 *
 * Kontrak event SSE (protokol internal, bukan format provider):
 *   { "type": "delta",  "text": "..." }
 *   { "type": "done",   "usage": {...}, "costUsd": 0.0004, "escalated": false }
 *   { "type": "error",  "message": "<pesan manusia yang tenang>" }
 */

import { createHash } from 'node:crypto'

import { NextResponse } from 'next/server'

import { classifyProviderFailure, visitorMessageForFailure } from '@/lib/ai/errors'
import { computeCost } from '@/lib/ai/pricing'
import { resolveActiveModel, type ResolvedModel } from '@/lib/ai/providers'
import { chatConfig } from '@/lib/config/chat'
import { detectEscalationIntent } from '@/lib/chat/boundary'
import { kbVersion, chatbotContent } from '@/lib/knowledge'
import { visitorMessages } from '@/lib/chat/messages'
import { resolveChatbotContent } from '@/lib/chat/content'
import { runCompletion } from '@/lib/chat/complete'
import { buildMessages, type ChatMessage, type HistoryMessage } from '@/lib/chat/prompt'
import { checkMessageLimits, checkSessionLimit, createMemoryRateLimitStore } from '@/lib/chat/rate-limit'
import { verifyRecaptcha } from '@/lib/chat/recaptcha'
import { prepareTurn } from '@/lib/chat/turn'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Store dibuat sekali di scope modul supaya bertahan antar permintaan pada instance yang sama.
const rateLimitStore = createMemoryRateLimitStore()
const encoder = new TextEncoder()

function sseEvent(payload: unknown): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const first = forwarded?.split(',')[0]?.trim()
  return first || request.headers.get('x-real-ip')?.trim() || 'unknown'
}

function hashIp(ip: string): string {
  const salt = process.env.CHAT_IP_SALT ?? ''
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex').slice(0, 16)
}

function logEvent(level: 'info' | 'warn' | 'error', event: string, context: Record<string, unknown>) {
  const line = JSON.stringify({ level, event, ...context })
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.info(line)
}

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ message: visitorMessages.temporarilyUnavailable }, { status: 400 })
  }

  const turn = prepareTurn(payload)
  if (!turn.ok) return NextResponse.json({ message: turn.message }, { status: turn.status })

  const ipHash = hashIp(clientIp(request))

  const sessionLimit = await checkSessionLimit({ store: rateLimitStore, ipHash })
  if (!sessionLimit.allowed) {
    logEvent('warn', 'chat.session_limited', { ipHash, reason: sessionLimit.reason })
    return NextResponse.json({ message: sessionLimit.message }, { status: 429 })
  }

  const messageLimit = await checkMessageLimits({ store: rateLimitStore, sessionId: turn.sessionId, ipHash, turnCount: turn.turnCount })
  if (!messageLimit.allowed) {
    logEvent('warn', 'chat.message_limited', { ipHash, sessionId: turn.sessionId, reason: messageLimit.reason })
    return NextResponse.json({ message: messageLimit.message }, { status: 429 })
  }

  const recaptcha = await verifyRecaptcha({
    token: turn.recaptchaToken,
    remoteIp: clientIp(request),
  })
  if (!recaptcha.ok) {
    logEvent('warn', 'chat.recaptcha_rejected', { ipHash, reason: recaptcha.reason })
    return NextResponse.json({ message: visitorMessages.slowDown }, { status: 429 })
  }

  let resolved: ResolvedModel
  try {
    resolved = resolveActiveModel()
  } catch (error) {
    logEvent('error', 'chat.provider_config_invalid', { message: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ message: visitorMessages.temporarilyUnavailable }, { status: 500 })
  }

  const messages = buildMessages({
    route: turn.route,
    history: turn.history as HistoryMessage[],
    question: turn.question,
    faqs: resolveChatbotContent(chatbotContent).faqs,
  })

  const escalated = detectEscalationIntent(turn.question)
  const startedAt = Date.now()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: unknown) => controller.enqueue(sseEvent(payload))
      const answer = await runCompletion({ resolved, messages, send })

      if (!answer.text) {
        send({ type: 'error', message: answer.failureMessage ?? visitorMessages.emptyAnswer })
      } else {
        send({ type: 'done', ...answer.done })
      }

      controller.close()

      logEvent('info', 'chat.turn_complete', {
        sessionId: turn.sessionId,
        ipHash,
        route: turn.route,
        provider: resolved.provider.id,
        model: resolved.model.id,
        kbVersion,
        latencyMs: Date.now() - startedAt,
        escalated,
        recaptchaScore: recaptcha.score,
        ...answer.done.usage,
        costUsd: answer.done.costUsd,
        usedFallback: answer.usedFallback,
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
