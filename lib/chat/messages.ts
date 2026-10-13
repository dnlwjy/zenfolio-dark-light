/**
 * Semua pesan yang dilihat pengunjung, terkumpul di satu tempat.
 *
 * Aturan: pengunjung tidak boleh melihat istilah teknis apa pun — tidak ada
 * "error", "credit", "rate limit", "API", nama provider, atau kode status.
 * Pesan hanya boleh menjelaskan keadaan dalam bahasa manusia dan selalu
 * menyisakan jalan keluar (tombol WhatsApp / halaman kontak).
 *
 * Dipakai oleh: /api/chat (fallback), boundary layer (penolakan tetap),
 * dan widget (tombol eskalasi).
 */

export const visitorMessages = {
  /** Di luar topik portfolio. */
  outOfScope:
    "I can only help with questions about Daniel's work and portfolio. For anything else, feel free to reach out through the contact page.",

  /** Jawaban tidak ada di knowledge base. */
  noAnswer:
    "I don't have that detail in Daniel's portfolio. Would you like me to connect you with Daniel directly?",

  /** Provider/model sedang tidak bisa melayani (kredit habis, gangguan, timeout). */
  temporarilyUnavailable:
    "I can't answer that right now, but Daniel can. Would you like me to connect you with him directly?",

  /** Pengunjung memakai jatah bertanya lebih cepat dari yang diizinkan. */
  slowDown:
    "Let's take this one at a time — I can answer your next question in a moment. If it's urgent, Daniel is one message away.",

  /** Batas pertanyaan per percakapan tercapai. */
  sessionLimit:
    "We've covered a lot in this chat. For anything else, I'd recommend messaging Daniel directly — he'll pick it up from here.",

  /** Model mengembalikan jawaban kosong / terpotong sebelum ada isi. */
  emptyAnswer:
    "I couldn't put that into words just now. Could you ask it a different way — or shall I connect you with Daniel?",

  /** Pengunjung mengirim pesan kosong/terlalu panjang. */
  tooLong:
    "That message is a bit long for me. Could you shorten it to one or two sentences?",

  emptyInput: "Type a question and I'll do my best to help.",

  /** Panggilan WhatsApp (teks tombol, bukan jawaban chat). */
  escalation: {
    prompt: "Would you like me to connect you directly via WhatsApp?",
    cta: "Continue to WhatsApp",
    secondary: "Use the contact page instead",
    prefilled: "Hi Daniel, I'm on your portfolio ({page}) and would like to discuss a project.",
  },
} as const

export type VisitorMessageKey = keyof Omit<typeof visitorMessages, 'escalation'>
