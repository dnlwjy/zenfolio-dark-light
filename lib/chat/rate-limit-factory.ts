
import { chatConfig } from '@/lib/config/chat'

import { createMemoryRateLimitStore, type RateLimitStore } from './rate-limit'
import { createPostgresRateLimitStore } from './rate-limit-store-postgres'

let store: RateLimitStore | null = null

export function getRateLimitStore(): RateLimitStore {
  store ??= chatConfig.rateLimit.store === 'db' ? createPostgresRateLimitStore() : createMemoryRateLimitStore()
  return store
}
