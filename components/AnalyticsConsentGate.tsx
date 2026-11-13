'use client'

import { GoogleAnalytics } from '@next/third-parties/google'

import { useConsent } from '@/context/ConsentProvider'

export default function AnalyticsConsentGate({ gaId }: { gaId: string }) {
  const { consent } = useConsent()

  if (consent?.analytics !== true) return null

  return <GoogleAnalytics gaId={gaId} />
}
