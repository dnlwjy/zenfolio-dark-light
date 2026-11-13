export type ModelFamily = 'chat-completions' | 'responses'

export type ModelProfile = {
  id: string
  label: string
  family: ModelFamily
  emitsReasoning: boolean
  neverSendThinkingParam: boolean
  streamUsageRequiresFlag: boolean
  maxTokensParam: 'max_tokens' | 'max_completion_tokens'
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
  maxTokensParam: 'max_tokens',
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
      'gpt-5-nano': { ...MODEL_DEFAULTS, label: 'GPT-5 nano', emitsReasoning: true, maxTokensParam: 'max_completion_tokens' },
      'gpt-6-luna': { ...MODEL_DEFAULTS, label: 'GPT-6 Luna', maxTokensParam: 'max_completion_tokens' },
    },
  },
}

export type ResolvedModel = {
  provider: ProviderEntry
  model: ModelProfile
  apiKey: string
  endpoint: string
  fallback: { model: ModelProfile; apiKey: string; endpoint: string } | null
}

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
 *   LLM_FALLBACK_MODEL=opencode/glm-5.3-flash      (provider/model format)
 *   LLM_FALLBACK_PROVIDER=opencode + LLM_FALLBACK_MODEL=glm-5.3-flash
 */
function fallbackRef(primaryProviderId: string): FallbackRef | undefined {
  const raw = process.env.LLM_FALLBACK_MODEL?.trim()
  if (!raw) return undefined

  const [maybeProvider, maybeModel] = raw.split('/')
  if (maybeModel) return { providerId: maybeProvider, modelId: maybeModel }

  return { providerId: process.env.LLM_FALLBACK_PROVIDER?.trim() || primaryProviderId, modelId: raw }
}

export function resolveActiveModel(): ResolvedModel {
  const providerId = process.env.LLM_PROVIDER?.trim() || 'opencode'

  return resolveModelById(providerId, process.env.LLM_MODEL?.trim() || 'glm-5.3-flash', fallbackRef(providerId))
}
