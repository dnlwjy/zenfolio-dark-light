import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  // Migrasi memakai koneksi session/direct (bukan pooler transaksi) via DATABASE_URL_MIGRATE.
  dbCredentials: { url: process.env.DATABASE_URL_MIGRATE ?? '' },
  strict: true,
  verbose: true,
})
