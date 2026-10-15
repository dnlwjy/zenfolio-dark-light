'use client'

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from 'react'

import {
  CONSENT_VERSION,
  clearAnalyticsCookies,
  parseConsent,
  readConsentRawCookie,
  writeConsentCookie,
  type ConsentState,
} from '@/lib/consent/consent'
import { sendEvent } from '@/lib/chat/events'
import { getOrCreateSessionId } from '@/lib/chat/session'

type ConsentSource = 'banner' | 'settings'

interface ConsentContextValue {
  /** null = pengunjung belum memilih — analytics dianggap OFF. */
  consent: ConsentState | null
  /** true hanya setelah hydration; banner tidak pernah dirender dari HTML server. */
  mounted: boolean
  bannerOpen: boolean
  saveConsent: (choice: { analytics: boolean }, source: ConsentSource) => void
  openPreferences: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

// ── Store kecil di atas cookie ────────────────────────────────────────────────
// Dibaca lewat useSyncExternalStore supaya SSR-aman (server snapshot = null),
// bebas hydration mismatch, dan tanpa setState di dalam effect. Cache menjaga
// referensi snapshot stabil (wajib bagi useSyncExternalStore).

const listeners = new Set<() => void>()
let cachedRaw: string | null | undefined
let cachedConsent: ConsentState | null = null

function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function consentSnapshot(): ConsentState | null {
  const raw = readConsentRawCookie()

  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedConsent = parseConsent(raw)
  }

  return cachedConsent
}

function emitConsentChange(): void {
  for (const listener of listeners) listener()
}

function consentServerSnapshot(): ConsentState | null {
  return null
}

const subscribeNoop = () => () => {}
const mountedSnapshot = () => true
const unmountedServerSnapshot = () => false

export default function ConsentProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const consent = useSyncExternalStore(subscribeConsent, consentSnapshot, consentServerSnapshot)
  const mounted = useSyncExternalStore(subscribeNoop, mountedSnapshot, unmountedServerSnapshot)
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  const saveConsent = useCallback((choice: { analytics: boolean }, source: ConsentSource) => {
    const previous = consentSnapshot()
    const next: ConsentState = { version: CONSENT_VERSION, analytics: choice.analytics, ts: Date.now() }

    writeConsentCookie(next)
    emitConsentChange()
    setPreferencesOpen(false)

    // Catatan akuntabilitas: selalu dikirim (tidak digating), berisi pilihan + versi kebijakan.
    sendEvent('consent_update', getOrCreateSessionId(), undefined, {
      version: next.version,
      analytics: next.analytics,
      source,
    })

    // Analytics dimatikan setelah sebelumnya aktif → hapus cookie GA lalu muat ulang,
    // supaya script GA benar-benar berhenti di halaman ini.
    if (previous?.analytics === true && !next.analytics) {
      clearAnalyticsCookies()
      window.location.reload()
    }
  }, [])

  const openPreferences = useCallback(() => setPreferencesOpen(true), [])

  const bannerOpen = preferencesOpen || consent === null

  const value = useMemo(
    () => ({ consent, mounted, bannerOpen, saveConsent, openPreferences }),
    [consent, mounted, bannerOpen, saveConsent, openPreferences],
  )

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export const useConsent = (): ConsentContextValue => {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used inside ConsentProvider')
  return ctx
}
