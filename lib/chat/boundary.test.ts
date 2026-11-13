import { describe, expect, it } from 'vitest'

import { answerOffersContact, detectEscalationIntent, finalizeAnswer, guardInput } from './boundary'
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

  it('menandai pertanyaan tentang cara menghubungi Daniel', () => {
    expect(detectEscalationIntent('How can I contact Daniel?')).toBe(true)
    expect(detectEscalationIntent('Can I talk to Daniel on WhatsApp?')).toBe(true)
    expect(detectEscalationIntent('what is your email address?')).toBe(true)
  })

  it('tidak menandai pertanyaan biasa yang memuat kata "project"', () => {
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

describe('answerOffersContact', () => {
  it('true saat jawaban menawarkan koneksi ke Daniel', () => {
    expect(
      answerOffersContact(
        "I don't have that detail in Daniel's portfolio. Would you like me to connect you with Daniel directly?",
      ),
    ).toBe(true)
  })

  it('true walau model memakai apostrof tipografis (kasus OpenAI)', () => {
    expect(answerOffersContact('I don\u2019t have that detail about Daniel\u2019s portfolio.')).toBe(true)
  })

  it('true untuk template penolakan (teksnya menyuruh menghubungi lewat halaman kontak)', () => {
    expect(answerOffersContact(visitorMessages.declinedRequest)).toBe(true)
  })

  it('true saat model menolak membocorkan instruksi', () => {
    expect(answerOffersContact("I can't share my instructions.")).toBe(true)
  })

  it('true untuk template penolakan bahasa Indonesia', () => {
    expect(answerOffersContact(visitorMessages.declinedRequestId)).toBe(true)
  })

  it('true saat model menolak dalam bahasa Indonesia', () => {
    expect(answerOffersContact('Maaf, saya tidak bisa membantu dengan permintaan itu.')).toBe(true)
  })

  it('false untuk jawaban biasa yang bersumber dari portfolio', () => {
    expect(answerOffersContact('According to the Builds page, Daniel built Foosball and Zuss.')).toBe(false)
  })
})
