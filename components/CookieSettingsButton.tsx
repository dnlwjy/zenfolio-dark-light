'use client'

import Button from './Button'
import { useConsent } from '@/context/ConsentProvider'

export default function CookieSettingsButton() {
  const { mounted, bannerOpen, openPreferences } = useConsent()
  const disabled = !mounted || bannerOpen

  return (
    <Button
      title="Open Settings"
      variant={disabled ? 'disabled' : 'primary'}
      click={disabled ? undefined : openPreferences}
    />
  )
}
