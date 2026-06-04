'use client'

import { useState, useRef } from 'react'
import { useTheme } from "@/context/ThemeProvider"
import Button from './Button'
import ReCAPTCHA from 'react-google-recaptcha'
import { Contact } from './IconLibrary'
import { contactFormSchema, type ContactApiResponse } from '@/lib/contact/schema'
import { envPublic } from '@/lib/env.public'

type FormState = {
    name: string;
    email: string;
    message: string;
    recaptcha: string;
}

type StatusType = 'idle' | 'sending' | 'success' | 'error'

function logicSubmitButton(a: StatusType) {
    if (a === 'sending') return 'Sending...'
    if (a === 'success') return 'Sent !'
    if (a === 'error') return 'Something wrong...'
    return 'Send Message'
}

const RECAPTCHA_SITE_KEY = envPublic.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

const peerInput = "peer pt-8.5 pb-3.5 placeholder-transparent"
const peerLabel = `absolute left-3 top-9 text-(--divider) transition-all duration-300 pointer-events-none
                   peer-focus:top-2 peer-focus:text-xs peer-focus:text-(--gray)
                   peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-(--gray)`

const ContactForm = ({ styles = "" }: { styles?: string }) => {
    const [form, setForm] = useState<FormState>({ name: '', email: '', message: '', recaptcha: '' })
    const [status, setStatus] = useState<StatusType>('idle')
    const [feedback, setFeedback] = useState<string>('')
    const recaptchaRef = useRef<ReCAPTCHA>(null)
    const { theme } = useTheme()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleRecaptcha = (token: string | null) => {
        setForm((prev) => ({ ...prev, recaptcha: token || '' }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('sending')

        const parsed = contactFormSchema.safeParse(form)
        if (!parsed.success) {
            setStatus('error')
            setFeedback(parsed.error.issues[0]?.message ?? 'Invalid input.')
            return
        }

        setStatus('sending')

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed.data),
            })
            const data = (await res.json()) as ContactApiResponse

            if (!res.ok || !data.success) {
                setStatus('error')
                setFeedback(data.message || 'Something went wrong. Please try again.')
                return
            }

            setStatus('success')
            setFeedback(data.message)
            setForm({ name: '', email: '', message: '', recaptcha: '' })
            recaptchaRef.current?.reset()
        } catch {
            setStatus('error')
            setFeedback('Connection issue detected. Please try again shortly.')
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex flex-col gap-8 w-full ${styles}`}
            aria-label="Contact form"
            role="form"
            autoComplete="on"
        >
            <div className="relative">
                <input
                    id="contact-name"
                    type="text"
                    name="name"
                    placeholder=""
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoFocus
                    aria-label="Full Name"
                    aria-required="true"
                    autoComplete="name"
                    className={peerInput}
                />
                <label
                    htmlFor="contact-name"
                    className={peerLabel}
                >
                    Full Name
                </label>
            </div>
            <div className="relative">
                <input
                    id="contact-email"
                    type="email"
                    name="email"
                    placeholder=""
                    value={form.email}
                    onChange={handleChange}
                    required
                    aria-label="Email address"
                    aria-required="true"
                    autoComplete="email"
                    className={peerInput}
                />
                <label
                    htmlFor="contact-email"
                    className={peerLabel}
                >
                    Your Email
                </label>
            </div>
            <div className="relative">
                <textarea
                    id="contact-message"
                    name="message"
                    placeholder=" "
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    aria-label="Your message"
                    aria-required="true"
                    autoComplete="off"
                    className={peerInput}
                />
                <label
                    htmlFor="contact-message"
                    className={peerLabel}
                >
                    Your Message
                </label>
            </div>
            {/* --- reCAPTCHA --- */}
            <div className="flex justify-start mt-4">
                <ReCAPTCHA
                    key={theme}
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    theme={theme}
                    onChange={handleRecaptcha}
                />
            </div>
            {feedback ? (
                <small aria-live="polite" className="text-(--white)">
                    {feedback}
                </small>
            ) : null}
            <Button
                title={logicSubmitButton(status)}
                additionalHoverLogic={status === "sending" || status === "success"}
                type="submit"
                disabled={status === 'sending' || status === 'success'}
                styles={`
                    relative bg-(--white) w-full px-6 h-12 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                    [clip-path:polygon(0_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%)]`}
                aria-label={logicSubmitButton(status)}
                aria-live="polite"
                icon={Contact}
            />
        </form>
    )
}

export default ContactForm