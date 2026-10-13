/**
 * Konfigurasi chatbot — pola "config file ala Laravel":
 *
 * - Nilai **default** tinggal di file ini (ubah di sini untuk mengubah perilaku bawaan seluruh environment).
 * - Setiap nilai dapat **ditimpa oleh environment variable** dengan nama yang sama.
 * - Semua nilai divalidasi saat modul dimuat; nilai salah → error jelas saat boot, bukan error misterius saat runtime.
 *
 * Konvensi repo:
 * - Rahasia/required milik aplikasi (resend, recaptcha, sanity) → `lib/env.server.ts` (throw bila kosong).
 * - Tuning opsional + penetapan provider chat → modul ini (selalu ada default, tidak pernah membuat app gagal boot).
 *
 * SERVER-ONLY. Jangan impor dari komponen client.
 */

import { z } from 'zod'

if (typeof window !== 'undefined') {
  throw new Error('[config/chat] Modul ini hanya untuk server; jangan diimpor dari komponen client.')
}

// ── Helper pembaca env ────────────────────────────────────────────────────────
// Setiap helper: env kosong/absen → default; nilai tidak valid → throw dengan pesan jelas.

function fail(key: string, value: unknown, expected: string): never {
  throw new Error(`[config/chat] Nilai env tidak valid: ${key}=${JSON.stringify(value)} — harus ${expected}`)
}

function envInt(key: string, fallback: number): number {
  const raw = process.env[key]
  if (raw === undefined || raw === '') return fallback
  const parsed = z.coerce.number().int().nonnegative().safeParse(raw)
  if (!parsed.success) fail(key, raw, 'bilangan bulat ≥ 0')
  return parsed.data as number
}

function envFloat(key: string, fallback: number): number {
  const raw = process.env[key]
  if (raw === undefined || raw === '') return fallback
  const parsed = z.coerce.number().nonnegative().safeParse(raw)
  if (!parsed.success) fail(key, raw, 'angka ≥ 0 (boleh desimal)')
  return parsed.data as number
}

function envBool(key: string, fallback: boolean): boolean {
  const raw = process.env[key]
  if (raw === undefined || raw === '') return fallback
  const normalized = raw.trim().toLowerCase()
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true
  if (['false', '0', 'no', 'off'].includes(normalized)) return false
  fail(key, raw, 'true/false (atau 1/0)')
}

function envStr(key: string, fallback: string): string {
  const raw = process.env[key]
  return raw === undefined ? fallback : raw.trim()
}

function envEnum<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  const raw = process.env[key]
  if (raw === undefined || raw === '') return fallback
  const value = raw.trim() as T
  if (!allowed.includes(value)) fail(key, raw, `salah satu dari: ${allowed.join(' | ')}`)
  return value
}

// ── Konfigurasi ───────────────────────────────────────────────────────────────

