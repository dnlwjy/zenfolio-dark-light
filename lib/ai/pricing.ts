/**
 *
 * (OpenCode Console 2026-10-13, DeepSeek 2026-10-13, OpenAI 2026-10-13).
 *
 */

export type Price = {
  inputPerMillion: number
  cachedInputPerMillion: number
  outputPerMillion: number
}

export const priceTable: Record<string, Price> = {
  'opencode:deepseek-v4.1-flash': { inputPerMillion: 0.3, cachedInputPerMillion: 0.006, outputPerMillion: 1.2 },
  'opencode:glm-5.3-flash': { inputPerMillion: 0.15, cachedInputPerMillion: 0.03, outputPerMillion: 0.5 },
  'opencode:deepseek-v4-pro': { inputPerMillion: 1.74, cachedInputPerMillion: 0.145, outputPerMillion: 3.48 },
  'deepseek:deepseek-flash': { inputPerMillion: 0.15, cachedInputPerMillion: 0.003, outputPerMillion: 0.6 },
  'openai:gpt-5-nano': { inputPerMillion: 0.05, cachedInputPerMillion: 0.005, outputPerMillion: 0.4 },
  'openai:gpt-6-luna': { inputPerMillion: 0.1, cachedInputPerMillion: 0.01, outputPerMillion: 0.5 },
}

export type UsageTokens = {
  tokensIn: number
  cachedTokensIn: number
  tokensOut: number
}

export type CostBreakdown = {
  price: Price | null
  usd: number
  billableInputTokens: number
}

export function computeCost(providerId: string, modelId: string, usage: UsageTokens): CostBreakdown {
  const price = priceTable[`${providerId}:${modelId}`] ?? null
  const billableInputTokens = Math.max(0, usage.tokensIn - usage.cachedTokensIn)

  if (!price) return { price: null, usd: 0, billableInputTokens }

  const usd =
    (billableInputTokens * price.inputPerMillion +
      usage.cachedTokensIn * price.cachedInputPerMillion +
      usage.tokensOut * price.outputPerMillion) /
    1_000_000

  return { price, usd, billableInputTokens }
}
