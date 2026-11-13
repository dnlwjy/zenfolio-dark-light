import { describe, expect, it, vi } from 'vitest'

import { verifyRecaptcha } from './recaptcha'

const config = { enabled: true, minScore: 0.5, action: 'chat' }
const secret = 'secret-uji'

function googleReply(payload: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(payload), { status })) as unknown as typeof fetch
}

describe('verifyRecaptcha', () => {
  it('melewati verifikasi saat dinonaktifkan', async () => {
    expect(await verifyRecaptcha({ token: '', secret, config: { ...config, enabled: false } })).toEqual({ ok: true, score: null })
  })

  it('menolak token kosong', async () => {
    expect(await verifyRecaptcha({ token: '', secret, config })).toEqual({ ok: false, reason: 'missing' })
  })

  it('meloloskan token dengan skor cukup', async () => {
    const fetchImpl = googleReply({ success: true, score: 0.9, action: 'chat' })

    expect(await verifyRecaptcha({ token: 'tok', secret, config, fetchImpl })).toEqual({ ok: true, score: 0.9 })
  })

  it('menolak skor rendah', async () => {
    const fetchImpl = googleReply({ success: true, score: 0.1, action: 'chat' })

    expect(await verifyRecaptcha({ token: 'tok', secret, config, fetchImpl })).toEqual({ ok: false, reason: 'low-score' })
  })

  it('menolak action yang tidak cocok', async () => {
    const fetchImpl = googleReply({ success: true, score: 0.9, action: 'login' })

    expect(await verifyRecaptcha({ token: 'tok', secret, config, fetchImpl })).toEqual({ ok: false, reason: 'action-mismatch' })
  })

  it('menolak saat Google menyatakan gagal', async () => {
    const fetchImpl = googleReply({ success: false, 'error-codes': ['invalid-input-response'] })

    expect(await verifyRecaptcha({ token: 'tok', secret, config, fetchImpl })).toEqual({ ok: false, reason: 'failed' })
  })

  it('fail-open saat Google tidak terjangkau', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('network down')
    }) as unknown as typeof fetch

    expect(await verifyRecaptcha({ token: 'tok', secret, config, fetchImpl })).toEqual({ ok: true, score: null })
  })

  it('fail-closed saat Google tidak terjangkau bila diminta', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('network down')
    }) as unknown as typeof fetch

    expect(await verifyRecaptcha({ token: 'tok', secret, config, fetchImpl, failOpen: false })).toEqual({
      ok: false,
      reason: 'unavailable',
    })
  })

  it('menolak respons tanpa skor reCAPTCHA v3', async () => {
    const fetchImpl = googleReply({ success: true, action: 'chat' })

    expect(await verifyRecaptcha({ token: 'tok', secret, config, fetchImpl })).toEqual({
      ok: false,
      reason: 'missing-score',
    })
  })
})
