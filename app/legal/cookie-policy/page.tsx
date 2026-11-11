import type { Metadata } from 'next'
import CookieSettingsButton from '@/components/CookieSettingsButton'
import MotionElement from '@/components/MotionElement'
import Divider from '../../../components/Divider';
import A from '../../../components/A';

// 1. const
const LAST_UPDATED = '11 Nov 2026'
const SUPPORT = "flex flex-col gap-8 max-w-250 items-center mt-8"
const SUPPORT_2 = "flex flex-col gap-4 max-w-280 items-center"
const UNORDERED_LIST_GRID = "grid sm:grid-cols-2 grid-cols-1 md:gap-x-24 gap-x-16 gap-y-8"

// 2. queries

// 3. metadata
export const metadata: Metadata = {
    title: "Cookie Policy",
    description: "What this portfolio collects, which cookies it uses, and how to change or withdraw your consent choices.",
    alternates: {
        canonical: "/legal/cookie-policy",
    },
    openGraph: {
        url: "https://danielwijaya.com/legal/cookie-policy",
    },
}

// 4. render
export default function CookiePolicy() {
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
                    <li>
                        <span className="text-(--white)">Chat data.</span> When you use the chatbot, your message,
                        conversation history, and current page are sent to the configured AI provider to generate
                        a reply. Messages and technical metadata, including model and usage, are stored in Supabase
                        to operate the service and monitor costs. Do not share sensitive or confidential information.
                    </li>
                    <li>
                        <span className="text-(--white)">Analytics events.</span> Google Analytics and first-party
                        interaction events, such as opening the chat or clicking the WhatsApp button, are
                        enabled only after you accept analytics.
                    </li>
                    <li>
                        <span className="text-(--white)">Consent record.</span> What you chose, when you chose
                        it, and which version of this policy applied, is stored in a first-party cookie. A
                        consent-update record is also sent to the site's analytics database.
                    </li>
                    <li>
                        <span className="text-(--white)">Network and security data.</span> Rate limiting stores
                        a salted, one-way hash of your IP address. When you use reCAPTCHA, your IP address and
                        browser signals may also be sent to Google for bot protection.
                    </li>
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
