'use client'

import { useConsent } from '@/context/ConsentProvider'

export default function ConsentSettingsButton() {
  const { openPreferences } = useConsent()

  return (
    <button
      type="button"
      onClick={openPreferences}
      className="underline hover:text-(--white) transition-colors duration-300"
    >
      Cookie settings
    </button>
  )
}
