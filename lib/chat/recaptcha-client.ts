/**
 * Pengambilan token reCAPTCHA v3 di sisi klien.
 *
 * Token v3 bersifat sekali pakai dan berumur ±2 menit, jadi token diambil per pesan,
 * bukan sekali per sesi. Bila script/site key tidak tersedia (dev tanpa key),
 * fungsi mengembalikan string kosong dan server yang memutuskan (verifikasi bisa
 * dimatikan lewat CHAT_RECAPTCHA_ENABLED).
 */

type Grecaptcha = {
  ready(callback: () => void): void
  execute(siteKey: string, options: { action: string }): Promise<string>
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha
  }
}

const SCRIPT_ID = 'recaptcha-v3'

function existingScript(): HTMLScriptElement | null {
  return typeof document === 'undefined' ? null : (document.getElementById(SCRIPT_ID) as HTMLScriptElement | null)
}

export function loadRecaptcha(siteKey: string): Promise<void> {
  if (typeof document === 'undefined' || !siteKey) return Promise.resolve()

  const current = existingScript()
  if (current) return Promise.resolve()

  const { promise, resolve, reject } = Promise.withResolvers<void>()
  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`
  script.async = true
  script.onload = () => resolve()
  script.onerror = () => reject(new Error('recaptcha script failed to load'))
  document.head.appendChild(script)

  return promise
}

export async function getRecaptchaToken(siteKey: string, action: string): Promise<string> {
  if (!siteKey || typeof window === 'undefined') return ''

  try {
    await loadRecaptcha(siteKey)
    const grecaptcha = window.grecaptcha
    if (!grecaptcha) return ''

    const ready = Promise.withResolvers<void>()
    grecaptcha.ready(() => ready.resolve())
    await ready.promise

    return await grecaptcha.execute(siteKey, { action })
  } catch {
    // Kegagalan reCAPTCHA tidak boleh memblokir pengunjung; server tetap punya rate limit.
    return ''
  }
}
