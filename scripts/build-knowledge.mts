/**
 * Knowledge bundle builder — menghasilkan lib/knowledge/knowledge.generated.json.
 *
 * Dijalankan otomatis sebelum `next dev` dan `next build` (lihat package.json).
 * Sumber kebenaran isi chatbot adalah konten Sanity yang benar-benar tampil di situs:
 * field di-whitelist (bukan dump dokumen) agar data sensitif tidak ikut ke provider LLM.
 *
 * Pemakaian:
 *   node --env-file-if-exists=.env scripts/build-knowledge.mts           # lewati bila file sudah ada
 *   node --env-file-if-exists=.env scripts/build-knowledge.mts --force   # paksa regenerate
 */

import { createClient } from '@sanity/client'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { toPlainText } from '../lib/knowledge/portable-text.ts'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT = path.resolve(dirname, '../lib/knowledge/knowledge.generated.json')
const FORCE = process.argv.includes('--force')

// Di lokal, muat .env agar project/dataset mengikuti konfigurasi repo.
// Di Vercel file ini tidak ada — variabel sudah disuntik runtime, jadi kegagalan diabaikan.
try {
  process.loadEnvFile(path.resolve(dirname, '../.env'))
} catch {
  /* tidak ada .env — pakai env proses */
}

// Fallback aman: nilai ini juga tertulis di sanity/sanity.cli.ts (bukan rahasia).
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'irfb1i5g'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = '2026-04-17'

/** Peta halaman statis situs — struktural, bukan konten CMS. */
const ROUTES = [
  { route: '/', title: 'Home', summary: 'Hero, bio singkat, dan studi kasus unggulan.' },
  { route: '/about', title: 'About', summary: 'Biografi, pengalaman, stacks, klien, software & hardware, fun facts.' },
  { route: '/case-study', title: 'Case Studies', summary: 'Daftar seluruh studi kasus beserta ringkasannya.' },
  { route: '/builds', title: 'Builds', summary: 'Produk dan tema yang pernah dibangun lalu dipasarkan.' },
  { route: '/contact', title: 'Contact', summary: 'Form kontak untuk menghubungi Daniel.' },
]

const QUERIES = {
  about: `*[_type == "about" && _id == "about"][0]{
    heading, subheading, about,
    experiences[]{company, url, role, year},
    stacks, clients[]{name},
    software[]{title, link, description},
    hardware[]{title, link, description},
    funFacts[]{title, description}
  }`,
  projects: `*[_type == "projects"] | order(orderRank asc){
    title, "slug": slug.current, role, year, client, website, description, content, _updatedAt
  }`,
  builds: `*[_type == "shop"] | order(year desc, orderRank asc){
    title, "slug": slug.current, description, marketplaceName, marketplaceURL, preview, year, _updatedAt
  }`,
  chatbot: `*[_type == "chatbot" && _id == "chatbot"][0]{
    greetings[]{route, text},
    suggestedQuestions[]{route, questions},
    faqs[]{question, answer},
    escalation{triggers, message, waMessageTemplate},
    availability
  }`,
}

type Entry = {
  id: string
  type: 'route' | 'about' | 'caseStudy' | 'caseStudyIndex' | 'builds' | 'chatbot'
  route: string
  title: string
  summary: string
  body: string
  meta?: Record<string, unknown>
}

type AboutDoc = {
  heading?: string
  subheading?: unknown
  about?: unknown
  experiences?: Array<{ company?: string; url?: string; role?: string; year?: string }>
  stacks?: string[]
  clients?: Array<{ name?: string }>
  software?: Array<{ title?: string; link?: string; description?: string }>
  hardware?: Array<{ title?: string; link?: string; description?: string }>
  funFacts?: Array<{ title?: string; description?: unknown }>
}

type ProjectDoc = {
  title?: string
  slug?: string
  role?: string
  year?: number
  client?: string
  website?: string
  description?: string
  content?: unknown
  _updatedAt?: string
}

type BuildDoc = {
  title?: string
  slug?: string
  description?: string
  marketplaceName?: string
  marketplaceURL?: string
  preview?: string
  year?: number
}

