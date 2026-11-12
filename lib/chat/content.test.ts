import { describe, expect, it } from 'vitest'

import { DEFAULT_CHATBOT_CONTENT, resolveChatbotContent, resolveGreeting, resolveSuggestedQuestions } from './content'

describe('resolveChatbotContent', () => {
  it('memakai default ketika CMS kosong', () => {
    const content = resolveChatbotContent(null)

    expect(resolveGreeting('/', content)).toContain('portfolio assistant')
    expect(resolveSuggestedQuestions('/builds', content)).toHaveLength(3)
  })

  it('menimpa default dengan nilai CMS untuk route yang sama', () => {
    const content = resolveChatbotContent({ greetings: [{ route: '/builds', text: 'Custom greeting' }] })

    expect(resolveGreeting('/builds', content)).toBe('Custom greeting')
    expect(resolveGreeting('/about', content)).toContain('story')
  })

  it('memakai sapaan index studi kasus untuk halaman studi kasus', () => {
    const content = resolveChatbotContent(null)

    expect(resolveGreeting('/case-study/some-slug', content)).toBe(DEFAULT_CHATBOT_CONTENT.greetings['/case-study'])
  })

  it('memakai sapaan bintang untuk halaman yang tidak punya sapaan khusus', () => {
    const content = resolveChatbotContent(null)

    expect(resolveGreeting('/unknown-page', content)).toBe(DEFAULT_CHATBOT_CONTENT.greetings['*'])
  })

  it('tidak menampilkan sapaan di halaman kontak', () => {
    expect(resolveGreeting('/contact', resolveChatbotContent(null))).toBe('')
  })

  it('menggabungkan FAQ dari CMS dengan FAQ default', () => {
    const content = resolveChatbotContent({ faqs: [{ question: 'Custom?', answer: 'Yes' }] })

    expect(content.faqs[0]).toEqual({ question: 'Custom?', answer: 'Yes' })
    expect(content.faqs.length).toBeGreaterThan(1)
  })

  it('menyertakan FAQ identitas dan kapabilitas default', () => {
    const questions = resolveChatbotContent(null).faqs.map((faq) => faq.question)

    expect(questions).toContain('Who are you?')
    expect(questions).toContain('What can you do?')
    expect(questions).toContain('Are you Daniel?')
  })

  it('membatasi pertanyaan saran maksimal tiga', () => {
    const content = resolveChatbotContent({ suggestedQuestions: [{ route: '/', questions: ['a', 'b', 'c', 'd'] }] })

    expect(resolveSuggestedQuestions('/', content)).toHaveLength(3)
  })
})
