import { z } from 'zod'

if (typeof window !== 'undefined') {
  throw new Error('[config/chat] Modul ini hanya untuk server; jangan diimpor dari komponen client.')
}

function fail(key: string, value: unknown, expected: string): never {
  throw new Error(`[config/chat] Nilai env tidak valid: ${key}=${JSON.stringify(value)} — harus ${expected}`)
}

function envInt(key: string, fallback: number): number {
  const raw = process.env[key]
  if (raw === undefined || raw === '') return fallback
  const parsed = z.coerce.number().int().nonnegative().safeParse(raw)
  if (!parsed.success) fail(key, raw, 'bilangan bulat ≥ 0')
  return parsed.data as number
}

function envFloat(key: string, fallback: number): number {
  const raw = process.env[key]
  if (raw === undefined || raw === '') return fallback
  const parsed = z.coerce.number().nonnegative().safeParse(raw)
  if (!parsed.success) fail(key, raw, 'angka ≥ 0 (boleh desimal)')
  return parsed.data as number
}

function envBool(key: string, fallback: boolean): boolean {
  const raw = process.env[key]
  if (raw === undefined || raw === '') return fallback
  const normalized = raw.trim().toLowerCase()
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true
  if (['false', '0', 'no', 'off'].includes(normalized)) return false
  fail(key, raw, 'true/false (atau 1/0)')
}

function envStr(key: string, fallback: string): string {
  const raw = process.env[key]
  return raw === undefined ? fallback : raw.trim()
}

function envEnum<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  const raw = process.env[key]
  if (raw === undefined || raw === '') return fallback
  const value = raw.trim() as T
  if (!allowed.includes(value)) fail(key, raw, `salah satu dari: ${allowed.join(' | ')}`)
  return value
}

// ── Konfigurasi ───────────────────────────────────────────────────────────────

export const chatConfig = {
  limits: {
    maxInputChars: envInt('CHAT_MAX_INPUT_CHARS', 1000),
    maxOutputTokens: envInt('CHAT_MAX_OUTPUT_TOKENS', 500),
    maxHistoryMessages: envInt('CHAT_MAX_HISTORY_MESSAGES', 6),
    historyMessageMaxChars: envInt('CHAT_HISTORY_MESSAGE_MAX_CHARS', 400),
    maxTurnsPerSession: envInt('CHAT_MAX_TURNS_PER_SESSION', 8),
    requestTimeoutMs: envInt('CHAT_REQUEST_TIMEOUT_MS', 30000),
  },

  rateLimit: {
    store: envEnum('RATE_LIMIT_STORE', ['db', 'redis'] as const, 'db'),
    messagesPerMinute: envInt('CHAT_RL_MESSAGES_PER_MINUTE', 6),
    sessionsPerIpPerDay: envInt('CHAT_RL_SESSIONS_PER_IP_PER_DAY', 5),
    messagesPerIpPerDay: envInt('CHAT_RL_MESSAGES_PER_IP_PER_DAY', 25),
    dailyTurnCap: envInt('CHAT_DAILY_TURN_CAP', 80),
    eventsPerMinute: envInt('CHAT_RL_EVENTS_PER_MINUTE', 60),
  },

  budget: {
    dailyUsd: envFloat('CHAT_DAILY_BUDGET_USD', 0.15),
    monthlyUsd: envFloat('CHAT_MONTHLY_BUDGET_USD', 5),
    alertThreshold: envFloat('CHAT_BUDGET_ALERT_THRESHOLD', 0.8),
  },

  recaptcha: {
    enabled: envBool('CHAT_RECAPTCHA_ENABLED', true),
    minScore: envFloat('CHAT_RECAPTCHA_MIN_SCORE', 0.5),
    action: envStr('CHAT_RECAPTCHA_ACTION', 'chat'),
  },

  escalation: {
    whatsappNumber: envStr('WHATSAPP_NUMBER', ''),
    contactPath: envStr('CHAT_CONTACT_PATH', '/contact'),
  },

  data: {
    retentionDays: envInt('CHAT_RETENTION_DAYS', 0),
  },
} as const

export type ChatConfig = typeof chatConfig


if (chatConfig.budget.dailyUsd * 30 > chatConfig.budget.monthlyUsd * 1.2) {
  console.warn(
    `[config/chat] Breaker harian ($${chatConfig.budget.dailyUsd}) × 30 melebihi batas bulanan ($${chatConfig.budget.monthlyUsd}). ` +
      'Periksa CHAT_DAILY_BUDGET_USD / CHAT_MONTHLY_BUDGET_USD.',
  )
}

if (!chatConfig.escalation.whatsappNumber) {
  console.warn('[config/chat] WHATSAPP_NUMBER kosong — tombol eskalasi WhatsApp tidak akan tampil.')
}
