import { describe, expect, it } from 'vitest'

import { buildMessages, buildSystemPrompt } from './prompt'

describe('buildSystemPrompt', () => {
  it('memuat aturan kontrak dan entri KB untuk route yang diminta', () => {
    const prompt = buildSystemPrompt('/case-study/animated-framer-website')

    expect(prompt).toContain('Answer ONLY using the CONTEXT')
    expect(prompt).toContain('Animated Framer Website')
    expect(prompt).toContain('/case-study/animated-framer-website')
  })

  it('memuat konteks umum (about) untuk route mana pun', () => {
    expect(buildSystemPrompt('/builds')).toContain('About Daniel Wijaya')
  })

  it('menghormati batas jumlah entri', () => {
    const one = buildSystemPrompt('/builds', 1)
    const many = buildSystemPrompt('/builds', 6)

    expect(one.length).toBeLessThan(many.length)
  })
})

describe('buildMessages', () => {
  const limits = { maxMessages: 2, maxCharsPerMessage: 10 }

  it('menyusun system, histori, lalu pertanyaan', () => {
    const messages = buildMessages({
      route: '/about',
      history: [
        { role: 'user', content: 'halo' },
        { role: 'assistant', content: 'hai' },
      ],
      question: 'Apa stack Daniel?',
      limits,
    })

    expect(messages[0].role).toBe('system')
    expect(messages.at(-1)).toEqual({ role: 'user', content: 'Apa stack Daniel?' })
    expect(messages.filter((message) => message.role !== 'system')).toHaveLength(3)
  })

  it('memotong histori ke pesan terakhir dan memangkas pesan panjang', () => {
    const messages = buildMessages({
      route: '/about',
      history: [
        { role: 'user', content: 'pesan lama yang harusnya dibuang' },
        { role: 'assistant', content: 'jawaban lama yang juga dibuang' },
        { role: 'user', content: '12345678901234567890' },
        { role: 'assistant', content: 'ok' },
      ],
      question: 'lanjut?',
      limits,
    })

    const history = messages.filter((message) => message.role !== 'system').slice(0, -1)

    expect(history).toHaveLength(2)
    expect(history[0].content).toBe('1234567890')
    expect(history[1].content).toBe('ok')
  })
})
