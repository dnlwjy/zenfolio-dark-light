'use client'

import Link from 'next/link'
import Button from './Button'
import { useConsent } from '@/context/ConsentProvider'
import Tooltip from './Tooltip'

interface ConsentBannerProps {
  styles?: string;
}

const CookieBanner = ({
  styles = "",
}: ConsentBannerProps) => {
  const { mounted, bannerOpen, saveConsent } = useConsent()

  if (!mounted || !bannerOpen) return null

  return (
    <Tooltip styles={styles}>
      <p className="text-(--bodytext)">
        Optional analytics cookies help improve this site; chat, theme, and security work without them.{' '}
        <Link
          href="/legal/cookie-policy"
          className="underline hover:text-(--white) transition-colors duration-300"
        >
          Cookie policy
        </Link>
      </p>

      <div className="flex gap-2 w-full">
        <Button
          title="Accept"
          styles="w-full h-11! p-0!"
          click={() => saveConsent({ analytics: true }, 'banner')}
        />
        <Button
          title="Reject"
          variant="secondary"
          styles="w-full h-11! p-0!"
          click={() => saveConsent({ analytics: false }, 'banner')}
        />
      </div>
    </Tooltip>
  )
}

export default CookieBanner;