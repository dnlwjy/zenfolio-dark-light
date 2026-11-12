/**
 * Normalisasi teks untuk pencocokan frasa.
 *
 * Model (khususnya OpenAI) sering mengeluarkan tanda kutip tipografis: `don’t` (U+2019),
 * `“…”` (U+201C/U+201D). Pencocokan frasa apa pun harus menormalkannya lebih dulu,
 * kalau tidak tombol kontak / penilaian eval akan gagal mengenali jawaban yang benar.
 */

export function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc\u2032]/g, "'")
    .replace(/[\u201c\u201d\u2033]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}
