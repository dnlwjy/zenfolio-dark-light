import { chatConfig } from '../config/chat'
import { visitorMessages } from './messages'

export type RateLimitStore = {
  incr(key: string, windowMs: number, now: number): Promise<number>
}

export function createMemoryRateLimitStore(): RateLimitStore {
  const buckets = new Map<string, { count: number; windowStart: number }>()

  return {
    async incr(key, windowMs, now) {
      const bucket = buckets.get(key)
      if (!bucket || now - bucket.windowStart >= windowMs) {
        buckets.set(key, { count: 1, windowStart: now })
        return 1
      }

      bucket.count += 1
      return bucket.count
    },
  }
}

const MINUTE_MS = 60_000
const DAY_MS = 86_400_000

const defaultLimits = {
  messagesPerMinute: chatConfig.rateLimit.messagesPerMinute,
  sessionsPerIpPerDay: chatConfig.rateLimit.sessionsPerIpPerDay,
  messagesPerIpPerDay: chatConfig.rateLimit.messagesPerIpPerDay,
  maxTurnsPerSession: chatConfig.limits.maxTurnsPerSession,
}

export type LimitReason = 'per-minute' | 'per-session' | 'per-ip-day' | 'per-ip-sessions'
export type LimitDecision = { allowed: true } | { allowed: false; reason: LimitReason; message: string }

export type LimitInput = {
  store: RateLimitStore
  sessionId: string
  ipHash: string
  turnCount: number
  now?: number
  limits?: typeof defaultLimits
}

export type SessionLimitInput = {
  store: RateLimitStore
  ipHash: string
  sessionId: string
  now?: number
  limits?: typeof defaultLimits
}

function dayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10)
}

export async function checkMessageLimits(input: LimitInput): Promise<LimitDecision> {
  const now = input.now ?? Date.now()
  const limits = input.limits ?? defaultLimits

  if (input.turnCount >= limits.maxTurnsPerSession) {
    return { allowed: false, reason: 'per-session', message: visitorMessages.sessionLimit }
  }

  const minuteCount = await input.store.incr(`min:${input.sessionId}`, MINUTE_MS, now)
  if (minuteCount > limits.messagesPerMinute) {
    return { allowed: false, reason: 'per-minute', message: visitorMessages.slowDown }
  }

  const ipCount = await input.store.incr(`ipday:${input.ipHash}:${dayKey(now)}`, DAY_MS, now)
  if (ipCount > limits.messagesPerIpPerDay) {
    return { allowed: false, reason: 'per-ip-day', message: visitorMessages.slowDown }
  }

  return { allowed: true }
}

export async function checkSessionLimit(input: SessionLimitInput): Promise<LimitDecision> {
  const now = input.now ?? Date.now()
  const limits = input.limits ?? defaultLimits

  const seen = await input.store.incr(`sessionseen:${input.sessionId}`, DAY_MS, now)
  if (seen > 1) return { allowed: true }

  const sessions = await input.store.incr(`ipsessions:${input.ipHash}:${dayKey(now)}`, DAY_MS, now)
  if (sessions > limits.sessionsPerIpPerDay) {
    return { allowed: false, reason: 'per-ip-sessions', message: visitorMessages.slowDown }
  }

  return { allowed: true }
}
