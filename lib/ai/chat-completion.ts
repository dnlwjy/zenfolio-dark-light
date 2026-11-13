import type { ChatMessage } from '../chat/prompt'
import type { UsageTokens } from './pricing'
import type { ModelProfile, ResolvedModel } from './providers'

export class ProviderRequestError extends Error {
  readonly status: number
  readonly body: string

  constructor(status: number, body: string) {
    super(`provider request failed with status ${status}`)
    this.name = 'ProviderRequestError'
    this.status = status
    this.body = body
  }
}

export type ChatStreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'usage'; usage: UsageTokens }
  | { type: 'finish'; finishReason: string }

export function buildRequestBody({
  model,
  messages,
  maxOutputTokens,
}: {
  model: ModelProfile
  messages: ChatMessage[]
  maxOutputTokens: number
}): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: model.id,
    messages,
    [model.maxTokensParam]: maxOutputTokens,
    stream: true,
  }

  if (model.streamUsageRequiresFlag) body.stream_options = { include_usage: true }
  if (!model.neverSendThinkingParam) body.thinking = { type: 'disabled' }

  return body
}

export async function* streamChat({
  resolved,
  messages,
  maxOutputTokens,
  signal,
  fetchImpl,
}: {
  resolved: ResolvedModel
  messages: ChatMessage[]
  maxOutputTokens: number
  signal?: AbortSignal
  fetchImpl?: typeof fetch
}): AsyncGenerator<ChatStreamEvent> {
  const fetcher = fetchImpl ?? fetch

  const response = await fetcher(resolved.endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${resolved.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(buildRequestBody({ model: resolved.model, messages, maxOutputTokens })),
    signal,
  })

  if (!response.ok || !response.body) {
    throw new ProviderRequestError(response.status, await response.text().catch(() => ''))
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue

      const raw = trimmed.slice(5).trim()
      if (!raw) continue
      let chunk: unknown
      try {
        chunk = JSON.parse(raw)
      } catch {
        continue
      }
      const parsed = chunk as {
        choices?: Array<{ delta?: { content?: string }; finish_reason?: string }>
        usage?: { prompt_tokens?: number; completion_tokens?: number; cache_read_input_tokens?: number }
      }
      const choice = parsed.choices?.[0]
      const content = choice?.delta?.content

      if (typeof content === 'string' && content.length > 0) yield { type: 'delta', text: content }
      if (choice?.finish_reason) yield { type: 'finish', finishReason: choice.finish_reason }
      if (parsed.usage) {
        yield {
          type: 'usage',
          usage: {
            tokensIn: parsed.usage.prompt_tokens ?? 0,
            cachedTokensIn: parsed.usage.cache_read_input_tokens ?? 0,
            tokensOut: parsed.usage.completion_tokens ?? 0,
          },
        }
      }
    }
  }
}
