'use client'

/**
 * Hook widget: mengirim pertanyaan ke `/api/chat` dan merawat keadaan percakapan.
 *
 * Semua keputusan tampilan berasal dari reducer murni (`lib/chat/stream-reducer.ts`)
 * yang diuji terpisah; hook ini hanya urusan jaringan.
 */

import { useCallback, useRef, useState } from 'react'

import { applyStreamEvent, sendUserMessage, type ChatState, type StreamEvent } from '@/lib/chat/stream-reducer'
import type { HistoryMessage } from '@/lib/chat/prompt'
import { visitorMessages } from '@/lib/chat/messages'

const INITIAL_STATE: ChatState = { bubbles: [], streaming: false, showEscalation: false }

export type UseChatStreamArgs = {
  route: string
  sessionId: string
  /** Pengambil token reCAPTCHA v3; dipanggil per pesan karena token sekali pakai. */
  getToken?: () => Promise<string>
  onEvent?: (event: StreamEvent) => void
}

export function useChatStream({ route, sessionId, getToken, onEvent }: UseChatStreamArgs) {
  const [state, setState] = useState<ChatState>(INITIAL_STATE)
  const abortRef = useRef<AbortController | null>(null)
  const historyRef = useRef<HistoryMessage[]>([])
  const turnRef = useRef(0)

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setState((current) => ({ ...current, streaming: false }))
  }, [])

  const send = useCallback(
    async (text: string) => {
      const messageId = `m-${Date.now()}`
      setState((current) => sendUserMessage(current, text, messageId))

      const controller = new AbortController()
      abortRef.current = controller
      let answer = ''

      const recaptchaToken = getToken ? await getToken().catch(() => '') : ''

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            route,
            sessionId,
            turnCount: turnRef.current,
            history: historyRef.current,
            recaptchaToken,
          }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          const payload = (await response.json().catch(() => null)) as { message?: string } | null
          setState((current) => applyStreamEvent(current, { type: 'error', message: payload?.message ?? visitorMessages.temporarilyUnavailable }))
          return
        }

        turnRef.current += 1

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n\n')
          buffer = parts.pop() ?? ''

          for (const part of parts) {
            const line = part.trim()
            if (!line.startsWith('data:')) continue

            let event: StreamEvent
            try {
              event = JSON.parse(line.slice(5).trim()) as StreamEvent
            } catch {
              continue
            }

            if (event.type === 'delta') answer += event.text

            setState((current) => applyStreamEvent(current, event))
            onEvent?.(event)
          }
        }

        historyRef.current = [...historyRef.current, { role: 'user', content: text }, { role: 'assistant', content: answer }]
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          if (answer) historyRef.current = [...historyRef.current, { role: 'user', content: text }, { role: 'assistant', content: answer }]
          return
        }

        setState((current) => applyStreamEvent(current, { type: 'error', message: visitorMessages.temporarilyUnavailable }))
      } finally {
        abortRef.current = null
      }
    },
    [route, sessionId, getToken, onEvent],
  )

  return { state, send, stop }
}
