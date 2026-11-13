import { describe, expect, it, afterEach } from 'vitest'

import { GET } from './route'

const originalSecret = process.env.CRON_SECRET
const originalDatabaseUrl = process.env.DATABASE_URL

afterEach(() => {
  if (originalSecret === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = originalSecret

  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL
  else process.env.DATABASE_URL = originalDatabaseUrl
})

describe('GET /api/cron/keepalive', () => {
  it('menolak panggilan tanpa bearer saat CRON_SECRET diisi', async () => {
    process.env.CRON_SECRET = 'rahasia-uji'

    expect((await GET(new Request('http://localhost/api/cron/keepalive'))).status).toBe(401)
    expect(
      (await GET(new Request('http://localhost/api/cron/keepalive', { headers: { authorization: 'Bearer salah' } }))).status,
    ).toBe(401)
  })

  it('menerima panggilan dengan bearer yang benar', async () => {
    process.env.CRON_SECRET = 'rahasia-uji'
    delete process.env.DATABASE_URL

    const response = await GET(
      new Request('http://localhost/api/cron/keepalive', { headers: { authorization: 'Bearer rahasia-uji' } }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: false })
  })

  it('terbuka saat CRON_SECRET belum diisi (dev lokal)', async () => {
    delete process.env.CRON_SECRET

    expect((await GET(new Request('http://localhost/api/cron/keepalive'))).status).toBe(200)
  })
})
