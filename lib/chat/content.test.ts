import { describe, expect, it } from 'vitest'

import { CHATBOT_CONTENT, resolveGreeting, resolveSuggestedQuestions } from './content'

describe('hardcoded chatbot content', () => {
  it('resolves greetings and suggestions for the current route', () => {
    expect(resolveGreeting('/')).toContain('portfolio assistant')
    expect(resolveSuggestedQuestions('/builds')).toEqual(CHATBOT_CONTENT.suggestedQuestions['/builds'])
  })

  it('memakai sapaan index studi kasus untuk halaman studi kasus', () => {
    expect(resolveGreeting('/case-study/some-slug')).toBe(CHATBOT_CONTENT.greetings['/case-study'])
    expect(resolveSuggestedQuestions('/case-study/some-slug')).toEqual(CHATBOT_CONTENT.suggestedQuestions['/case-study'])
  })

  it('memakai sapaan bintang untuk halaman yang tidak punya sapaan khusus', () => {
    expect(resolveGreeting('/unknown-page')).toBe(CHATBOT_CONTENT.greetings['*'])
  })

  it('tidak menampilkan sapaan di halaman kontak', () => {
    expect(resolveGreeting('/contact')).toBe('')
  })
})
