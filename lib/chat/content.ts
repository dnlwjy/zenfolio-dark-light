/**
 * Konten chatbot default (bahasa Inggris, sesuai bahasa situs) + penggabungan dengan CMS.
 *
 * Default ada di kode supaya chatbot tetap berguna sebelum doc `chatbot` di Sanity
 * di-deploy — dan supaya build tidak pernah bergantung pada isi CMS. Nilai dari CMS
 * selalu menimpa default per field, bukan menggantikan seluruh konten.
 *
 * `scripts/build-chatbot-seed.mts` mengubah default ini menjadi berkas seed siap
 * di-import ke Sanity, jadi konten di CMS tetap bisa disunting tanpa deploy ulang.
 */

import type { ChatbotContent } from '../knowledge'

const GREETINGS: Record<string, string> = {
  '/': "Hi! I'm Daniel's portfolio assistant. Ask me anything about his work, projects, or how he can help.",
  '/about': "This is Daniel's story — the work, the tools, and how he thinks. Feel free to ask me anything.",
  '/case-study': "These are Daniel's case studies. Feel free to ask me anything about them.",
  '/builds': "These are the tools and products Daniel builds. Ask me about any of them.",
  // Halaman kontak tidak diberi sapaan supaya tidak mengganggu form.
  '/contact': '',
  '*': "Feel free to ask me anything about Daniel's work.",
}

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  '/': ['What does Daniel do best?', 'Which project is closest to mine?', 'How can I work with Daniel?'],
  '/about': ['Which tools does Daniel use daily?', 'What is his experience?', 'What kind of projects does he take on?'],
  '/case-study': ['Which case study fits a booking system?', 'What was the hardest problem he solved?', 'Which project used AI?'],
  '/builds': ['What is the most recent build?', 'Does he publish free templates?', 'Where can I buy his work?'],
  '/contact': ['How do I start a project with Daniel?', 'Is he available for new projects?', 'How soon can he start?'],
  '*': ['What does Daniel do?', 'Which project is most relevant to me?', 'How can I contact him?'],
}

const FAQS: Array<{ question: string; answer: string }> = [
  {
    question: 'Is Daniel available for new projects?',
    answer:
      'Availability is kept current on the contact page. The quickest way to confirm timing for a specific project is to message him directly.',
  },
  {
    question: 'How does Daniel usually work with a client?',
    answer:
      'He works as a designer-developer: design in Figma, build in Framer or React, then hand over with documentation, SEO, and AI-discoverability handled.',
  },
  {
    question: 'Where can I see live examples of his work?',
    answer:
      'The case studies page lists shipped work with the problem and the result, and the builds page lists products and templates with marketplace links.',
  },
]

export type ResolvedChatbotContent = {
  greetings: Record<string, string>
  suggestedQuestions: Record<string, string[]>
  faqs: Array<{ question: string; answer: string }>
  escalation: { triggers: string[]; message: string; waMessageTemplate: string }
  availability: string
}

export const DEFAULT_CHATBOT_CONTENT: ResolvedChatbotContent = {
  greetings: { ...GREETINGS },
  suggestedQuestions: { ...SUGGESTED_QUESTIONS },
  faqs: FAQS,
  escalation: {
    triggers: ['hire', 'hiring', 'quote', 'rate', 'budget', 'available', 'availability', 'collaborate', 'freelance', 'contract', 'work with you', 'work together', 'contact', 'whatsapp', 'reach out', 'get in touch', 'email', 'phone', 'talk to daniel', 'message daniel', 'hubungi', 'kontak'],
    message: 'Would you like me to connect you directly with Daniel on WhatsApp?',
    waMessageTemplate: "Hi Daniel, I'm on your portfolio ({page}) and would like to discuss a project.",
  },
  availability: '',
}

/** Urutan pencarian: route persis, lalu index studi kasus, lalu sapaan bintang. */
function pickForRoute<T>(map: Record<string, T>, route: string): T | undefined {
  if (route in map) return map[route]
  if (route.startsWith('/case-study/') && '/case-study' in map) return map['/case-study']
  return map['*']
}

export function resolveGreeting(route: string, content: ResolvedChatbotContent): string {
  return pickForRoute(content.greetings, route) ?? ''
}

export function resolveSuggestedQuestions(route: string, content: ResolvedChatbotContent): string[] {
  return (pickForRoute(content.suggestedQuestions, route) ?? []).slice(0, 3)
}

/** Gabungkan konten CMS di atas default: per field, bukan menggantikan seluruh konten. */
export function resolveChatbotContent(cms: ChatbotContent): ResolvedChatbotContent {
  const greetings: Record<string, string> = { ...DEFAULT_CHATBOT_CONTENT.greetings }
  for (const entry of cms?.greetings ?? []) {
    if (entry.route) greetings[entry.route] = (entry.text ?? '').trim()
  }

  const suggestedQuestions: Record<string, string[]> = { ...DEFAULT_CHATBOT_CONTENT.suggestedQuestions }
  for (const entry of cms?.suggestedQuestions ?? []) {
    if (entry.route) suggestedQuestions[entry.route] = (entry.questions ?? []).filter(Boolean).slice(0, 3)
  }

  const cmsFaqs = (cms?.faqs ?? [])
    .filter((faq) => faq.question && faq.answer)
    .map((faq) => ({ question: faq.question as string, answer: faq.answer as string }))

  const escalation = {
    triggers: (cms?.escalation?.triggers ?? []).filter(Boolean).length
      ? (cms?.escalation?.triggers ?? []).filter(Boolean)
      : DEFAULT_CHATBOT_CONTENT.escalation.triggers,
    message: cms?.escalation?.message?.trim() || DEFAULT_CHATBOT_CONTENT.escalation.message,
    waMessageTemplate: cms?.escalation?.waMessageTemplate?.trim() || DEFAULT_CHATBOT_CONTENT.escalation.waMessageTemplate,
  }

  return {
    greetings,
    suggestedQuestions,
    faqs: [...cmsFaqs, ...DEFAULT_CHATBOT_CONTENT.faqs],
    escalation,
    availability: (cms?.availability ?? '').trim(),
  }
}
