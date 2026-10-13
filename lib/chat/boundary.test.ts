import { describe, expect, it } from 'vitest'

import { detectEscalationIntent, finalizeAnswer, guardInput } from './boundary'
import { visitorMessages } from './messages'

describe('guardInput', () => {
  it('menolak input kosong', () => {
    expect(guardInput('   ', 100)).toEqual({ ok: false, message: visitorMessages.emptyInput })
  })

  it('menolak input melebihi batas', () => {
    expect(guardInput('a'.repeat(101), 100)).toEqual({ ok: false, message: visitorMessages.tooLong })
  })

  it('merapikan spasi dan meloloskan input wajar', () => {
    expect(guardInput('  apa   itu  framer?  ', 100)).toEqual({ ok: true, value: 'apa itu framer?' })
  })
})

describe('detectEscalationIntent', () => {
  it('mendeteksi minat kerja sama', () => {
    expect(detectEscalationIntent('What is your rate for a project like this?')).toBe(true)
    expect(detectEscalationIntent('I would like to hire you')).toBe(true)
  })

  it('tidak salah mendeteksi kata yang hanya menyerupai', () => {
    expect(detectEscalationIntent('Could we separate the sections?')).toBe(false)
    expect(detectEscalationIntent('What is a case study?')).toBe(false)
  })

  it('tidak menandai pertanyaan biasa yang memuat kata "project"', () => {
    // Regresi dari smoke test: pertanyaan "Which project dealt with reservations?" sempat
    // tercatat sebagai minat hiring karena pemicu "project" terlalu generik.
    expect(detectEscalationIntent('Which project dealt with reservations?')).toBe(false)
  })

  it('menghormati daftar pemicu dari CMS', () => {
    expect(detectEscalationIntent('bisa ngobrol soal kolaborasi?', ['kolaborasi'])).toBe(true)
    expect(detectEscalationIntent('bisa ngobrol soal kolaborasi?', ['hire'])).toBe(false)
  })
})

describe('finalizeAnswer', () => {
  it('memangkas spasi', () => {
    expect(finalizeAnswer('  halo  ')).toBe('halo')
  })

  it('memakai pesan ramah saat jawaban kosong', () => {
    expect(finalizeAnswer('   ')).toBe(visitorMessages.emptyAnswer)
  })
})
