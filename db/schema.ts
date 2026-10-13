/**
 * Tabel chatbot di Supabase Postgres.
 *
 * Akses hanya dari server lewat koneksi Postgres langsung (bukan Data API),
 * dan RLS diaktifkan tanpa policy = deny-all untuk anon/authenticated.
 *
 * Konvensi: migrasi dihasilkan `drizzle-kit generate` lalu di-commit sebagai SQL
 * yang bisa dibaca; setiap file diakhiri blok komentar ROLLBACK (lihat db/README).
 */

import { bigserial, boolean, index, integer, jsonb, numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const chatSession = pgTable('chat_session', {
  // id sesi datang dari klien (crypto.randomUUID) — disimpan sebagai text agar
  // tidak memaksa validasi UUID di kontrak API.
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  firstPage: text('first_page'),
  referrer: text('referrer'),
  utm: jsonb('utm'),
  device: jsonb('device'),
  consent: boolean('consent').notNull().default(false),
})

export const chatMessage = pgTable(
  'chat_message',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => chatSession.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    role: text('role').notNull(),
    content: text('content').notNull(),
    pageUrl: text('page_url'),
    pageTitle: text('page_title'),
    provider: text('provider'),
    model: text('model'),
    kbVersion: text('kb_version'),
    tokensIn: integer('tokens_in'),
    cachedTokensIn: integer('cached_tokens_in'),
    tokensOut: integer('tokens_out'),
    costUsd: numeric('cost_usd', { precision: 10, scale: 6 }),
    latencyMs: integer('latency_ms'),
    escalated: boolean('escalated').notNull().default(false),
    recaptchaScore: numeric('recaptcha_score', { precision: 3, scale: 2 }),
  },
  (table) => [index('chat_message_session_idx').on(table.sessionId, table.createdAt)],
)

export const chatEvent = pgTable(
  'chat_event',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    sessionId: text('session_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    type: text('type').notNull(),
    pageUrl: text('page_url'),
    meta: jsonb('meta'),
  },
  (table) => [index('chat_event_type_idx').on(table.type, table.createdAt)],
)

export const rateLimit = pgTable('rate_limit', {
  key: text('key').primaryKey(),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
  count: integer('count').notNull().default(0),
})
