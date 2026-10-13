/**
 * Pengirim event analitik dari sisi klien — fire-and-forget.
 *
 * Sengaja tidak pernah melempar error: kegagalan analitik tidak boleh mengganggu
 * pengalaman pengunjung.
 */

export type ClientEventType =
  | 'page_view'
  | 'greeting_shown'
  | 'chat_open'
  | 'message_sent'
  | 'escalation_offered'
  | 'whatsapp_open'
  | 'contact_link_click'

export function trackEvent(type: ClientEventType, sessionId: string, pageUrl?: string, meta?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return

  const body = JSON.stringify({ type, sessionId, pageUrl: pageUrl ?? window.location.pathname, meta })

  try {
    void fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined)
  } catch {
    /* diabaikan */
  }
}
