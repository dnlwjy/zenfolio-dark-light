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
  }
}

export function trackEvent(type: ClientEventType, sessionId: string, pageUrl?: string, meta?: Record<string, unknown>): void {
  if (!hasAnalyticsConsent()) return
  sendEvent(type, sessionId, pageUrl, meta)
}
