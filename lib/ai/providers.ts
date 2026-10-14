/**
 * Registry provider LLM — satu jalur kode, provider diganti lewat env.
 *
 * Semua endpoint di sini berbicara format OpenAI (`/chat/completions`); perbedaan
 * perilaku antar provider/model ditangkap sebagai profil model, bukan cabang `if`
 * yang berserakan di route handler.
 *
 * Catatan hasil uji live 2026-10-13 (OpenCode Console):
 * - `deepseek-v4.1-flash` selalu memakai thinking mode; parameter `thinking.type=disabled`
 *   diabaikan dan justru bisa menghabiskan jatah output → profil menandai `neverSendThinkingParam`.
 * - `glm-5.3-flash` tidak mengeluarkan token penalaran sama sekali.
 * - `/v1/models` masih mencantumkan model pensiun (404/410), jadi registry ini yang jadi acuan,
 *   bukan daftar dari provider.
 */

export type ModelFamily = 'chat-completions' | 'responses'

export type ModelProfile = {
  id: string
  label: string
  family: ModelFamily
  /** Mengeluarkan token penalaran yang tetap ditagih sebagai output. */
  emitsReasoning: boolean
  /** Endpoint menolak atau menyalahgunakan parameter thinking → jangan pernah dikirim. */
  neverSendThinkingParam: boolean
  /** Saat streaming, usage hanya dilaporkan bila `stream_options.include_usage` dikirim. */
  streamUsageRequiresFlag: boolean
  /** Tanggal uji live dari repo ini (null = belum diuji, hanya berdasarkan dokumentasi). */
  liveVerified: string | null
}

export type ProviderEntry = {
  id: string
  label: string
  baseUrl: string
  chatPath: string
  apiKeyEnv: string
  models: Record<string, Omit<ModelProfile, 'id'>>
}

const MODEL_DEFAULTS: Omit<ModelProfile, 'id' | 'label'> = {
  family: 'chat-completions',
  emitsReasoning: false,
  neverSendThinkingParam: true,
  streamUsageRequiresFlag: true,
  liveVerified: null,
}

export const providers: Record<string, ProviderEntry> = {
  opencode: {
    id: 'opencode',
    label: 'OpenCode Zen (pay-as-you-go)',
    baseUrl: 'https://opencode.ai/inference/v1',
    chatPath: '/chat/completions',
    apiKeyEnv: 'OPENCODE_API_KEY',
    models: {
      'deepseek-v4.1-flash': {
        ...MODEL_DEFAULTS,
        label: 'DeepSeek V4.1 Flash',
        emitsReasoning: true,
        liveVerified: '2026-10-13',
      },
      'glm-5.3-flash': {
        ...MODEL_DEFAULTS,
        label: 'GLM 5.3 Flash',
        liveVerified: '2026-10-13',
      },
      'deepseek-v4-pro': {
        ...MODEL_DEFAULTS,
        label: 'DeepSeek V4 Pro',
        emitsReasoning: true,
      },
    },
  },
  deepseek: {
    id: 'deepseek',
    label: 'DeepSeek langsung',
    baseUrl: 'https://api.deepseek.com',
    chatPath: '/chat/completions',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    models: {
      'deepseek-flash': {
        ...MODEL_DEFAULTS,
        label: 'DeepSeek V4.1 Flash (langsung)',
        emitsReasoning: true,
        // Di API resmi DeepSeek, thinking memang bisa dimatikan lewat parameter ini.
        neverSendThinkingParam: false,
      },
    },
  },
  openai: {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    chatPath: '/chat/completions',
    apiKeyEnv: 'OPENAI_API_KEY',
    models: {
      'gpt-5-nano': { ...MODEL_DEFAULTS, label: 'GPT-5 nano', emitsReasoning: true },
      'gpt-6-luna': { ...MODEL_DEFAULTS, label: 'GPT-6 Luna' },
    },
  },
}

export type ResolvedModel = {
  provider: ProviderEntry
  model: ModelProfile
  apiKey: string
  endpoint: string
  /** Model cadangan (opsional) untuk kegagalan yang layak dicoba ulang. */
  fallback: { model: ModelProfile; apiKey: string; endpoint: string } | null
}

/** Referensi model cadangan; boleh berasal dari provider berbeda. */
export type FallbackRef = { providerId: string; modelId: string }

function profileFor(provider: ProviderEntry, modelId: string): ModelProfile {
  const model = provider.models[modelId]
  if (!model) {
    const known = Object.keys(provider.models).join(', ')
    throw new Error(`Model "${modelId}" tidak terdaftar di provider "${provider.id}". Pilihan: ${known}`)
  }
  return { id: modelId, ...model }
}

function apiKeyFor(provider: ProviderEntry): string {
  const key = process.env[provider.apiKeyEnv]?.trim()
  if (!key) throw new Error(`Env ${provider.apiKeyEnv} belum diisi untuk provider "${provider.id}"`)
  return key
}

/** Bentuk resolved model dari pasangan provider+model eksplisit (dipakai uji live & eval). */
function providerOf(providerId: string): ProviderEntry {
  const provider = providers[providerId]
  if (!provider) {
    throw new Error(`Provider "${providerId}" tidak dikenal. Pilihan: ${Object.keys(providers).join(', ')}`)
  }
  return provider
}

export function resolveModelById(providerId: string, modelId: string, fallback?: FallbackRef): ResolvedModel {
  const provider = providerOf(providerId)

  let fallbackEntry: ResolvedModel['fallback'] = null
  if (fallback) {
    const fallbackProvider = providerOf(fallback.providerId)
    fallbackEntry = {
      model: profileFor(fallbackProvider, fallback.modelId),
      apiKey: apiKeyFor(fallbackProvider),
      endpoint: `${fallbackProvider.baseUrl}${fallbackProvider.chatPath}`,
    }
  }

  return {
    provider,
    model: profileFor(provider, modelId),
    apiKey: apiKeyFor(provider),
    endpoint: `${provider.baseUrl}${provider.chatPath}`,
    fallback: fallbackEntry,
  }
}

/**
 * Cadangan boleh dari provider lain (mis. utama OpenAI, cadangan OpenCode):
 *   LLM_FALLBACK_MODEL=opencode/glm-5.3-flash      (bentuk provider/model)
 *   LLM_FALLBACK_PROVIDER=opencode + LLM_FALLBACK_MODEL=glm-5.3-flash
 */
function fallbackRef(primaryProviderId: string): FallbackRef | undefined {
  const raw = process.env.LLM_FALLBACK_MODEL?.trim()
  if (!raw) return undefined

  const [maybeProvider, maybeModel] = raw.split('/')
  if (maybeModel) return { providerId: maybeProvider, modelId: maybeModel }

  return { providerId: process.env.LLM_FALLBACK_PROVIDER?.trim() || primaryProviderId, modelId: raw }
}

/** Model aktif aplikasi: `LLM_PROVIDER` + `LLM_MODEL` (+ `LLM_FALLBACK_MODEL` opsional). */
export function resolveActiveModel(): ResolvedModel {
  const providerId = process.env.LLM_PROVIDER?.trim() || 'opencode'

  return resolveModelById(providerId, process.env.LLM_MODEL?.trim() || 'glm-5.3-flash', fallbackRef(providerId))
}
