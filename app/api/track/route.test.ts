import { describe, expect, it, vi } from 'vitest'

vi.mock('@/db/client', () => ({
  getDb: () => ({ insert: () => ({ values: async () => undefined }) }),
}))

vi.mock('@/lib/chat/rate-limit-factory', () => ({
  getRateLimitStore: () => ({ incr: async () => 1 }),
}))

import { POST } from './route'

function postTrack(body: unknown): Promise<Response> {
  return POST(
    new Request('http://localhost/api/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  )
}

describe('POST /api/track', () => {
  it('menolak JSON rusak', async () => {
    expect((await postTrack('{bukan-json')).status).toBe(400)
  })

  it('menolak tipe event yang tidak dikenal', async () => {
    const response = await postTrack({ type: 'unknown_event', sessionId: 'sesi-uji-1234' })
    expect(response.status).toBe(400)
  })

  it('menolak sessionId yang terlalu pendek', async () => {
    const response = await postTrack({ type: 'page_view', sessionId: 'x' })
    expect(response.status).toBe(400)
  })

  it('menerima event analitik biasa', async () => {
    const response = await postTrack({ type: 'page_view', sessionId: 'sesi-uji-1234', pageUrl: '/' })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  })

  it('menerima event consent_update sebagai catatan akuntabilitas', async () => {
    const response = await postTrack({
      type: 'consent_update',
      sessionId: 'sesi-uji-1234',
      meta: { version: 1, analytics: false, source: 'banner' },
    })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  })
})
