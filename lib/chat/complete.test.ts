import { describe, expect, it, vi } from 'vitest'

import { runCompletion } from './complete'
import { visitorMessages } from './messages'
import type { ModelProfile, ResolvedModel } from '@/lib/ai/providers'

const model: ModelProfile = {
  id: 'glm-5.3-flash',
  label: 'GLM 5.3 Flash',
  family: 'chat-completions',
  emitsReasoning: false,
  neverSendThinkingParam: true,
  streamUsageRequiresFlag: true,
  liveVerified: '2026-10-13',
}

const fallbackModel: ModelProfile = { ...model, id: 'deepseek-v4.1-flash' }

function resolved(withFallback: boolean): ResolvedModel {
  return {
    provider: {
      id: 'opencode',
      label: 'OpenCode',
      baseUrl: 'https://example.test/v1',
      chatPath: '/chat/completions',
      apiKeyEnv: 'X',
      models: {},
    },
    model,
    apiKey: 'kunci',
    endpoint: 'https://example.test/v1/chat/completions',
    fallback: withFallback
      ? { model: fallbackModel, apiKey: 'kunci', endpoint: 'https://example.test/v1/chat/completions' }
      : null,
  }
}

const messages = [{ role: 'user' as const, content: 'Halo' }]

function sseWith(content: string) {
  return `data: {"choices":[{"delta":{"content":${JSON.stringify(content)}},"finish_reason":"stop"}]}\n\ndata: {"choices":[],"usage":{"prompt_tokens":10,"completion_tokens":5,"cache_read_input_tokens":0}}\n\n`
}

describe('runCompletion', () => {
  it('mencoba ulang dengan model cadangan saat provider mengembalikan jawaban kosong', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(sseWith(''), { status: 200 }))
      .mockResolvedValueOnce(new Response(sseWith('Halo dari cadangan'), { status: 200 })) as unknown as typeof fetch

    const result = await runCompletion({ resolved: resolved(true), messages, send: () => {}, fetchImpl })

    expect(result.text).toBe('Halo dari cadangan')
    expect(result.usedFallback).toBe(true)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('memakai pesan ramah ketika jawaban kosong dan tidak ada model cadangan', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(sseWith(''), { status: 200 })) as unknown as typeof fetch

    const result = await runCompletion({ resolved: resolved(false), messages, send: () => {}, fetchImpl })

    expect(result.text).toBe('')
    expect(result.failureMessage).toBe(visitorMessages.emptyAnswer)
  })
})
