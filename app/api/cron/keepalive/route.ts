/**
 * Keep-alive database untuk Supabase free tier (di-pause setelah 7 hari tanpa aktivitas).
 *
 * Dijadwalkan harian lewat Vercel Cron (lihat vercel.json). Dilindungi CRON_SECRET:
 * Vercel mengirim header Authorization: Bearer <CRON_SECRET>; panggilan tanpa itu ditolak.
 */

import { NextResponse } from 'next/server'

import { pingDatabase } from '@/db/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const authorized = !secret || request.headers.get('authorization') === `Bearer ${secret}`
  if (!authorized) return NextResponse.json({ ok: false }, { status: 401 })

  try {
    const alive = await pingDatabase()
    return NextResponse.json({ ok: alive })
  } catch (error) {
    console.error(
      JSON.stringify({ level: 'error', event: 'cron.keepalive_failed', message: error instanceof Error ? error.message : String(error) }),
    )
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