export const chatConfig = {
  /** Batas satu percakapan — menahan biaya & menjaga jawaban tetap ringkas. */
  limits: {
    /** Panjang maksimum satu pertanyaan pengunjung (karakter). */
    maxInputChars: envInt('CHAT_MAX_INPUT_CHARS', 1000),
    /** Batas token keluaran model per jawaban (maksimum, bukan target). */
    maxOutputTokens: envInt('CHAT_MAX_OUTPUT_TOKENS', 500),
    /** Jumlah pesan histori yang dikirim ulang ke model. */
    maxHistoryMessages: envInt('CHAT_MAX_HISTORY_MESSAGES', 6),
    /** Pesan lama dipotong sepanjang ini agar histori tidak membengkak. */
    historyMessageMaxChars: envInt('CHAT_HISTORY_MESSAGE_MAX_CHARS', 400),
    /** Batas turn per sesi; setelah tercapai → stop + tawarkan eskalasi. */
    maxTurnsPerSession: envInt('CHAT_MAX_TURNS_PER_SESSION', 8),
    /** Timeout satu permintaan ke provider (ms). */
    requestTimeoutMs: envInt('CHAT_REQUEST_TIMEOUT_MS', 30000),
  },

  /** Rate limit berlapis. `store=db` memakai tabel Postgres; `redis` bila kelak butuh lebih cepat. */
  rateLimit: {
    store: envEnum('RATE_LIMIT_STORE', ['db', 'redis'] as const, 'db'),
    /** Pesan per menit untuk satu sesi/IP. */
    messagesPerMinute: envInt('CHAT_RL_MESSAGES_PER_MINUTE', 6),
    /** Jumlah sesi baru yang boleh dibuat satu IP per hari (anti-refresh abuse). */
    sessionsPerIpPerDay: envInt('CHAT_RL_SESSIONS_PER_IP_PER_DAY', 2),
    /** Batas turn per IP per hari — mencegah satu pihak menghabiskan anggaran. */
    messagesPerIpPerDay: envInt('CHAT_RL_MESSAGES_PER_IP_PER_DAY', 25),
    /** Pengaman kasar global: total turn seluruh situs per hari. */
    dailyTurnCap: envInt('CHAT_DAILY_TURN_CAP', 80),
  },

  /**
   * Anggaran biaya. Ini pengaman **otoritatif** (berbasis biaya terukur per pesan),
   * sedangkan cap turn di atas hanya pengaman kasar.
   */
  budget: {
    /** Circuit breaker harian (USD). 0.15 × 30 ≈ batas bulanan. */
    dailyUsd: envFloat('CHAT_DAILY_BUDGET_USD', 0.15),
    /** Batas bulanan (USD) — dasar penghitungan alert/pemantauan. */
    monthlyUsd: envFloat('CHAT_MONTHLY_BUDGET_USD', 5),
    /** Alert internal saat pemakaian mencapai fraksi ini dari batas bulanan. */
    alertThreshold: envFloat('CHAT_BUDGET_ALERT_THRESHOLD', 0.8),
  },

  /** Perlindungan abuse pada endpoint publik. */
  recaptcha: {
    enabled: envBool('CHAT_RECAPTCHA_ENABLED', true),
    /** Skor minimum reCAPTCHA v3 (0–1); di bawah ini → tolak. */
    minScore: envFloat('CHAT_RECAPTCHA_MIN_SCORE', 0.5),
    /** Nama action reCAPTCHA (key situs dapat dipakai ulang bersama form kontak). */
    action: envStr('CHAT_RECAPTCHA_ACTION', 'chat'),
  },

  /** Eskalasi ke jalur kontak/WhatsApp — lead tidak boleh hilang saat limit tercapai. */
  escalation: {
    /** Nomor tujuan format internasional (mis. 62812xxxxxxx). Kosong = tombol WhatsApp disembunyikan. */
    whatsappNumber: envStr('WHATSAPP_NUMBER', ''),
    /** Halaman kontak internal untuk fallback. */
    contactPath: envStr('CHAT_CONTACT_PATH', '/contact'),
  },

  /** Penyimpanan data percakapan. */
  data: {
    /** 0 = tanpa penghapusan otomatis (keputusan v1). >0 = retensi dalam hari. */
    retentionDays: envInt('CHAT_RETENTION_DAYS', 0),
  },
} as const

export type ChatConfig = typeof chatConfig

// ── Pemeriksaan konsistensi (peringatan, bukan kegagalan boot) ────────────────

if (chatConfig.budget.dailyUsd * 30 > chatConfig.budget.monthlyUsd * 1.2) {
  console.warn(
    `[config/chat] Breaker harian ($${chatConfig.budget.dailyUsd}) × 30 melebihi batas bulanan ($${chatConfig.budget.monthlyUsd}). ` +
      'Periksa CHAT_DAILY_BUDGET_USD / CHAT_MONTHLY_BUDGET_USD.',
  )
}

if (!chatConfig.escalation.whatsappNumber) {
  console.warn('[config/chat] WHATSAPP_NUMBER kosong — tombol eskalasi WhatsApp tidak akan tampil.')
}
