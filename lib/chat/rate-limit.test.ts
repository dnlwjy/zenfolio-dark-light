import { describe, expect, it } from 'vitest'

import { visitorMessages } from './messages'
import { checkMessageLimits, checkSessionLimit, createMemoryRateLimitStore } from './rate-limit'

const limits = { messagesPerMinute: 2, sessionsPerIpPerDay: 1, messagesPerIpPerDay: 3, maxTurnsPerSession: 4 }

function store() {
  return createMemoryRateLimitStore()
}

describe('checkMessageLimits', () => {
  it('mengizinkan selama di bawah batas per menit', async () => {
    const s = store()
    const base = { store: s, sessionId: 's1', ipHash: 'ip1', turnCount: 0, limits, now: 1_000 }

    expect(await checkMessageLimits(base)).toEqual({ allowed: true })
    expect(await checkMessageLimits(base)).toEqual({ allowed: true })
  })

  it('menolak pesan ke-3 dalam satu menit dengan pesan ramah', async () => {
    const s = store()
    const base = { store: s, sessionId: 's1', ipHash: 'ip1', turnCount: 0, limits, now: 1_000 }

    await checkMessageLimits(base)
    await checkMessageLimits(base)

    expect(await checkMessageLimits(base)).toEqual({
      allowed: false,
      reason: 'per-minute',
      message: visitorMessages.slowDown,
    })
  })

  it('mengizinkan lagi setelah window satu menit lewat', async () => {
    const s = store()
    const early = { store: s, sessionId: 's1', ipHash: 'ip1', turnCount: 0, limits, now: 1_000 }

    await checkMessageLimits(early)
    await checkMessageLimits(early)

    expect(await checkMessageLimits({ ...early, now: 62_000 })).toEqual({ allowed: true })
  })

  it('menolak saat turn sesi sudah mencapai batas', async () => {
    const s = store()

    expect(await checkMessageLimits({ store: s, sessionId: 's1', ipHash: 'ip1', turnCount: 4, limits, now: 1_000 })).toEqual({
      allowed: false,
      reason: 'per-session',
      message: visitorMessages.sessionLimit,
    })
  })

  it('menolak saat batas harian per IP terlampaui', async () => {
    const s = store()
    const base = { store: s, sessionId: 's1', ipHash: 'ip1', turnCount: 0, limits, now: 1_000 }
    const otherSession = { ...base, sessionId: 's2', now: 2_000 }

    await checkMessageLimits(base)
    await checkMessageLimits(base)
    await checkMessageLimits(otherSession)

    const decision = await checkMessageLimits({ ...otherSession, now: 3_000 })

    expect(decision.allowed).toBe(false)
    expect(decision).toMatchObject({ reason: 'per-ip-day' })
  })
})

describe('checkSessionLimit', () => {
  it('membatasi jumlah SESI BARU per IP per hari', async () => {
    const s = store()

    expect(await checkSessionLimit({ store: s, ipHash: 'ip1', sessionId: 's1', limits, now: 1_000 })).toEqual({ allowed: true })
    expect(await checkSessionLimit({ store: s, ipHash: 'ip1', sessionId: 's2', limits, now: 2_000 })).toEqual({
      allowed: false,
      reason: 'per-ip-sessions',
      message: visitorMessages.slowDown,
    })
  })

  it('tidak menghabiskan jatah sesi untuk percakapan panjang dalam sesi yang sama', async () => {
    const s = store()

    // Regresi: sebelumnya setiap permintaan dihitung sebagai sesi baru sehingga
    // pengunjung terblokir di tengah percakapan.
    for (let attempt = 0; attempt < 6; attempt += 1) {
      expect(await checkSessionLimit({ store: s, ipHash: 'ip1', sessionId: 'same-session', limits, now: 1_000 + attempt })).toEqual({
        allowed: true,
      })
    }
  })
})
