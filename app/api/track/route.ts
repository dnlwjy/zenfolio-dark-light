/**
 * Ingest event analitik first-party (page view, greeting, klik WhatsApp).
 *
 * Sink saat ini hanya log terstruktur — Plan B menggantinya dengan tabel Postgres
 * tanpa mengubah kontrak dari sisi klien.
 */

import { NextResponse } from 'next/server'

import { z } from 'zod'

export const runtime = 'nodejs'

const eventSchema = z.object({
  type: z.enum(['page_view', 'greeting_shown', 'chat_open', 'message_sent', 'escalation_offered', 'whatsapp_open', 'contact_link_click', 'rate_limited', 'no_answer']),
  sessionId: z.string().min(4).max(64),
  pageUrl: z.string().max(300).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const parsed = eventSchema.safeParse(payload)
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })

  console.info(JSON.stringify({ level: 'info', event: 'chat.track', ...parsed.data }))

  return NextResponse.json({ ok: true })
}
