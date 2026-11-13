
import { getDb } from '@/db/client'
import { chatMessage, chatSession } from '@/db/schema'

export type PersistedTurn = {
  sessionId: string
  question: string
  answer: string
  pageUrl?: string | null
  provider: string
  model: string
  kbVersion: string
  tokensIn: number
  cachedTokensIn: number
  tokensOut: number
  costUsd: number
  latencyMs: number
  escalated: boolean
  recaptchaScore: number | null
}

export async function persistTurn(turn: PersistedTurn): Promise<void> {
  const db = getDb()

  await db
    .insert(chatSession)
    .values({ id: turn.sessionId, firstPage: turn.pageUrl ?? null })
    .onConflictDoNothing()

  const shared = {
    sessionId: turn.sessionId,
    pageUrl: turn.pageUrl ?? null,
    provider: turn.provider,
    model: turn.model,
    kbVersion: turn.kbVersion,
    tokensIn: turn.tokensIn,
    cachedTokensIn: turn.cachedTokensIn,
    tokensOut: turn.tokensOut,
    costUsd: turn.costUsd.toFixed(6),
    latencyMs: turn.latencyMs,
    escalated: turn.escalated,
    recaptchaScore: turn.recaptchaScore === null ? null : turn.recaptchaScore.toFixed(2),
  }

  await db.insert(chatMessage).values([
    { ...shared, role: 'user', content: turn.question },
    { ...shared, role: 'assistant', content: turn.answer },
  ])
}
