/**
 * Identitas sesi pengunjung — per tab, disimpan di sessionStorage (tanpa cookie
 * dan tanpa data pribadi). Dipakai widget chat, log consent, dan traffic analytics.
 */

const SESSION_KEY = 'chat:session-id'

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server'

  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing

    const created = crypto.randomUUID()
    window.sessionStorage.setItem(SESSION_KEY, created)
    return created
  } catch {
    return `fallback-${Date.now()}`
  }
}
