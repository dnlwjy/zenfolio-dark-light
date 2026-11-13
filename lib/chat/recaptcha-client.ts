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
let scriptPromise: Promise<void> | null = null

function existingScript(): HTMLScriptElement | null {
  return typeof document === 'undefined' ? null : (document.getElementById(SCRIPT_ID) as HTMLScriptElement | null)
}

export function loadRecaptcha(siteKey: string): Promise<void> {
  if (typeof document === 'undefined' || !siteKey) return Promise.resolve()
  if (window.grecaptcha) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  const current = existingScript()
  const { promise, resolve, reject } = Promise.withResolvers<void>()
  const script = current ?? document.createElement('script')
  script.onload = () => resolve()
  script.onerror = () => {
    scriptPromise = null
    reject(new Error('recaptcha script failed to load'))
  }
  scriptPromise = promise

  if (!current) {
    script.id = SCRIPT_ID
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`
    script.async = true
    document.head.appendChild(script)
  }

  return scriptPromise
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
    return ''
  }
}
