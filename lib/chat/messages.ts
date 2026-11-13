export const visitorMessages = {
  declinedRequest:
    "I can't help with that here. I'm Daniel's AI assistant, so I'm best for questions about his work and portfolio — or you can reach Daniel through the contact page.",

  declinedRequestId:
    'Maaf, saya tidak bisa membantu untuk hal itu di sini. Saya asisten AI Daniel, jadi saya paling tepat membantu pertanyaan seputar karya dan portofolionya — atau Anda bisa menghubungi Daniel lewat halaman kontak.',

  noAnswer:
    "I don't have that detail in Daniel's portfolio. Would you like me to connect you with Daniel directly?",

  temporarilyUnavailable:
    "I can't answer that right now, but Daniel can. Would you like me to connect you with him directly?",

  slowDown:
    "Let's take this one at a time — I can answer your next question in a moment. If it's urgent, Daniel is one message away.",

  sessionLimit:
    "We've covered a lot in this chat. For anything else, I'd recommend messaging Daniel directly — he'll pick it up from here.",

  emptyAnswer:
    "I couldn't put that into words just now. Could you ask it a different way — or shall I connect you with Daniel?",

  tooLong:
    "That message is a bit long for me. Could you shorten it to one or two sentences?",

  emptyInput: "Type a question and I'll do my best to help.",

  escalation: {
    prompt: "Would you like me to connect you directly via WhatsApp?",
    cta: "Continue to WhatsApp",
    secondary: "Contact Daniel",
    prefilled: "Hi Daniel, I'm on your portfolio ({page}) and would like to discuss a project.",
  },
} as const

export type VisitorMessageKey = keyof Omit<typeof visitorMessages, 'escalation'>