/**
 * Store rate limit berbasis Postgres — pengganti store memory untuk produksi.
 *
 * Satu statement UPSERT atomik per counter, jadi aman dipakai beberapa instance
 * serverless sekaligus (memory store tidak: hitungannya per instance).
 */

import { getSql } from '@/db/client'

import type { RateLimitStore } from './rate-limit'

export function createPostgresRateLimitStore(): RateLimitStore {
  return {
    async incr(key, windowMs) {
      const sql = getSql()
      const rows = await sql<Array<{ count: number }>>`
        insert into rate_limit ("key", window_start, "count")
        values (${key}, now(), 1)
        on conflict ("key") do update
          set "count" = case
                when rate_limit.window_start <= now() - (${windowMs}::int * interval '1 millisecond') then 1
                else rate_limit."count" + 1
              end,
              window_start = case
                when rate_limit.window_start <= now() - (${windowMs}::int * interval '1 millisecond') then now()
                else rate_limit.window_start
              end
        returning "count"
      `

      return Number(rows[0]?.count ?? 1)
    },
  }
}
