import { describe, expect, it } from 'vitest'

import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  CONSENT_VERSION,
  parseConsent,
  readConsentCookie,
  readConsentRawCookie,
  serializeConsent,
  type ConsentState,
} from './consent'

const state: ConsentState = { version: CONSENT_VERSION, analytics: true, ts: 1_710_000_000_000 }

describe('consent cookie', () => {
  it('round-trip serialize lalu parse mengembalikan nilai yang sama', () => {
    expect(parseConsent(serializeConsent(state))).toEqual(state)
  })

  it('nilai terserialisasi aman disimpan sebagai cookie (tanpa karakter terlarang mentah)', () => {
    expect(serializeConsent(state)).not.toMatch(/[";,\s]/)
  })

  it('mengembalikan null untuk cookie kosong/absen', () => {
    expect(parseConsent(null)).toBeNull()
    expect(parseConsent(undefined)).toBeNull()
    expect(parseConsent('')).toBeNull()
  })

  it('mengembalikan null untuk JSON rusak atau persen-escape tidak valid', () => {
    expect(parseConsent('bukan-json')).toBeNull()
    expect(parseConsent('%E0%A4%A')).toBeNull()
  })

  it('mengembalikan null bila versi berbeda — memaksa persetujuan ulang', () => {
    expect(parseConsent(serializeConsent({ ...state, version: CONSENT_VERSION + 1 }))).toBeNull()
  })

  it('mengembalikan null bila bentuk nilai tidak lengkap atau salah tipe', () => {
    expect(parseConsent(JSON.stringify({ version: CONSENT_VERSION, ts: 1 }))).toBeNull()
    expect(parseConsent(JSON.stringify({ version: CONSENT_VERSION, analytics: 'yes', ts: 1 }))).toBeNull()
    expect(parseConsent(JSON.stringify({ version: CONSENT_VERSION, analytics: true }))).toBeNull()
    expect(parseConsent(JSON.stringify(null))).toBeNull()
    expect(parseConsent('123')).toBeNull()
  })

  it('tanpa document (node) pembacaan cookie mengembalikan null', () => {
    expect(readConsentCookie()).toBeNull()
    expect(readConsentRawCookie()).toBeNull()
  })

  it('menetapkan nama cookie dan umur 180 hari', () => {
    expect(CONSENT_COOKIE).toBe('consent_v1')
    expect(CONSENT_MAX_AGE_SECONDS).toBe(180 * 24 * 60 * 60)
  })
})
