
import { chatConfig } from '../config/chat'

const ENDPOINT = 'https://www.google.com/recaptcha/api/siteverify'

export type RecaptchaFailure = 'missing' | 'failed' | 'unavailable' | 'missing-score' | 'low-score' | 'action-mismatch'
export type RecaptchaVerdict = { ok: true; score: number | null } | { ok: false; reason: RecaptchaFailure }

export type VerifyArgs = {
  token: string
  remoteIp?: string
  fetchImpl?: typeof fetch
  config?: { enabled: boolean; minScore: number; action: string }
  secret?: string
  failOpen?: boolean
}

type GoogleResponse = { success?: boolean; score?: number; action?: string; 'error-codes'?: string[] }

export async function verifyRecaptcha(args: VerifyArgs): Promise<RecaptchaVerdict> {
  const config = args.config ?? {
    enabled: chatConfig.recaptcha.enabled,
    minScore: chatConfig.recaptcha.minScore,
    action: chatConfig.recaptcha.action,
  }

  if (!config.enabled) return { ok: true, score: null }

  const token = args.token.trim()
  if (!token) return { ok: false, reason: 'missing' }

  const secret = args.secret ?? process.env.RECAPTCHA_V3_SECRET_KEY ?? ''
  const fetcher = args.fetchImpl ?? fetch

  const body = new URLSearchParams({ secret, response: token })
  if (args.remoteIp) body.set('remoteip', args.remoteIp)

  const unavailable = (): RecaptchaVerdict =>
    args.failOpen === false ? { ok: false, reason: 'unavailable' } : { ok: true, score: null }

  let payload: GoogleResponse
  try {
    const response = await fetcher(ENDPOINT, { method: 'POST', body })
    if (!response.ok) return unavailable()
    payload = (await response.json()) as GoogleResponse
  } catch {
    return unavailable()
  }

  if (!payload.success) return { ok: false, reason: 'failed' }
  if (payload.action !== config.action) return { ok: false, reason: 'action-mismatch' }
  if (typeof payload.score !== 'number') return { ok: false, reason: 'missing-score' }
  if (payload.score < config.minScore) return { ok: false, reason: 'low-score' }

  return { ok: true, score: payload.score }
}
