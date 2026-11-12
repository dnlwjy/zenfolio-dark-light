/**
 * Batas perilaku chatbot di sisi kode (deterministik, tanpa memanggil model):
 * - guard input pengunjung sebelum biaya dikeluarkan
 * - deteksi minat hiring untuk menawarkan jalur WhatsApp
 * - finalisasi jawaban supaya pengunjung tidak pernah melihat gelembung kosong
 *
 * Kontrak isi jawaban (hanya dari knowledge base) dipegang oleh prompt
 * dan diverifikasi oleh eval set, bukan di sini.
 */

import { visitorMessages } from './messages'
import { normalizeForMatch } from './text'

/**
 * Pemicu untuk menampilkan dua jalur kontak (WhatsApp + halaman kontak):
 * minat kerja sama **dan** pertanyaan soal menghubungi Daniel.
 */
export const DEFAULT_HIRE_TRIGGERS = [
  'hire',
  'hiring',
  'quote',
  'rate',
  'budget',
  'available',
  'availability',
  'collaborate',
  'freelance',
  'contract',
  'work with you',
  'work together',
  'contact',
  'whatsapp',
  'reach out',
  'get in touch',
  'email',
  'phone',
  'talk to daniel',
  'message daniel',
  'hubungi',
  'kontak',
] as const

export type InputGuard = { ok: true; value: string } | { ok: false; message: string }

export function guardInput(raw: string, maxChars: number): InputGuard {
  const value = raw.replace(/\s+/g, ' ').trim()

  if (!value) return { ok: false, message: visitorMessages.emptyInput }
  if (value.length > maxChars) return { ok: false, message: visitorMessages.tooLong }

  return { ok: true, value }
}

export function detectEscalationIntent(text: string, triggers: readonly string[] = DEFAULT_HIRE_TRIGGERS): boolean {
  const words = triggers
    .map((trigger) => trigger.trim().toLowerCase())
    .filter(Boolean)
    .map((trigger) => trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

  if (words.length === 0) return false

  // Batas kata mencegah "separate" dianggap mengandung "rate".
  return new RegExp(`\\b(${words.join('|')})\\b`, 'i').test(text)
}

export function finalizeAnswer(raw: string): string {
  const value = raw.trim()
  return value || visitorMessages.emptyAnswer
}

/**
 * true bila jawaban model menawarkan koneksi ke Daniel (jalur "tidak ada di knowledge base").
 * Dipakai server untuk menampilkan tombol kontak meski pertanyaan pengunjung tidak memicu intent.
 */
export function answerOffersContact(answer: string): boolean {
  const text = normalizeForMatch(answer)

  return [
    'would you like me to connect',
    "don't have that detail",
    'do not have that detail',
    "don't have any information",
    'no information about',
    'connect you with daniel',
    // Penolakan menyuruh pengunjung menghubungi lewat halaman kontak,
    // jadi tombol kontak harus ikut tampil.
    normalizeForMatch(visitorMessages.declinedRequest),
    normalizeForMatch(visitorMessages.declinedRequestId),
    "can't share my instructions",
    'cannot share my instructions',
    "won't share my instructions",
    "can't reveal",
    'cannot reveal',
    "won't reveal",
    "can't disclose",
    'cannot disclose',
    "won't disclose",
    'share internal instructions',
    'share those instructions',
    'share these instructions',
    'hidden instructions',
    'confidential instructions',
    'private instructions',
    'internal instructions',
    "can't help with that",
    'cannot help with that',
    'tidak bisa membantu',
    'tidak dapat membantu',
    'tidak bisa saya bantu',
    'tidak dapat saya bantu',
    'tidak bisa membagikan',
    'tidak dapat membagikan',
    'tidak akan membagikan',
    'tidak bisa menampilkan',
    'tidak dapat menampilkan',
    'tidak akan menampilkan',
    'tidak bisa mengungkapkan',
    'tidak dapat mengungkapkan',
    'tidak akan mengungkapkan',
    'tidak bisa membocorkan',
    'tidak dapat membocorkan',
    'tidak akan membocorkan',
    'instruksi rahasia',
    'instruksi tersembunyi',
    'instruksi internal',
    'halaman kontak',
    'hubungi daniel',
  ].some((marker) => text.includes(marker))
}
