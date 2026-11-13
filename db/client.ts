import { drizzle } from 'drizzle-orm/postgres-js'
import postgres, { type Sql } from 'postgres'

import * as schema from './schema'

if (typeof window !== 'undefined') {
  throw new Error('[db] Modul ini hanya untuk server; jangan diimpor dari komponen client.')
}

let client: Sql | null = null

export function getSql(): Sql {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('[db] DATABASE_URL belum diisi')

  client ??= postgres(url, { max: 1, prepare: false, ssl: 'require' })
  return client
}

export function getDb() {
  return drizzle(getSql(), { schema })
}

export async function pingDatabase(): Promise<boolean> {
  const url = process.env.DATABASE_URL
  if (!url) return false

  client ??= postgres(url, { max: 1, prepare: false, ssl: 'require' })
  await client`select 1 as ok`
  return true
}
