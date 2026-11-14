/**
 * Event contract follows the `/api/chat` protocol:
 *   { type: 'delta', text } · { type: 'done', escalated?, usage?, costUsd? } · { type: 'error', message }
 */

export type ChatBubble = {
  id: string
  role: 'user' | 'assistant'
  text: string
  pending: boolean
  showEscalation: boolean
}

export type ChatState = {
  bubbles: ChatBubble[]
  streaming: boolean
}

export type StreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'done'; usage?: { tokensIn: number; cachedTokensIn: number; tokensOut: number }; costUsd?: number; escalated?: boolean }
  | { type: 'error'; message: string }

export function sendUserMessage(state: ChatState, text: string, messageId: string): ChatState {
  return {
    bubbles: [
      ...state.bubbles,
      { id: `${messageId}-user`, role: 'user', text, pending: false, showEscalation: false },
      { id: `${messageId}-assistant`, role: 'assistant', text: '', pending: true, showEscalation: false },
    ],
    streaming: true,
  }
}

function updateLastAssistant(state: ChatState, update: (bubble: ChatBubble) => ChatBubble): ChatBubble[] {
  const lastIndex = state.bubbles.length - 1
  return state.bubbles.map((bubble, index) => (index === lastIndex && bubble.role === 'assistant' ? update(bubble) : bubble))
}

export function applyStreamEvent(state: ChatState, event: StreamEvent): ChatState {
  if (event.type === 'delta') {
    return { ...state, bubbles: updateLastAssistant(state, (bubble) => ({ ...bubble, text: bubble.text + event.text })) }
  }

  if (event.type === 'done') {
    return {
      bubbles: updateLastAssistant(state, (bubble) => ({
        ...bubble,
        pending: false,
        showEscalation: Boolean(event.escalated),
      })),
      streaming: false,
    }
  }

  return {
    bubbles: updateLastAssistant(state, (bubble) => ({
      ...bubble,
      text: event.message,
      pending: false,
      showEscalation: true,
    })),
    streaming: false,
  }
}
