/**
 * Memuat `.env` untuk script CLI — harus diimpor PALING ATAS di script.
 *
 * Impor ESM dievaluasi sesuai urutan sumber, jadi file ini berjalan sebelum modul lain
 * (mis. `lib/config/chat.ts`) membaca process.env. Tanpa ini, script via `tsx`/`node`
 * melihat env kosong dan memakai nilai default (gejala: peringatan "WHATSAPP_NUMBER kosong").
 *
 * Di CI/Vercel file `.env` tidak ada — variabel sudah disuntik runtime, jadi kegagalan diabaikan.
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(path.resolve(dirname, '../.env'))
  } catch {
    /* tidak ada .env — pakai env proses */
  }
}
