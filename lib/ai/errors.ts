/**
 * Klasifikasi kegagalan provider → perilaku aplikasi + pesan pengunjung.
 *
 * Latar belakang (hasil uji live 2026-10-13 terhadap OpenCode Console):
 * - model yang sudah pensiun ternyata masih terdaftar di /v1/models → 404 "Endpoint is unavailable"
 * - model free tier ditolak dari luar aplikasi OpenCode → 403 FreeTierError
 * - permintaan dengan parameter tidak didukung → 400 invalid_request_error
 * Semua bentuk itu harus berakhir sebagai pesan manusia yang tenang, bukan stack trace.
 *
 * `adminDetail` hanya untuk log server; pengunjung tidak pernah melihatnya.
 */

import { visitorMessages } from '../chat/messages'

export type ProviderFailureKind =
  | 'insufficient_credits'
  | 'rate_limited'
  | 'model_unavailable'
  | 'auth'
  | 'timeout'
  | 'network'
  | 'bad_request'
  | 'upstream'
  | 'unknown'

export type ProviderFailure = {
  kind: ProviderFailureKind
  /** Boleh dicoba ulang (ke model yang sama atau model cadangan). */
  retryable: boolean
  /** Boleh dicoba ke model cadangan di registry. */
  fallbackEligible: boolean
  adminDetail: string
  status?: number
}

type RawFailure = {
  status?: number
  body?: string
  error?: unknown
}

function readProviderErrorBody(body: string | undefined): { type: string; message: string } {
  if (!body) return { type: '', message: '' }

  try {
    const parsed = JSON.parse(body) as { error?: { type?: string; message?: string } | string; message?: string }
    if (typeof parsed.error === 'string') return { type: '', message: parsed.error }
    return { type: parsed.error?.type ?? '', message: parsed.error?.message ?? parsed.message ?? '' }
  } catch {
    return { type: '', message: body.slice(0, 300) }
  }
}

export function classifyProviderFailure({ status, body, error }: RawFailure): ProviderFailure {
  const { type, message } = readProviderErrorBody(body)
  const haystack = `${type} ${message}`.toLowerCase()

  if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
    return { kind: 'timeout', retryable: true, fallbackEligible: false, adminDetail: error.message, status }
  }

  if (haystack.includes('insufficient') || haystack.includes('balance') || haystack.includes('credit') || haystack.includes('quota')) {
    return { kind: 'insufficient_credits', retryable: false, fallbackEligible: false, adminDetail: message || type, status }
  }

  if (haystack.includes('ratelimit') || haystack.includes('rate limit') || haystack.includes('too many requests')) {
    return { kind: 'rate_limited', retryable: true, fallbackEligible: false, adminDetail: message || type, status }
  }

  if (haystack.includes('unavailable') || haystack.includes('does not exist') || haystack.includes('not found') || haystack.includes('retired')) {
    return { kind: 'model_unavailable', retryable: true, fallbackEligible: true, adminDetail: message || type, status }
  }

  if (haystack.includes('freetier') || haystack.includes('unauthorized') || haystack.includes('invalid api key') || haystack.includes('authentication')) {
    return { kind: 'auth', retryable: false, fallbackEligible: false, adminDetail: message || type, status }
  }

  if (haystack.includes('invalid_request') || haystack.includes('unsupported') || haystack.includes('not supported')) {
    return { kind: 'bad_request', retryable: false, fallbackEligible: false, adminDetail: message || type, status }
  }

  if (status === 402) {
    return { kind: 'insufficient_credits', retryable: false, fallbackEligible: false, adminDetail: message || type, status }
  }
  if (status === 429) {
    return { kind: 'rate_limited', retryable: true, fallbackEligible: false, adminDetail: message || type, status }
  }
  if (status === 401 || status === 403) {
    return { kind: 'auth', retryable: false, fallbackEligible: false, adminDetail: message || type, status }
  }
  if (status === 404 || status === 410) {
    return { kind: 'model_unavailable', retryable: true, fallbackEligible: true, adminDetail: message || type, status }
  }
  if (status === 400 || status === 422) {
    return { kind: 'bad_request', retryable: false, fallbackEligible: false, adminDetail: message || type, status }
  }
  if (status && status >= 500) {
    return { kind: 'upstream', retryable: true, fallbackEligible: true, adminDetail: message || type, status }
  }
  if (!status) {
    return { kind: 'network', retryable: true, fallbackEligible: true, adminDetail: message || type }
  }

  return { kind: 'unknown', retryable: true, fallbackEligible: true, adminDetail: message || type, status }
}

/** Pesan yang ditampilkan ke pengunjung — tidak pernah menyebut teknis/limit/kredit. */
export function visitorMessageForFailure(kind: ProviderFailureKind): string {
  if (kind === 'rate_limited') return visitorMessages.slowDown
  return visitorMessages.temporarilyUnavailable
}
