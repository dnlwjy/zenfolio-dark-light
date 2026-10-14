/**
 * Runner eval chatbot: menguji pipeline prompt yang SAMA dengan produksi
 * (knowledge bundle → buildMessages → streamChat), bukan lewat HTTP.
 *
 * Jalankan: bun scripts/eval-chat.mts
 * Grup "hire" tidak memanggil model — hanya menguji deteksi intent (cepat & gratis).
 */

import './load-env.mts' // WAJIB paling atas: memuat .env sebelum modul lib dievaluasi

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { streamChat } from '../lib/ai/chat-completion.ts'
import { computeCost } from '../lib/ai/pricing.ts'
import { resolveActiveModel } from '../lib/ai/providers.ts'
import { detectEscalationIntent } from '../lib/chat/boundary.ts'
import { resolveChatbotContent } from '../lib/chat/content.ts'
import { visitorMessages } from '../lib/chat/messages.ts'
import { normalizeForMatch } from '../lib/chat/text.ts'
import { buildMessages } from '../lib/chat/prompt.ts'
import { chatbotContent, kbVersion } from '../lib/knowledge/index.ts'

type EvalCase = {
  id: string
  group: string
  route: string
  question: string
  expect: { kind: 'contains' | 'escalation' | 'no-escalation' | 'refusal' | 'honest-unknown' | 'refusal-or-unknown'; any?: string[]; note?: string }
}

const dirname = path.dirname(fileURLToPath(import.meta.url))

const set = JSON.parse(await readFile(path.resolve(dirname, '../eval/chat-eval-set.json'), 'utf8')) as { cases: EvalCase[] }
const faqs = resolveChatbotContent(chatbotContent).faqs
let resolved = resolveActiveModel()

const REFUSAL_MARKERS = [visitorMessages.outOfScope.toLowerCase(), 'only help with questions about', "i can't help with"]
const UNKNOWN_MARKERS = ["don't have", 'do not have', 'not listed', 'no information', "isn't listed", 'no record']

function judge(testCase: EvalCase, answer: string): boolean {
  const text = normalizeForMatch(answer)
  const any = testCase.expect.any ?? []

  switch (testCase.expect.kind) {
    case 'contains':
      return any.some((needle) => text.includes(normalizeForMatch(needle)))
    case 'refusal':
      return REFUSAL_MARKERS.some((marker) => text.includes(marker))
    case 'honest-unknown':
      return UNKNOWN_MARKERS.some((marker) => text.includes(marker))
    case 'refusal-or-unknown':
      // Pertanyaan di luar portfolio kadang ditolak dengan template tetap, kadang dijawab
      // "tidak ada detailnya" — keduanya benar, tombol kontak ikut tampil pada keduanya.
      return (
        REFUSAL_MARKERS.some((marker) => text.includes(marker)) || UNKNOWN_MARKERS.some((marker) => text.includes(marker))
      )
    case 'escalation':
      return detectEscalationIntent(testCase.question)
    case 'no-escalation':
      return !detectEscalationIntent(testCase.question)
  }
}

let passed = 0
let totalCost = 0
const failures: string[] = []
const startedAt = Date.now()

for (const testCase of set.cases) {
  if (testCase.expect.kind === 'escalation' || testCase.expect.kind === 'no-escalation') {
    const ok = judge(testCase, '')
    passed += ok ? 1 : 0
    if (!ok) failures.push(`${testCase.id} (intent)`)
    console.info(`${ok ? 'PASS' : 'FAIL'} ${testCase.id.padEnd(12)} ${testCase.group.padEnd(8)} intent ${ok ? 'sesuai' : 'TIDAK sesuai'}`)
    continue
  }

  const messages = buildMessages({ route: testCase.route, history: [], question: testCase.question, faqs })
  let answer = ''
  const usage = { tokensIn: 0, cachedTokensIn: 0, tokensOut: 0 }
  const caseStart = Date.now()

  // Meniru perilaku produksi: provider kadang mengembalikan jawaban kosong sekali,
  // jadi runner juga mencoba ulang sekali sebelum menilai.
  const runOnce = async () => {
    answer = ''
    for await (const event of streamChat({ resolved, messages, maxOutputTokens: 400 })) {
      if (event.type === 'delta') answer += event.text
      if (event.type === 'usage') Object.assign(usage, event.usage)
    }
  }

  try {
    await runOnce()
    if (!answer.trim()) {
      // Paritas produksi: coba ulang, lalu jatuh ke model cadangan bila masih kosong.
      console.info(`RETRY ${testCase.id.padEnd(12)} jawaban kosong — dicoba ulang`)
      await runOnce()
    }

    if (!answer.trim() && resolved.fallback) {
      console.info(`RETRY ${testCase.id.padEnd(12)} masih kosong — memakai model cadangan`)
      const previous = resolved.model
      resolved = { ...resolved, model: resolved.fallback.model, fallback: null } as typeof resolved
      await runOnce()
      resolved = { ...resolved, model: previous, fallback: { model: previous, apiKey: resolved.apiKey, endpoint: resolved.endpoint } } as typeof resolved
    }
  } catch (error) {
    failures.push(`${testCase.id} (error: ${error instanceof Error ? error.message : String(error)})`)
    console.info(`FAIL ${testCase.id.padEnd(12)} ${testCase.group.padEnd(8)} error`)
    continue
  }

  const cost = computeCost(resolved.provider.id, resolved.model.id, usage).usd
  totalCost += cost

  const ok = judge(testCase, answer)
  passed += ok ? 1 : 0
  const seconds = ((Date.now() - caseStart) / 1000).toFixed(1)

  if (!ok) failures.push(`${testCase.id}: "${answer.replace(/\s+/g, ' ').slice(0, 120)}"`)
  console.info(
    `${ok ? 'PASS' : 'FAIL'} ${testCase.id.padEnd(12)} ${testCase.group.padEnd(8)} ${seconds}s $${cost.toFixed(5)} ${ok ? '' : `→ ${answer.replace(/\s+/g, ' ').slice(0, 90)}`}`,
  )
}

console.info('')
console.info(`kbVersion ${kbVersion} · model ${resolved.provider.id}/${resolved.model.id}`)
console.info(`HASIL ${passed}/${set.cases.length} lulus · total ${((Date.now() - startedAt) / 1000).toFixed(0)}s · biaya $${totalCost.toFixed(4)}`)

if (failures.length > 0) {
  console.info('\nKegagalan:')
  for (const failure of failures) console.info(`- ${failure}`)
  process.exitCode = 1
}
