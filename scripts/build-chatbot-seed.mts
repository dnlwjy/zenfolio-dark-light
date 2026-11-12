/**
 * Menghasilkan seed doc `chatbot` untuk Sanity dari konten default di `lib/chat/content.ts`.
 *
 * Pemakaian: node scripts/build-chatbot-seed.mts
 * Output   : sanity/seed/chatbot.json — impor lewat Sanity CLI atau Studio (paste ke dokumen baru).
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { DEFAULT_CHATBOT_CONTENT } from '../lib/chat/content.ts'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT = path.resolve(dirname, '../sanity/seed/chatbot.json')

const keyOf = (prefix: string, value: string) =>
  `${prefix}-${value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'root'}`

const document = {
  _id: 'chatbot',
  _type: 'chatbot',
  greetings: Object.entries(DEFAULT_CHATBOT_CONTENT.greetings)
    .filter(([, text]) => text.trim().length > 0)
    .map(([route, text]) => ({ _key: keyOf('greeting', route), route, text })),
  suggestedQuestions: Object.entries(DEFAULT_CHATBOT_CONTENT.suggestedQuestions).map(([route, questions]) => ({
    _key: keyOf('questions', route),
    route,
    questions: questions.slice(0, 3),
  })),
  faqs: DEFAULT_CHATBOT_CONTENT.faqs.map((faq, index) => ({
    _key: `faq-${index + 1}`,
    question: faq.question,
    answer: faq.answer,
  })),
  escalation: DEFAULT_CHATBOT_CONTENT.escalation,
  availability: DEFAULT_CHATBOT_CONTENT.availability,
}

await mkdir(path.dirname(OUTPUT), { recursive: true })
await writeFile(OUTPUT, `${JSON.stringify(document, null, 2)}\n`, 'utf8')

console.info(
  `[chatbot-seed] ${document.greetings.length} greeting · ${document.suggestedQuestions.length} set pertanyaan · ${document.faqs.length} FAQ`,
)
console.info(`[chatbot-seed] ditulis ke ${path.relative(process.cwd(), OUTPUT)}`)
