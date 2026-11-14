import bundle from './knowledge.static.json'

export type KnowledgeEntryType = 'route' | 'about' | 'caseStudy' | 'caseStudyIndex' | 'builds' | 'legal'

export type KnowledgeEntry = {
  id: string
  type: KnowledgeEntryType
  route: string
  title: string
  summary: string
  body: string
  meta?: Record<string, unknown>
}

export const kbVersion: string = bundle.kbVersion
export const knowledgeEntries: KnowledgeEntry[] = bundle.entries as KnowledgeEntry[]
export const siteRoutes: Array<{ route: string; title: string; summary: string }> = bundle.site.routes

export function selectEntriesForRoute(route: string, limit = 8): KnowledgeEntry[] {
  const primary = knowledgeEntries.filter((entry) => entry.route === route)

  const related = route.startsWith('/case-study/')
    ? knowledgeEntries.filter((entry) => entry.type === 'caseStudyIndex')
    : []

  const always = knowledgeEntries.filter(
    (entry) => entry.type === 'about' || entry.id === 'site:index',
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
