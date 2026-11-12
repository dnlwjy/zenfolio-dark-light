/**
 * Pengirim event analitik dari sisi klien — fire-and-forget.
 *
 * Sengaja tidak pernah melempar error: kegagalan analitik tidak boleh mengganggu
 * pengalaman pengunjung.
 *
 * `trackEvent()` hanya mengirim bila pengunjung memberi consent analytics (cookie
 * `consent_v1`). `sendEvent()` sengaja tidak digating dan dipakai untuk catatan
 * akuntabilitas consent itu sendiri.
 */

import { hasAnalyticsConsent } from '@/lib/consent/consent'

export type ClientEventType =
  | 'page_view'
  | 'greeting_shown'
  | 'chat_open'
  | 'message_sent'
  | 'escalation_offered'
  | 'whatsapp_open'
  | 'contact_link_click'
  | 'consent_update'

export function sendEvent(type: ClientEventType, sessionId: string, pageUrl?: string, meta?: Record<string, unknown>): void {
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

export function trackEvent(type: ClientEventType, sessionId: string, pageUrl?: string, meta?: Record<string, unknown>): void {
  if (!hasAnalyticsConsent()) return
  sendEvent(type, sessionId, pageUrl, meta)
}
