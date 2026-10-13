/**
 * Akses knowledge bundle untuk aplikasi (server-side).
 *
 * File JSON di-generate oleh `scripts/build-knowledge.mts` (lihat `npm run knowledge:build`).
 * Bundle ini adalah satu-satunya sumber isi jawaban chatbot: konten Sanity yang
 * benar-benar tampil di situs, sudah diratakan menjadi teks.
 */

import bundle from './knowledge.generated.json'

export type KnowledgeEntryType = 'route' | 'about' | 'caseStudy' | 'caseStudyIndex' | 'builds' | 'chatbot'

export type KnowledgeEntry = {
  id: string
  type: KnowledgeEntryType
  /** Route halaman; `*` berarti berlaku di semua halaman (mis. FAQ). */
  route: string
  title: string
  summary: string
  body: string
  meta?: Record<string, unknown>
}

export type ChatbotContent = {
  greetings?: Array<{ route?: string; text?: string }>
  suggestedQuestions?: Array<{ route?: string; questions?: string[] }>
  faqs?: Array<{ question?: string; answer?: string }>
  escalation?: { triggers?: string[]; message?: string; waMessageTemplate?: string }
  availability?: string
} | null

export const kbVersion: string = bundle.kbVersion
export const knowledgeEntries: KnowledgeEntry[] = bundle.entries as KnowledgeEntry[]
export const chatbotContent: ChatbotContent = bundle.chatbot as ChatbotContent
export const siteRoutes: Array<{ route: string; title: string; summary: string }> = bundle.site.routes

/** Sapaan untuk halaman tertentu; jatuh ke entri `*` bila halaman tidak punya sapaan khusus. */
export function greetingForRoute(route: string): string {
  const greetings = chatbotContent?.greetings ?? []
  const match = greetings.find((item) => item.route === route) ?? greetings.find((item) => item.route === '*')
  return match?.text?.trim() ?? ''
}

/** Maksimal 3 pertanyaan saran untuk halaman tertentu (fallback ke entri `*`). */
export function suggestedQuestionsForRoute(route: string): string[] {
  const groups = chatbotContent?.suggestedQuestions ?? []
  const match = groups.find((item) => item.route === route) ?? groups.find((item) => item.route === '*')
  return (match?.questions ?? []).filter(Boolean).slice(0, 3)
}

/**
 * Entri yang dikirim sebagai konteks untuk satu halaman:
 * entri halaman itu sendiri + konteks umum (site map, about, FAQ).
 */
export function selectEntriesForRoute(route: string, limit = 8): KnowledgeEntry[] {
  const primary = knowledgeEntries.filter((entry) => entry.route === route)

  // Halaman studi kasus: sertakan halaman indeks sebagai konteks tambahan.
  const related = route.startsWith('/case-study/')
    ? knowledgeEntries.filter((entry) => entry.type === 'caseStudyIndex')
    : []

  const always = knowledgeEntries.filter(
    (entry) => entry.type === 'about' || entry.type === 'chatbot' || entry.id === 'site:index',
  )

  const selected: KnowledgeEntry[] = []
  const seen = new Set<string>()

  for (const entry of [...primary, ...related, ...always]) {
    if (seen.has(entry.id)) continue
    seen.add(entry.id)
    selected.push(entry)
    if (selected.length >= limit) break
  }

  return selected
}
