/**
 * Menjalankan satu penyelesaian chat: coba model aktif, lalu model cadangan
 * bila kegagalannya layak dicoba ulang (model pensiun, gangguan upstream, jaringan).
 *
 * Mengembalikan teks jawaban, pemakaian token, biaya, dan pesan gagal yang tenang
 * sehingga route tidak perlu tahu detail provider.
 */

import { ProviderRequestError, streamChat } from '@/lib/ai/chat-completion'
import { classifyProviderFailure, visitorMessageForFailure } from '@/lib/ai/errors'
import { computeCost } from '@/lib/ai/pricing'
import type { ResolvedModel } from '@/lib/ai/providers'
import { chatConfig } from '@/lib/config/chat'
import { visitorMessages } from '@/lib/chat/messages'
import type { ChatMessage } from '@/lib/chat/prompt'

export type CompletionDone = {
  usage: { tokensIn: number; cachedTokensIn: number; tokensOut: number }
  costUsd: number
}

export type CompletionResult = {
  text: string
  usedFallback: boolean
  failureMessage?: string
  done: CompletionDone
}

async function attempt(
  resolved: ResolvedModel,
  messages: ChatMessage[],
  onDelta: (text: string) => void,
  fetchImpl?: typeof fetch,
): Promise<CompletionResult> {
  let text = ''
  const usage = { tokensIn: 0, cachedTokensIn: 0, tokensOut: 0 }

  for await (const event of streamChat({
    resolved,
    messages,
    maxOutputTokens: chatConfig.limits.maxOutputTokens,
    fetchImpl,
  })) {
    if (event.type === 'delta') {
      text += event.text
      onDelta(event.text)
      continue
    }

    if (event.type === 'usage') {
      usage.tokensIn = event.usage.tokensIn
      usage.cachedTokensIn = event.usage.cachedTokensIn
      usage.tokensOut = event.usage.tokensOut
    }
  }

  const cost = computeCost(resolved.provider.id, resolved.model.id, usage)
  return { text: text.trim(), usedFallback: false, done: { usage, costUsd: cost.usd } }
}

export async function runCompletion({
  resolved,
  messages,
  send,
  fetchImpl,
}: {
  resolved: ResolvedModel
  messages: ChatMessage[]
  send: (payload: unknown) => void
  fetchImpl?: typeof fetch
}): Promise<CompletionResult> {
  const onDelta = (text: string) => send({ type: 'delta', text })

  try {
    const first = await attempt(resolved, messages, onDelta, fetchImpl)

    // Provider kadang mengembalikan jawaban kosong (terlihat sekali saat eval):
    // coba sekali lagi dengan model cadangan sebelum menyerah ke pesan ramah.
    if (first.text) return first

    if (!resolved.fallback) return { ...first, failureMessage: visitorMessages.emptyAnswer }

    const retry: ResolvedModel = {
      provider: resolved.provider,
      model: resolved.fallback.model,
      apiKey: resolved.fallback.apiKey,
      endpoint: resolved.fallback.endpoint,
      fallback: null,
    }

    const second = await attempt(retry, messages, onDelta, fetchImpl)
    return second.text
      ? { ...second, usedFallback: true }
      : { ...second, usedFallback: true, failureMessage: visitorMessages.emptyAnswer }
  } catch (error) {
    const failure = classifyProviderFailure({
      status: error instanceof ProviderRequestError ? error.status : undefined,
      body: error instanceof ProviderRequestError ? error.body : undefined,
      error,
    })

    if (!failure.fallbackEligible || !resolved.fallback) {
      return { text: '', usedFallback: false, failureMessage: visitorMessageForFailure(failure.kind), done: { usage: { tokensIn: 0, cachedTokensIn: 0, tokensOut: 0 }, costUsd: 0 } }
    }

    const fallbackModel: ResolvedModel = {
      provider: resolved.provider,
      model: resolved.fallback.model,
      apiKey: resolved.fallback.apiKey,
      endpoint: resolved.fallback.endpoint,
      fallback: null,
    }

    try {
      const result = await attempt(fallbackModel, messages, onDelta, fetchImpl)
      return { ...result, usedFallback: true }
    } catch {
      return { text: '', usedFallback: true, failureMessage: visitorMessageForFailure(failure.kind), done: { usage: { tokensIn: 0, cachedTokensIn: 0, tokensOut: 0 }, costUsd: 0 } }
    }
  }
}
