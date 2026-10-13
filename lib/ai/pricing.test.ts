import { describe, expect, it } from 'vitest'

import { computeCost } from './pricing'

describe('computeCost', () => {
  it('menghitung input penuh, cache read, dan output sesuai tabel harga', () => {
    const result = computeCost('opencode', 'glm-5.3-flash', { tokensIn: 6000, cachedTokensIn: 5500, tokensOut: 350 })

    expect(result.billableInputTokens).toBe(500)
    // 500 × 0.15 + 5500 × 0.03 + 350 × 0.50 (per 1 juta token)
    expect(result.usd).toBeCloseTo((500 * 0.15 + 5500 * 0.03 + 350 * 0.5) / 1_000_000, 10)
  })

  it('mengembalikan price null untuk model yang tidak ada di tabel', () => {
    const result = computeCost('opencode', 'model-tak-dikenal', { tokensIn: 10, cachedTokensIn: 0, tokensOut: 1 })

    expect(result.price).toBeNull()
    expect(result.usd).toBe(0)
  })
})
