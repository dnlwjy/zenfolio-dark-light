import { describe, expect, it } from 'vitest'

import { applyStreamEvent, sendUserMessage, type ChatState } from './stream-reducer'

function freshState(): ChatState {
  return { bubbles: [], streaming: false, showEscalation: false }
}

describe('sendUserMessage', () => {
  it('menambah bubble pengunjung dan bubble asisten yang menunggu', () => {
    const state = sendUserMessage(freshState(), 'Halo', 'm1')

    expect(state.bubbles).toHaveLength(2)
    expect(state.bubbles[0]).toMatchObject({ role: 'user', text: 'Halo' })
    expect(state.bubbles[1]).toMatchObject({ role: 'assistant', pending: true })
    expect(state.streaming).toBe(true)
  })
})

describe('applyStreamEvent', () => {
  it('menambah teks delta ke bubble asisten terakhir', () => {
    const started = sendUserMessage(freshState(), 'Halo', 'm1')
    const afterFirst = applyStreamEvent(started, { type: 'delta', text: 'Hai' })
    const afterSecond = applyStreamEvent(afterFirst, { type: 'delta', text: '!' })

    expect(afterSecond.bubbles.at(-1)).toMatchObject({ role: 'assistant', text: 'Hai!', pending: true })
  })

  it('menutup streaming dan menandai selesai saat event done', () => {
    const started = sendUserMessage(freshState(), 'Halo', 'm1')
    const done = applyStreamEvent(started, { type: 'done', usage: { tokensIn: 10, cachedTokensIn: 0, tokensOut: 5 }, costUsd: 0.001, escalated: false })

    expect(done.streaming).toBe(false)
    expect(done.bubbles.at(-1)?.pending).toBe(false)
  })

  it('mengaktifkan tawaran eskalasi saat server menandainya', () => {
    const started = sendUserMessage(freshState(), 'Berapa rate?', 'm1')
    const done = applyStreamEvent(started, { type: 'done', escalated: true })

    expect(done.showEscalation).toBe(true)
  })

  it('mengganti jawaban kosong dengan pesan tenang dan tetap menawarkan eskalasi', () => {
    const started = sendUserMessage(freshState(), 'Halo', 'm1')
    const failed = applyStreamEvent(started, { type: 'error', message: 'Pesan tenang' })

    expect(failed.streaming).toBe(false)
    expect(failed.showEscalation).toBe(true)
    expect(failed.bubbles.at(-1)).toMatchObject({ role: 'assistant', text: 'Pesan tenang', pending: false })
  })
})
