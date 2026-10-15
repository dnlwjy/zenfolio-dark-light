'use client'

import Link from 'next/link'
import { useState } from 'react'

import Button from './Button'
import { useConsent } from '@/context/ConsentProvider'

export default function ConsentBanner() {
  const { mounted, bannerOpen, consent, saveConsent } = useConsent()
  const [customizing, setCustomizing] = useState(false)
  const [analyticsOn, setAnalyticsOn] = useState(false)

  if (!mounted || !bannerOpen) return null

  const startCustomizing = () => {
    setAnalyticsOn(consent?.analytics ?? false)
    setCustomizing(true)
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-(--white)/15 bg-(--black)/95 backdrop-blur-sm px-5 sm:px-24 py-2 sm:py-2.5"
    >
      <div className="mx-auto flex max-w-360 flex-col items-center justify-center gap-1.5 text-[13px] leading-[140%] text-(--white) sm:flex-row sm:gap-6 max-sm:pr-14">
        {customizing ? (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={analyticsOn}
              onChange={(event) => setAnalyticsOn(event.target.checked)}
              className="accent-(--white)"
            />
            <span className="text-[12px] sm:text-[13px]">Analytics — Google Analytics and first-party events (chat funnel, page views).</span>
          </label>
        ) : (
          <p className="text-center text-[12px] text-(--white)/80 sm:text-left sm:text-[13px]">
            Optional analytics cookies help improve this site; chat, theme, and security work without
            them.{' '}
            <Link
              href="/privacy"
              className="whitespace-nowrap underline hover:text-(--white) transition-colors duration-300"
            >
              Privacy &amp; cookies
            </Link>
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 sm:gap-2">
          {customizing ? (
            <>
              <Button
                title="Save choices"
                styles="px-3! h-9!"
                click={() => saveConsent({ analytics: analyticsOn }, 'banner')}
              />
              <button
                type="button"
                onClick={() => setCustomizing(false)}
                className="px-2 py-1 text-[12px] underline text-(--white)/70 hover:text-(--white) transition-colors duration-300 sm:text-[13px]"
              >
                Back
              </button>
            </>
          ) : (
            <>
              <Button
                title="Accept"
                styles="px-3! h-9!"
                click={() => saveConsent({ analytics: true }, 'banner')}
              />
              <Button
                title="Necessary"
                variant="secondary"
                styles="px-3! h-9!"
                click={() => saveConsent({ analytics: false }, 'banner')}
              />
              <button
                type="button"
                onClick={startCustomizing}
                className="px-2 py-1 text-[12px] underline text-(--white)/70 hover:text-(--white) transition-colors duration-300 sm:text-[13px]"
              >
                Customize
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
