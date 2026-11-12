/**
 * Satu turn percakapan: validasi payload + urutan keputusan yang tidak butuh I/O.
 *
 * Fungsi ini sengaja sinkron dan murni supaya perilakunya bisa diuji tanpa server:
 * validasi bentuk payload, lalu guard input pengunjung. Rate limit, reCAPTCHA, dan
 * pemanggilan provider tetap di route karena semuanya butuh jaringan/database.
 */

import { z } from 'zod'

import { chatConfig } from '../config/chat'
import { visitorMessages } from './messages'
import { guardInput } from './boundary'
import type { HistoryMessage } from './prompt'

const historyMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(2000),
})

export const chatRequestSchema = z.object({
  // Batas panjang ditangani guardInput supaya pesannya konsisten (bukan error zod).
  message: z.string(),
  route: z.string().min(1).max(200),
  sessionId: z.string().min(8).max(64),
  turnCount: z.number().int().nonnegative().max(10_000),
  history: z.array(historyMessageSchema).max(50).optional(),
  recaptchaToken: z.string().max(4000).optional(),
})

export type ChatRequest = z.infer<typeof chatRequestSchema>

export type PreparedTurn =
  | { ok: true; question: string; route: string; sessionId: string; turnCount: number; history: HistoryMessage[]; recaptchaToken: string }
  | { ok: false; status: number; message: string }

export function prepareTurn(payload: unknown, maxInputChars?: number): PreparedTurn {
  const parsed = chatRequestSchema.safeParse(payload)
  if (!parsed.success) {
    // Payload cacat = bug klien, bukan kesalahan pengunjung: tetap pakai pesan tenang.
    return { ok: false, status: 400, message: visitorMessages.temporarilyUnavailable }
  }

  const limited = maxInputChars ?? chatConfig.limits.maxInputChars
  const guard = guardInput(parsed.data.message, limited)
  if (!guard.ok) return { ok: false, status: 400, message: guard.message }

  return {
    ok: true,
    question: guard.value,
    route: parsed.data.route,
    sessionId: parsed.data.sessionId,
    turnCount: parsed.data.turnCount,
    history: parsed.data.history ?? [],
    recaptchaToken: parsed.data.recaptchaToken ?? '',
  }
}
