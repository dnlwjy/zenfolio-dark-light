import { afterEach, describe, expect, it } from 'vitest'

import { resolveModelById } from './providers'

const originalOpenAi = process.env.OPENAI_API_KEY
const originalOpenCode = process.env.OPENCODE_API_KEY

afterEach(() => {
  if (originalOpenAi === undefined) delete process.env.OPENAI_API_KEY
  else process.env.OPENAI_API_KEY = originalOpenAi

  if (originalOpenCode === undefined) delete process.env.OPENCODE_API_KEY
  else process.env.OPENCODE_API_KEY = originalOpenCode
})

describe('resolveModelById', () => {
  it('mendukung cadangan dari provider yang berbeda', () => {
    process.env.OPENAI_API_KEY = 'sk-uji'
    process.env.OPENCODE_API_KEY = 'oc-uji'

    const resolved = resolveModelById('openai', 'gpt-6-luna', { providerId: 'opencode', modelId: 'glm-5.3-flash' })

    expect(resolved.endpoint).toContain('api.openai.com')
    expect(resolved.model.id).toBe('gpt-6-luna')
    expect(resolved.fallback?.endpoint).toContain('opencode.ai')
    expect(resolved.fallback?.apiKey).toBe('oc-uji')
  })

  it('memberi pesan jelas untuk model yang tidak terdaftar', () => {
    process.env.OPENAI_API_KEY = 'sk-uji'

    expect(() => resolveModelById('openai', 'model-hantu')).toThrow(/tidak terdaftar/)
  })

  it('mewajibkan env key provider yang dipakai', () => {
    delete process.env.OPENAI_API_KEY

    expect(() => resolveModelById('openai', 'gpt-6-luna')).toThrow(/OPENAI_API_KEY/)
  })
})
