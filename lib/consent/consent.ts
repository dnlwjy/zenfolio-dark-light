/**
 * Consent cookie first-party (kategori: necessary + analytics).
 *
 * Nilai disimpan sebagai JSON ter-encode di cookie `consent_v1`. Versi ikut di nama
 * cookie supaya menaikkan `CONSENT_VERSION` otomatis meminta persetujuan ulang.
 * Cookie sengaja client-readable (bukan httpOnly) karena gating GA dilakukan di klien.
 */

export const CONSENT_COOKIE = 'consent_v1'
export const CONSENT_VERSION = 1
/** 180 hari. */
export const CONSENT_MAX_AGE_SECONDS = 15_552_000

export interface ConsentState {
  version: number
  analytics: boolean
  ts: number
}

export function parseConsent(raw: string | null | undefined): ConsentState | null {
  if (!raw) return null

  try {
    const value: unknown = JSON.parse(decodeURIComponent(raw))
    if (typeof value !== 'object' || value === null) return null

    const { version, analytics, ts } = value as Record<string, unknown>
    if (version !== CONSENT_VERSION) return null
    if (typeof analytics !== 'boolean') return null
    if (typeof ts !== 'number' || !Number.isFinite(ts)) return null

    return { version, analytics, ts }
  } catch {
    return null
  }
}

export function serializeConsent(state: ConsentState): string {
  return encodeURIComponent(JSON.stringify(state))
}

function secureSuffix(): string {
  return typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
}

/** Domain induk untuk menghapus cookie GA yang diset sebagai domain-cookie; null untuk localhost/IP. */
function deletionDomain(): string | null {
  if (typeof window === 'undefined') return null

  const host = window.location.hostname
  if (host === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null

  const parts = host.split('.')
  if (parts.length < 2) return null

  return `.${parts.slice(-2).join('.')}`
}

/** Nilai mentah cookie consent (null bila absen) — dipakai sebagai kunci cache snapshot. */
export function readConsentRawCookie(): string | null {
  if (typeof document === 'undefined') return null

  const prefix = `${CONSENT_COOKIE}=`
  const match = document.cookie.split('; ').find((row) => row.startsWith(prefix))
  return match ? match.slice(prefix.length) : null
}

export function readConsentCookie(): ConsentState | null {
  return parseConsent(readConsentRawCookie())
}

export function writeConsentCookie(state: ConsentState): void {
  if (typeof document === 'undefined') return

  document.cookie = `${CONSENT_COOKIE}=${serializeConsent(state)}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secureSuffix()}`
}

export function hasAnalyticsConsent(): boolean {
  return readConsentCookie()?.analytics === true
}

/** Menghapus cookie Google Analytics (`_ga`, `_ga_*`) — dipakai saat consent analytics dicabut. */
export function clearAnalyticsCookies(): void {
  if (typeof document === 'undefined') return

  const domain = deletionDomain()

  for (const row of document.cookie.split('; ')) {
    const name = row.split('=')[0]
    if (name !== '_ga' && !name.startsWith('_ga_')) continue

    // GA4 bisa menyetel host-only atau domain-cookie; hapus keduanya agar benar-benar bersih.
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secureSuffix()}`
    if (domain) document.cookie = `${name}=; Domain=${domain}; Path=/; Max-Age=0; SameSite=Lax${secureSuffix()}`
  }
}
