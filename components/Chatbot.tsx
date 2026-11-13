'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { m } from 'framer-motion'
import Button from './Button'
import { Chat, Close, Contact } from './IconLibrary'
import { useChatStream } from './chat/useChatStream'
import { CHATBOT_CONTENT, resolveGreeting, resolveSuggestedQuestions } from '@/lib/chat/content'
import { trackEvent } from '@/lib/chat/events'
import { getRecaptchaToken } from '@/lib/chat/recaptcha-client'
import { getOrCreateSessionId } from '@/lib/chat/session'
import { visitorMessages } from '@/lib/chat/messages'
import Tooltip from './Tooltip'
import { useConsent } from '@/context/ConsentProvider'

const SUPPORT = 'lg:h-14 lg:w-14 h-12 w-12'
const GREETING_DELAY_MS = 300

export interface ChatbotProps {
  whatsappNumber: string
  contactPath: string
  recaptchaSiteKey: string
  recaptchaAction: string
  styles?: string
}

export default function Chatbot({
  whatsappNumber,
  contactPath,
  recaptchaSiteKey,
  recaptchaAction,
  styles = '',
}: ChatbotProps) {
  const pathname = usePathname() ?? '/'
  const { bannerOpen } = useConsent()
  const [open, setOpen] = useState(false)
  const [mount, setMount] = useState(false)
  const [input, setInput] = useState('')
  const [greetingRoute, setGreetingRoute] = useState<string | null>(null)
  const sessionId = useMemo(() => getOrCreateSessionId(), [])
  const getToken = useCallback(() => getRecaptchaToken(recaptchaSiteKey, recaptchaAction), [recaptchaSiteKey, recaptchaAction])
  const { state, send, stop } = useChatStream({ route: pathname, sessionId, getToken })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const greeting = resolveGreeting(pathname)
  const questions = resolveSuggestedQuestions(pathname)

  useEffect(() => {
    if (!greeting) return

    const timer = window.setTimeout(() => {
      setGreetingRoute(pathname)
      trackEvent('greeting_shown', sessionId, pathname)
    }, GREETING_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [pathname, greeting, sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [state.bubbles])

  useEffect(() => {
    if (state.showEscalation) trackEvent('escalation_offered', sessionId, pathname)
  }, [state.showEscalation, sessionId, pathname])

  const handleToggleChatbot = () => {
    if (!mount) setMount(true)
    if (!open) trackEvent('chat_open', sessionId, pathname)

    setGreetingRoute(null)
    setOpen((previous) => !previous)
  }

  const handleSend = async (text: string) => {
    if (state.streaming || !text.trim()) return
    setInput('')
    trackEvent('message_sent', sessionId, pathname)
    await send(text.trim())
  }

  const whatsappHref = useMemo(() => {
    if (!whatsappNumber) return ''

    const page = pathname === '/' ? 'home' : pathname.replace(/^\//, '')
    const text = encodeURIComponent(CHATBOT_CONTENT.escalation.waMessageTemplate.replace('{page}', page))

    return `https://wa.me/${whatsappNumber}?text=${text}`
  }, [whatsappNumber, pathname])

  return (
    <div className={`${SUPPORT} ${styles} ${bannerOpen ? 'max-sm:hidden' : ''}`}>

      {/* greetings */}
      {greetingRoute === pathname && !open && (
        <Tooltip key={pathname} variant="bottomright" styles="flex flex-row absolute bottom-full right-0 mb-2 w-60 fade-in-theme-transition">
          {greeting}
          <button
            type="button"
            aria-label="Dismiss greeting"
            onClick={() => setGreetingRoute(null)}
            className="group text-(--gray) cursor-pointer"
          >
            <Close size={12} styles="group-hover:text-(--white) transition-colors duration-150" />
          </button>
        </Tooltip>
      )}

      {/* glowing effect */}
      <span className={`absolute inset-0 ${open ? '' : 'bg-(--white)/70 blur-lg animate-pulse [animation-duration:1s]'} rounded-full transition-all duration-800 pointer-events-none`} />

      <Button
        styles={`${SUPPORT} z-50`}
        icon={open ? Close : Chat}
        afterClickedLogic={open}
        aria-label={open ? 'Close chat' : 'Open chat'}
        click={handleToggleChatbot}
      />

      {mount && (
        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: open ? 1 : 0, y: open ? 0 : 24 }}
          aria-hidden={!open}
          className={`
            absolute text-[14px] leading-[135%] rounded-tl-2xl bottom-full mb-3 right-0 flex flex-col overflow-hidden bg-(--black) border border-(--white)/15
            w-[calc(100dvw-40px)] max-w-85 h-[calc(100dvh-170px)] max-h-140
            ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-6 flex flex-col gap-5" aria-live="polite">

            {/* greetings */}
            {state.bubbles.length === 0 && (
              <div className="flex items-start gap-3 self-start w-full">
                <div className="relative shrink-0 -top-1">
                  <Image src="/favicon.png" alt="" width={24} height={24} className="rounded-full border border-(--divider)" />
                </div>
                <p className="text-(--white)/70">{greeting}</p>
              </div>
            )}

            {state.bubbles.length === 0 && questions.length > 0 && (
              <div className="px-3 pb-2 flex flex-wrap gap-2">
                {questions.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => void handleSend(e)}
                    className="rounded-full border border-(--divider) px-3 py-1 text-[12px] cursor-pointer hover:bg-(--white)/10 transition-colors duration-150"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}

            {state.bubbles.map((bubble) => (
              <div key={bubble.id} className={`flex items-start gap-3 ${bubble.role === 'user' ? 'self-end w-[88%]' : 'self-start w-full'}`}>
                {bubble.role !== 'user' && (
                  <div className="relative shrink-0 -top-1">
                    <Image src="/favicon.png" alt="" width={24} height={24} className="rounded-full border border-(--divider)" />
                  </div>
                )}

                <p className={`p-3 py-2 rounded-lg wrap-break-word whitespace-pre-wrap ${bubble.role === 'user' ? 'bg-(--white) text-(--black) rounded-tr-none!' : 'text-(--white) p-0!'}`}>
                  {bubble.text || (bubble.pending ? '…' : '')}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {state.showEscalation && (
            <p className="px-3 pb-1 text-(--white)/80 text-[13px]">{CHATBOT_CONTENT.escalation.message}</p>
          )}

          {state.showEscalation && (
            <div className="px-3 pb-1 flex flex-wrap gap-2">
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('whatsapp_open', sessionId, pathname)}
                  className="rounded-md bg-(--white) px-3 py-2 text-(--black) text-[13px] font-medium flex items-center gap-2"
                >
                  {visitorMessages.escalation.cta}
                </a>
              )}

              <a
                href={contactPath}
                onClick={() => trackEvent('contact_link_click', sessionId, pathname)}
                className="rounded-md border border-(--divider) px-3 py-2 text-[13px]"
              >
                {visitorMessages.escalation.secondary}
              </a>
            </div>
          )}

          <div className="p-3 flex gap-3 items-end">
            <textarea
              className="flex-1"
              placeholder="Ask me anything..."
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void handleSend(input)
                }
              }}
            />

            {state.streaming ? (
              <Button icon={Close} aria-label="Stop response" type="button" styles="w-11 h-11" click={stop} />
            ) : (
              <Button icon={Contact} aria-label="Send question" type="button" styles="w-11 h-11" click={() => void handleSend(input)} />
            )}
          </div>
        </m.div>
      )}
    </div>
  )
}