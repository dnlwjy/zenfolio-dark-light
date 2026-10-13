import { describe, expect, it } from 'vitest'

import { visitorMessages } from './messages'
import { prepareTurn } from './turn'

const valid = {
  message: '  Apa itu Framer?  ',
  route: '/about',
  sessionId: 'sess-12345678',
  turnCount: 0,
  history: [{ role: 'user', content: 'halo' }],
  recaptchaToken: 'tok',
}

describe('prepareTurn', () => {
  it('meloloskan payload valid dan merapikan pertanyaan', () => {
    const result = prepareTurn(valid)

    expect(result).toMatchObject({ ok: true, question: 'Apa itu Framer?', route: '/about', sessionId: 'sess-12345678' })
  })

  it('menolak pertanyaan kosong dengan pesan ramah', () => {
    expect(prepareTurn({ ...valid, message: '   ' })).toEqual({ ok: false, status: 400, message: visitorMessages.emptyInput })
  })

  it('menolak pertanyaan melebihi batas', () => {
    const result = prepareTurn({ ...valid, message: 'a'.repeat(5000) })

    expect(result.ok).toBe(false)
    expect(result).toMatchObject({ status: 400, message: visitorMessages.tooLong })
  })

  it('menolak payload tanpa sessionId dengan pesan tenang', () => {
    const { sessionId: _ignored, ...rest } = valid

    expect(prepareTurn(rest)).toEqual({ ok: false, status: 400, message: visitorMessages.temporarilyUnavailable })
  })

  it('menolak histori yang tidak wajar', () => {
    const history = Array.from({ length: 60 }, (_, index) => ({ role: 'user' as const, content: `pesan ${index}` }))

    expect(prepareTurn({ ...valid, history })).toMatchObject({ ok: false, status: 400 })
  })

  it('menerima histori panjang yang masih dalam batas', () => {
    const history = Array.from({ length: 30 }, (_, index) => ({ role: 'user' as const, content: `pesan ${index}` }))
    const result = prepareTurn({ ...valid, history })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.history).toHaveLength(30)
  })
})
