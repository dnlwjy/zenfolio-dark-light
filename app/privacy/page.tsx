import type { Metadata } from 'next'

import ConsentSettingsButton from '@/components/ConsentSettingsButton'
import MotionElement from '@/components/MotionElement'

// 1. const
const LAST_UPDATED = '15 October 2026'
const SUPPORT_2 = "flex flex-col gap-4 max-w-280 items-center"
const COOKIE_ROWS = [
    { name: 'consent_v1', purpose: 'Remembers your cookie choices and the policy version they apply to', category: 'Strictly necessary', lifetime: '180 days' },
    { name: '_ga, _ga_*', purpose: 'Google Analytics — anonymous statistics about pages visited and interactions', category: 'Analytics (consent)', lifetime: 'Up to 13 months' },
    { name: '_GRECAPTCHA (and related)', purpose: 'Google reCAPTCHA bot protection — only loaded when you use the contact form or the chatbot', category: 'Strictly necessary (security)', lifetime: 'Up to 6 months' },
]

// 2. queries

// 3. metadata
export const metadata: Metadata = {
    title: "Privacy & Cookies",
    description: "What this portfolio collects, which cookies it uses, and how to change or withdraw your consent choices.",
    alternates: {
        canonical: "/privacy",
    },
    openGraph: {
        url: "https://danielwijaya.com/privacy",
    },
}

// 4. render
export default function Privacy() {
    return (
        <section id="privacy" className="sm">

            <MotionElement variant="up" styles="flex flex-col gap-8 items-center w-full max-w-280">
                <div className="flex flex-col gap-4 items-center">
                    <span className="btn-text text-(--gray)">Privacy</span>
                    <h2>Privacy &amp; Cookies</h2>
                </div>
                <p className="text-center max-w-240">
                    This page explains what this site collects, which cookies it uses, and how you can change
                    your choices. The short version: everything is first-party and minimal, and nothing
                    optional runs without your consent. Last updated: {LAST_UPDATED}.
                </p>
            </MotionElement>

            <MotionElement variant="up" del={0.5} styles={SUPPORT_2}>
                <h3 className="text-center">What this site collects</h3>
                <ul className="flex flex-col gap-4 max-w-240">
                    <li>
                        <span className="text-(--white)">Chat messages.</span> When you use the chatbot, your
                        messages — together with page context and technical metadata such as response time and
                        cost — are stored to answer your question, improve the assistant, and prevent abuse.
                    </li>
                    <li>
                        <span className="text-(--white)">Analytics events.</span> Only if you accept analytics:
                        the pages you visit and interactions such as opening the chat or clicking the WhatsApp
                        button, so I can understand what works and what does not.
                    </li>
                    <li>
                        <span className="text-(--white)">Consent record.</span> What you chose, when you chose
                        it, and which version of this policy applied, so your choice can be honored and proven.
                    </li>
                    <li>
                        <span className="text-(--white)">Hashed IP address.</span> Rate limiting uses a salted
                        hash of your IP address (16 characters, one-way). The raw IP address is never stored.
                    </li>
                </ul>
            </MotionElement>

            <MotionElement variant="up" del={0.5} styles={SUPPORT_2}>
                <h3 className="text-center">Cookies</h3>
                <div className="w-full max-w-280 overflow-x-auto">
                    <table className="w-full text-left text-[14px]">
                        <thead>
                            <tr className="border-b border-(--divider) text-(--gray)">
                                <th className="py-3 pr-4 font-normal">Name</th>
                                <th className="py-3 pr-4 font-normal">Purpose</th>
                                <th className="py-3 pr-4 font-normal">Category</th>
                                <th className="py-3 font-normal">Lifetime</th>
                            </tr>
                        </thead>
                        <tbody>
                            {COOKIE_ROWS.map((row) => (
                                <tr key={row.name} className="border-b border-(--divider)/60 align-top">
                                    <td className="py-3 pr-4 text-(--white) whitespace-nowrap">{row.name}</td>
                                    <td className="py-3 pr-4">{row.purpose}</td>
                                    <td className="py-3 pr-4 whitespace-nowrap">{row.category}</td>
                                    <td className="py-3 whitespace-nowrap">{row.lifetime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-center max-w-240">
                    Other browser storage is not used for tracking: your light/dark theme preference
                    (localStorage) and a per-tab chat session identifier (sessionStorage) that disappears when
                    the tab closes. Both are functional, first-party, and contain no personal data.
                </p>
            </MotionElement>

            <MotionElement variant="up" del={0.5} styles={SUPPORT_2}>
                <h3 className="text-center">Your choices</h3>
                <p className="text-center max-w-240">
                    Analytics cookies are off until you accept them, and you can change or withdraw your choice
                    at any time — use the button below or <span className="text-(--white)">&ldquo;Cookie settings&rdquo;</span> in
                    the footer. Withdrawing analytics deletes the Google Analytics cookies and stops the tag
                    from loading on your next visit. Declining never limits the site: the chatbot, the contact
                    form, and everything else keep working.
                </p>
                <ConsentSettingsButton />
            </MotionElement>

            <MotionElement variant="up" del={0.5} styles={SUPPORT_2}>
                <h3 className="text-center">Questions</h3>
                <p className="text-center max-w-240">
                    If you have questions about this policy or would like your chat data removed, reach me
                    through the <a href="/contact">contact page</a>.
                </p>
            </MotionElement>
        </section>
    )
}
