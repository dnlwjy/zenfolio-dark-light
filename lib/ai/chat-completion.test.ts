import { describe, expect, it, vi } from 'vitest'

import { ProviderRequestError, buildRequestBody, streamChat } from './chat-completion'
import type { ChatStreamEvent } from './chat-completion'
import type { ModelProfile, ResolvedModel } from './providers'

const model: ModelProfile = {
  id: 'glm-5.3-flash',
  label: 'GLM 5.3 Flash',
  family: 'chat-completions',
  emitsReasoning: false,
  neverSendThinkingParam: true,
  streamUsageRequiresFlag: true,
  maxTokensParam: 'max_tokens',
  liveVerified: '2026-10-13',
}

const resolved: ResolvedModel = {
  provider: { id: 'opencode', label: 'OpenCode', baseUrl: 'https://example.test/v1', chatPath: '/chat/completions', apiKeyEnv: 'X', models: {} },
  model,
  apiKey: 'kunci-uji',
  endpoint: 'https://example.test/v1/chat/completions',
  fallback: null,
}

const messages = [{ role: 'user' as const, content: 'Halo' }]

describe('buildRequestBody', () => {
  it('tidak mengirim parameter thinking untuk model yang melarangnya', () => {
    const body = buildRequestBody({ model, messages, maxOutputTokens: 500 })

    expect(body).toMatchObject({ model: 'glm-5.3-flash', max_tokens: 500, stream: true })
    expect(body.stream_options).toEqual({ include_usage: true })
    expect('thinking' in body).toBe(false)
  })

  it('memakai max_completion_tokens untuk model OpenAI terbaru', () => {
    const body = buildRequestBody({
      model: { ...model, id: 'gpt-6-luna', maxTokensParam: 'max_completion_tokens' },
      messages,
      maxOutputTokens: 321,
    })

    expect(body.max_completion_tokens).toBe(321)
    expect('max_tokens' in body).toBe(false)
  })

  it('mengirim thinking disabled hanya untuk model yang mengizinkan', () => {
    const body = buildRequestBody({
      model: { ...model, id: 'deepseek-flash', neverSendThinkingParam: false },
      messages,
      maxOutputTokens: 100,
    })

    expect(body.thinking).toEqual({ type: 'disabled' })
  })
})

const sseStream = [
  'data: {"choices":[{"delta":{"reasoning_content":"berpikir keras"}}]}',
  '',
  'data: {"choices":[{"delta":{"content":"Halo"}}]}',
  '',
  'data: {"choices":[{"delta":{"content":" dunia"},"finish_reason":"stop"}]}',
  '',
  'data: {"choices":[],"usage":{"prompt_tokens":10,"completion_tokens":5,"cache_read_input_tokens":4}}',
  '',
  '',
].join('\n')

function fakeFetch(status: number, body: string) {
  return vi.fn(async () => new Response(body, { status, headers: { 'content-type': 'text/event-stream' } })) as unknown as typeof fetch
}

describe('streamChat', () => {
  it('menggabungkan konten dan mengabaikan token penalaran', async () => {
    const events: ChatStreamEvent[] = []

    for await (const event of streamChat({ resolved, messages, maxOutputTokens: 500, fetchImpl: fakeFetch(200, sseStream) })) {
      events.push(event)
    }

    const text = events.map((event) => (event.type === 'delta' ? event.text : '')).join('')

    expect(text).toBe('Halo dunia')
    expect(JSON.stringify(events)).not.toContain('berpikir')
    expect(events).toContainEqual({ type: 'usage', usage: { tokensIn: 10, cachedTokensIn: 4, tokensOut: 5 } })
    expect(events).toContainEqual({ type: 'finish', finishReason: 'stop' })
  })

  it('melempar ProviderRequestError saat provider menolak', async () => {
    const consume = async () => {
      for await (const event of streamChat({ resolved, messages, maxOutputTokens: 500, fetchImpl: fakeFetch(402, '{"error":{"message":"Insufficient Balance"}}') })) {
        void event
      }
    }

    await expect(consume()).rejects.toBeInstanceOf(ProviderRequestError)
  })
})
