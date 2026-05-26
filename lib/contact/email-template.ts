import type { ContactFormInput } from '@/lib/contact/schema'

type ContactEmailTemplateArgs = Pick<ContactFormInput, 'name' | 'email' | 'message'> & {
  submittedAt: Date
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

// ============================================================
// EMAIL YOU RECEIVE (incoming message notification)
// ============================================================
export function buildOwnerEmailTemplate(args: ContactEmailTemplateArgs): {
  html: string
  text: string
} {
  const name = escapeHtml(args.name)
  const email = escapeHtml(args.email)
  const message = escapeHtml(args.message)
  const submittedAt = args.submittedAt.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const replyMailTo = `mailto:${encodeURIComponent(args.email)}`

  return {
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#101828;background:#f8fafc;padding:24px;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e4e7ec;border-radius:12px;padding:24px;">
          <h2 style="margin:0 0 16px;color:#111827;">New Message from Portfolio Contact Form</h2>
          <p style="margin:0 0 16px;color:#344054;">You received a new message from your portfolio contact page.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px 0;color:#667085;width:120px;">Name</td><td style="padding:8px 0;color:#111827;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#667085;">Email</td><td style="padding:8px 0;color:#111827;">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#667085;">Submitted At</td><td style="padding:8px 0;color:#111827;">${submittedAt}</td></tr>
          </table>
          <div style="background:#f9fafb;border:1px solid #eaecf0;border-radius:8px;padding:12px;white-space:pre-wrap;color:#111827;">${message}</div>
          <p style="margin:20px 0 0;">
            <a href="${replyMailTo}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;">Reply via Email</a>
          </p>
        </div>
      </div>
    `,
    text: `New Message from Portfolio Contact Form

Name: ${args.name}
Email: ${args.email}
Submitted At: ${submittedAt}

Message:
${args.message}
`,
  }
}

// ============================================================
// EMAIL THE SENDER RECEIVES (auto-reply)
// ============================================================
export function buildVisitorAutoReplyTemplate(args: Pick<ContactFormInput, 'name'>): {
  html: string
  text: string
} {
  const name = escapeHtml(args.name)
  return {
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#101828;background:#f8fafc;padding:24px;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e4e7ec;border-radius:12px;padding:24px;">
          <h2 style="margin:0 0 12px;color:#111827;">Thanks for reaching out 👋</h2>
          <p style="margin:0 0 12px;color:#344054;">Hi ${name},</p>
          <p style="margin:0 0 12px;color:#344054;">I've received your message and will get back to you within 24 hours.</p>
          <p style="margin:0;color:#667085;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `,
    text: `Thanks for reaching out to Daniel

Hi ${args.name},
I've received your message and will get back to you within 24 hours.

This is an automated message. Please do not reply to this email.`,
  }
}