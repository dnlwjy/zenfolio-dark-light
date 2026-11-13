
const GREETINGS: Record<string, string> = {
  '/': "Welcome to my portfolio website! Feel free to ask me anything =D",
  '/about': "This is about page where you can learn more about me.",
  '/case-study': "This is my case study. Feel free to ask me anything =D",
  '/builds': "This is what I've built in the past. Feel free to ask me anything =D",
  '/contact': "Yoohooo, let's discuss something!",
  '*': "Feel free to ask me anything about my works =D",
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
  {
    question: 'Who are you?',
    answer:
      "I'm Daniel's AI assistant, not Daniel himself. I help visitors understand his work, case studies, and builds, and I can point you to the right page or to his contact details.",
  },
  {
    question: 'What can you do?',
    answer:
      "I can answer questions about Daniel's work, skills, projects, and process, and help you find the right page. I can also handle short general questions, but Daniel's portfolio is my main focus.",
  },
  {
    question: 'Are you Daniel?',
    answer:
      "No — I'm an AI assistant for Daniel's portfolio. Daniel replies personally through the contact page or WhatsApp.",
  },
  {
    question: 'What language do you speak?',
    answer: 'I answer in the language you use, including English and Indonesian.',
  },
]

export type ChatbotContent = {
  greetings: Record<string, string>
  suggestedQuestions: Record<string, string[]>
  faqs: Array<{ question: string; answer: string }>
  escalation: { triggers: string[]; message: string; waMessageTemplate: string }
}

export const CHATBOT_CONTENT: ChatbotContent = {
  greetings: GREETINGS,
  suggestedQuestions: SUGGESTED_QUESTIONS,
  faqs: FAQS,
  escalation: {
    triggers: ['hire', 'hiring', 'quote', 'rate', 'budget', 'available', 'availability', 'collaborate', 'freelance', 'contract', 'work with you', 'work together', 'contact', 'whatsapp', 'reach out', 'get in touch', 'email', 'phone', 'talk to daniel', 'message daniel', 'hubungi', 'kontak'],
    message: 'Would you like me to connect you directly with Daniel on WhatsApp?',
    waMessageTemplate: "Hi Daniel, I'm on your portfolio ({page}) and would like to discuss a project.",
  },
}

function pickForRoute<T>(map: Record<string, T>, route: string): T | undefined {
  if (route in map) return map[route]
  if (route.startsWith('/case-study/') && '/case-study' in map) return map['/case-study']
  return map['*']
}

export function resolveGreeting(route: string): string {
  return pickForRoute(CHATBOT_CONTENT.greetings, route) ?? ''
}

export function resolveSuggestedQuestions(route: string): string[] {
  return (pickForRoute(CHATBOT_CONTENT.suggestedQuestions, route) ?? []).slice(0, 3)
}
