/**
 * Ingest event analitik first-party (page view, greeting, klik WhatsApp).
 *
 * Sink saat ini hanya log terstruktur — Plan B menggantinya dengan tabel Postgres
 * tanpa mengubah kontrak dari sisi klien.
 */

import { NextResponse } from 'next/server'

import { z } from 'zod'

import { getDb } from '@/db/client'
import { chatEvent } from '@/db/schema'
import { chatConfig } from '@/lib/config/chat'
import { getRateLimitStore } from '@/lib/chat/rate-limit-factory'
import { clientIp, hashIp } from '@/lib/chat/request-ip'

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

  // Guard abuse: endpoint ini menulis ke database, jadi dibatasi per IP per menit.
  const store = getRateLimitStore()
  const events = await store.incr(`track:${hashIp(clientIp(request))}`, 60_000, Date.now())
  if (events > chatConfig.rateLimit.eventsPerMinute) {
    console.warn(JSON.stringify({ level: 'warn', event: 'chat.track_limited', count: events }))
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  console.info(JSON.stringify({ level: 'info', event: 'chat.track', ...parsed.data }))

  try {
    await getDb().insert(chatEvent).values({
      sessionId: parsed.data.sessionId,
      type: parsed.data.type,
      pageUrl: parsed.data.pageUrl ?? null,
      meta: parsed.data.meta ?? null,
    })
  } catch (error) {
    // Analitik tidak boleh menggagalkan pengalaman pengunjung; kegagalan cukup dicatat.
    console.warn(
      JSON.stringify({ level: 'warn', event: 'chat.track_persist_failed', message: error instanceof Error ? error.message : String(error) }),
    )
  }

  return NextResponse.json({ ok: true })
}
