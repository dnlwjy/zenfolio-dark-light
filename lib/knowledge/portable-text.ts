/**
 * Portable Text (Sanity) → plain text.
 *
 * Dipakai oleh knowledge bundle builder: chatbot harus membaca teks yang sama
 * dengan yang dilihat pengunjung, tanpa markup CMS.
 *
 * Sengaja deterministik: heading, list, tautan, dan teks tebal/miring diratakan
 * menjadi teks; gambar dan blok tak dikenal dilewati.
 */

type Span = {
  _type?: string
  text?: string
  marks?: string[]
}

type MarkDef = {
  _key?: string
  _type?: string
  href?: string
}

type Block = {
  _type?: string
  style?: string
  listItem?: string
  level?: number
  children?: Span[]
  markDefs?: MarkDef[]
  code?: string
}

const HEADING_PREFIX: Record<string, string> = {
  h1: '# ',
  h2: '## ',
  h3: '### ',
  h4: '#### ',
}

function renderSpans(block: Block): string {
  const markDefs = block.markDefs ?? []

  return (block.children ?? [])
    .map((span) => {
      const text = span.text ?? ''
      if (!text) return ''

      const links = (span.marks ?? [])
        .map((mark) => markDefs.find((def) => def._key === mark))
        .filter((def): def is MarkDef => Boolean(def && def._type === 'link' && def.href))

      // Tautan ditulis sebagai "teks (url)" supaya model bisa menyebut sumbernya.
      return links.length === 0 ? text : `${text} (${links.map((def) => def.href).join(', ')})`
    })
    .join('')
}

/**
 * Ubah array block Portable Text menjadi teks biasa.
 * Aman terhadap input apa pun: nilai bukan array / block rusak menghasilkan string kosong.
 */
export function toPlainText(input: unknown): string {
  if (!Array.isArray(input)) return ''

  const parts: string[] = []

  for (const raw of input as Block[]) {
    if (!raw || typeof raw !== 'object') continue

    if (raw._type === 'block') {
      const line = renderSpans(raw).replace(/\s+/g, ' ').trim()
      if (!line) continue

      if (raw.listItem) {
        const indent = '  '.repeat(Math.max(0, (raw.level ?? 1) - 1))
        parts.push(`${indent}- ${line}`)
        continue
      }

      parts.push(`${HEADING_PREFIX[raw.style ?? 'normal'] ?? ''}${line}`)
      continue
    }

    if (raw._type === 'code' && typeof raw.code === 'string') {
      parts.push(raw.code.replace(/\s+/g, ' ').trim())
    }

    // image, file, dan tipe lain dilewati (tidak berguna untuk penjawaban teks)
  }

  return parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim()
}