type ChatbotDoc = {
  greetings?: Array<{ route?: string; text?: string }>
  suggestedQuestions?: Array<{ route?: string; questions?: string[] }>
  faqs?: Array<{ question?: string; answer?: string }>
  escalation?: { triggers?: string[]; message?: string; waMessageTemplate?: string }
  availability?: string
}

/** Rangkai potongan teks menjadi paragraf; nilai kosong dibuang. */
function paragraphs(...values: Array<string | undefined | null>): string {
  return values
    .map((value) => (value ?? '').trim())
    .filter(Boolean)
    .join('\n\n')
}

function buildEntries(about: AboutDoc | null, projects: ProjectDoc[], builds: BuildDoc[], bot: ChatbotDoc | null): Entry[] {
  const entries: Entry[] = []

  entries.push({
    id: 'site:index',
    type: 'route',
    route: '/',
    title: 'Site map',
    summary: 'Daftar halaman yang tersedia di situs.',
    body: [
      ...ROUTES.map((item) => `- ${item.route} — ${item.title}: ${item.summary}`),
      projects.length
        ? `\nCase studies tersedia:\n${projects
            .map((project) => `- /case-study/${project.slug ?? ''} — ${project.title ?? ''}: ${project.description ?? ''}`)
            .join('\n')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n'),
  })

  if (about) {
    const experiences = (about.experiences ?? [])
      .map((item) => `- ${item.role ?? ''} @ ${item.company ?? ''} (${item.year ?? ''})${item.url ? ` — ${item.url}` : ''}`)
      .join('\n')
    const software = (about.software ?? [])
      .map((item) => `- ${item.title ?? ''}: ${item.description ?? ''}${item.link ? ` — ${item.link}` : ''}`)
      .join('\n')
    const hardware = (about.hardware ?? [])
      .map((item) => `- ${item.title ?? ''}: ${item.description ?? ''}${item.link ? ` — ${item.link}` : ''}`)
      .join('\n')
    const funFacts = (about.funFacts ?? [])
      .map((item) => `- ${item.title ?? ''}: ${toPlainText(item.description)}`)
      .join('\n')

    entries.push({
      id: 'about:daniel',
      type: 'about',
      route: '/about',
      title: 'About Daniel Wijaya',
      summary: about.heading ?? '',
      body: paragraphs(
        about.heading,
        toPlainText(about.subheading),
        toPlainText(about.about),
        experiences && `Experience:\n${experiences}`,
        about.stacks?.length ? `Stacks: ${about.stacks.join(', ')}` : '',
        about.clients?.length ? `Clients: ${about.clients.map((client) => client.name ?? '').filter(Boolean).join(', ')}` : '',
        software && `Software used:\n${software}`,
        hardware && `Hardware used:\n${hardware}`,
        funFacts && `Fun facts:\n${funFacts}`,
      ),
      meta: { stacks: about.stacks?.length ?? 0, experiences: about.experiences?.length ?? 0 },
    })
  }

  if (projects.length) {
    entries.push({
      id: 'caseStudy:index',
      type: 'caseStudyIndex',
      route: '/case-study',
      title: 'Case Studies',
      summary: `${projects.length} studi kasus.`,
      body: projects
        .map(
          (project) =>
            `- ${project.title ?? ''} (${project.year ?? ''}) — ${project.description ?? ''} → /case-study/${project.slug ?? ''}`,
        )
        .join('\n'),
    })
  }

  for (const project of projects) {
    if (!project.slug || !project.title) continue

    entries.push({
      id: `caseStudy:${project.slug}`,
      type: 'caseStudy',
      route: `/case-study/${project.slug}`,
      title: project.title,
      summary: project.description ?? '',
      body: paragraphs(
        project.description,
        toPlainText(project.content),
        `Role: ${project.role ?? '-'} | Year: ${project.year ?? '-'} | Client: ${project.client ?? '-'}${
          project.website ? ` | Website: ${project.website}` : ''
        }`,
      ),
      meta: { role: project.role, year: project.year, client: project.client, updatedAt: project._updatedAt },
    })
  }

  if (builds.length) {
    entries.push({
      id: 'builds:index',
      type: 'builds',
      route: '/builds',
      title: 'Builds',
      summary: `${builds.length} produk/tema.`,
      body: builds
        .map(
          (build) =>
            `- ${build.title ?? ''} (${build.year ?? ''}) — ${build.description ?? ''}${
              build.marketplaceName ? ` | ${build.marketplaceName}` : ''
            }${build.marketplaceURL ? ` — ${build.marketplaceURL}` : ''}${build.preview ? ` | preview: ${build.preview}` : ''}`,
        )
        .join('\n'),
    })
  }

  entries.push({
    id: 'route:contact',
    type: 'route',
    route: '/contact',
    title: 'Contact',
    summary: 'Cara menghubungi Daniel.',
    body: paragraphs(
      'Visitors can reach Daniel through the contact form on /contact.',
      bot?.availability,
    ),
  })

  for (const route of ROUTES) {
    if (route.route === '/contact' || entries.some((entry) => entry.route === route.route)) continue
    entries.push({
      id: `route:${route.route}`,
      type: 'route',
      route: route.route,
      title: route.title,
      summary: route.summary,
      body: route.summary,
    })
  }

  const faqs = (bot?.faqs ?? []).filter((faq) => faq.question && faq.answer)
  if (faqs.length) {
    entries.push({
      id: 'chatbot:faq',
      type: 'chatbot',
      route: '*',
      title: 'Frequently asked questions',
      summary: `${faqs.length} FAQ.`,
      body: faqs.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n'),
    })
  }

  return entries
}

async function main() {
  if (!FORCE) {
    const existing = await readFile(OUTPUT, 'utf8').catch(() => null)
    if (existing) {
      const parsed = JSON.parse(existing) as { kbVersion?: string; stats?: Record<string, number> }
      console.info(`[knowledge] memakai bundle yang ada (kbVersion=${parsed.kbVersion ?? '-'}). Jalankan --force untuk regenerate.`)
      return
    }
  }

  const client = createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: 'published' })

  const [about, projects, builds, bot] = await Promise.all([
    client.fetch<AboutDoc | null>(QUERIES.about),
    client.fetch<ProjectDoc[]>(QUERIES.projects),
    client.fetch<BuildDoc[]>(QUERIES.builds),
    client.fetch<ChatbotDoc | null>(QUERIES.chatbot).catch(() => null),
  ])

  const entries = buildEntries(about, projects ?? [], builds ?? [], bot)
  if (entries.length === 0) throw new Error('bundle kosong: tidak ada entri yang terbentuk')

  const payload = JSON.stringify(entries)
  const chars = entries.reduce((total, entry) => total + entry.title.length + entry.body.length + entry.summary.length, 0)
  const kbVersion = `${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}+${createHash('sha1').update(payload).digest('hex').slice(0, 8)}`

  const bundle = {
    kbVersion,
    generatedAt: new Date().toISOString(),
    source: { projectId, dataset, apiVersion },
    site: { routes: ROUTES },
    chatbot: bot ?? null,
    entries,
    stats: { entries: entries.length, chars, approxTokens: Math.round(chars / 4) },
  }

  await mkdir(path.dirname(OUTPUT), { recursive: true })
  await writeFile(OUTPUT, `${JSON.stringify(bundle, null, 1)}\n`, 'utf8')

  console.info(
    `[knowledge] ${entries.length} entri · ${chars.toLocaleString('en-US')} char · ±${bundle.stats.approxTokens.toLocaleString('en-US')} token · kbVersion=${kbVersion}`,
  )
  console.info(`[knowledge] ditulis ke ${path.relative(process.cwd(), OUTPUT)}`)
}

main().catch(async (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  const existing = await readFile(OUTPUT, 'utf8').catch(() => null)

  if (existing) {
    // Sanity sedang tidak bisa diakses: jangan gagalkan build, pakai bundle terakhir.
    console.warn(`[knowledge] gagal regenerate (${message}) — memakai bundle yang sudah ada.`)
    return
  }

  console.error(`[knowledge] gagal membangun bundle: ${message}`)
  process.exitCode = 1
})
