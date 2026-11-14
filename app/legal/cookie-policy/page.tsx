import type { Metadata } from 'next'
import CookieSettingsButton from '@/components/CookieSettingsButton'
import MotionElement from '@/components/MotionElement'
import Divider from '../../../components/Divider';
import A from '../../../components/A';
import { client } from '@/sanity/lib/client'
import type { CookiePolicy } from '@/types/sanity.types'

// 1. const
const LAST_UPDATED = '11 Nov 2026'
const SUPPORT = "flex flex-col gap-8 max-w-250 items-center mt-8"
const SUPPORT_2 = "flex flex-col gap-4 max-w-280 items-center"
const UNORDERED_LIST_GRID = "grid sm:grid-cols-2 grid-cols-1 md:gap-x-24 gap-x-16 gap-y-8"

// 2. queries
const query = `*[_type == "cookiePolicy" && _id == "cookiePolicy"][0] {
  items[] {
    _key,
    label,
    description
  }
}`

// 3. metadata
export const metadata: Metadata = {
    title: "Cookie Policy",
    description: "What this site collects, which cookies it uses, and how to change your cookie consent.",
    alternates: {
        canonical: "/legal/cookie-policy",
    },
    openGraph: {
        url: "https://danielwijaya.com/legal/cookie-policy",
    },
}

// 4. render
export default async function CookiePolicy() {
    const cookiePolicy = await client.fetch<CookiePolicy>(query)

    return (
        <>
            <section id="cookie-policy" className="sm">

                <MotionElement variant="up" styles="flex flex-col gap-8 items-center w-full max-w-280">
                    <div className="flex flex-col gap-4 items-center">
                        <span className="btn-text text-(--gray)">Last updated: {LAST_UPDATED}</span>
                        <h1>Cookie Policy</h1>
                    </div>
                    <p className="text-center max-w-240">By default, analytics and tracking are disabled until you click “Accept”. You can <A title="change your preference" link="/legal/cookie-policy#cookie-settings" /> at any time. Essential data like theme preference are not collected, this site only collects information as seen below:</p>
                </MotionElement>
                <MotionElement as="ul" variant="up" del={0.5} styles={UNORDERED_LIST_GRID}>
                    {cookiePolicy.items.map((item) => (
                        <li key={item._key}>
                            <span className="text-(--white)">{item.label}</span> — {item.description}
                        </li>
                    ))}
                </MotionElement>
            </section>

            <section id="cookie-settings" className="sm pt-0">
                <Divider styles="w-full" />
                <MotionElement variant="up" del={0.5} styles={SUPPORT}>
                    <div className={SUPPORT_2}>
                        <span className="btn-text text-(--gray)">Preference</span>
                        <h2>Cookie Settings</h2>
                    </div>
                    <p className="text-center max-w-280">You can change your preferences by clicking the “Open Settings” button below.</p>
                    <div className="flex items-center justify-center py-20 border border-(--white)/15 w-full max-w-200">
                        <CookieSettingsButton />
                    </div>
                    <p className="text-center max-w-280">If you have any further questions, you can <A title="contact me" link="/contact" />.</p>
                </MotionElement>
            </section>
        </>
    )
}
