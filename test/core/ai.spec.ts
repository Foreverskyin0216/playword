import { Document } from '@langchain/core/documents'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { afterAll, beforeAll, describe, test, expect, vi } from 'vitest'
import { AI, CANDIDATE_LIST_REFERENCE, DETERMINE_ASSERTION_RESULT, SUMMARIZE_ACTION } from '../../packages/core/src/ai'

const { mockFromTexts, mockMemoryVectorStore, mockOpenAIEmbeddings, mockInvoke } = vi.hoisted(() => ({
  mockFromTexts: vi.fn(),
  mockMemoryVectorStore: vi.fn(() => ({
    embeddings: mockOpenAIEmbeddings,
    asRetriever: vi.fn(() => ({ invoke: mockInvoke }))
  })),
  mockOpenAIEmbeddings: { embedDocuments: vi.fn().mockResolvedValue([[0]]) },
  mockInvoke: vi.fn()
}))
mockMemoryVectorStore['fromTexts'] = mockFromTexts

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn(() => ({
    bindTools: vi.fn(() => ({ invoke: mockInvoke })),
    withStructuredOutput: vi.fn(() => ({ invoke: mockInvoke }))
  })),
  OpenAIEmbeddings: vi.fn()
}))

vi.mock('../../packages/core/src/memoryStore', () => ({ MemoryVectorStore: mockMemoryVectorStore }))

describe('Spec: AI', () => {
  describe('Given the AI class', () => {
    const ai = new AI()

    describe('When the useTools method is called', () => {
      beforeAll(() => mockInvoke.mockResolvedValue(new AIMessage('response')))

      afterAll(() => mockInvoke.mockReset())

      test('Then the result is returned', async () => {
        const { content } = await ai.useTools([], [new HumanMessage('test')])
        expect(content).toBe('response')
      })
    })

    describe('When the searchDocuments method is called', () => {
      beforeAll(() => mockInvoke.mockResolvedValue([new Document({ pageContent: 'Document 1' })]))

      afterAll(() => mockInvoke.mockReset())

      test('Then the result is returned', async () => {
        const docs = await ai.searchDocuments('query')
        expect(docs).toEqual([new Document({ pageContent: 'Document 1' })])
      })
    })

    describe('When the embedDocuments method is called', () => {
      test('Then the mockFromTexts method is called', async () => {
        const texts = ['Document 1', 'Document 2']
        await ai.embedTexts(texts)
        expect(mockFromTexts).toBeCalledWith(texts, mockOpenAIEmbeddings)
      })
    })

    describe('When the parseResult method is called', () => {
      const messages = [new HumanMessage('Assertion')]

      beforeAll(() => mockInvoke.mockResolvedValue({ result: true }))

      afterAll(() => mockInvoke.mockReset())

      test('Then the result is returned', async () => {
        const result = await ai.parseResult(messages)
        expect(result).toBe(true)
      })

      test('Then the mockParse method is called', () => {
        expect(mockInvoke).toBeCalledWith([
          { role: 'system', content: DETERMINE_ASSERTION_RESULT },
          { role: 'user', content: 'User: Assertion' },
          { role: 'assistant', content: 'AI: Assertion' }
        ])
      })
    })

    describe('When the getBestCandidate method is called', () => {
      const input = 'Input'
      const docs = [new Document({ pageContent: 'Document 1' }), new Document({ pageContent: 'Document 2' })]

      beforeAll(() => mockInvoke.mockResolvedValue({ index: '1' }))

      afterAll(() => mockInvoke.mockReset())

      test('Then the result is returned', async () => {
        const candidate = await ai.getBestCandidate(input, docs)
        expect(candidate).toBe(1)
      })

      test('Then the mockParse method is called', () => {
        expect(mockInvoke).toBeCalledWith([
          {
            role: 'user',
            content: [
              { type: 'text', text: CANDIDATE_LIST_REFERENCE },
              { type: 'text', text: 'User input: ' + input },
              { type: 'text', text: 'Elements: Index 0: Document 1\nIndex 1: Document 2' }
            ]
          }
        ])
      })
    })

    describe('When the summarizeAction method is called', () => {
      const action = JSON.stringify({ name: 'click', params: { html: '<div></div>', xpath: '//div' } })

      beforeAll(() => mockInvoke.mockResolvedValue({ summary: 'Test Step' }))

      afterAll(() => mockInvoke.mockReset())

      test('Then the result is returned', async () => {
        const phrase = await ai.summarizeAction(action)
        expect(phrase).toBe('Test Step')
      })

      test('Then the mockParse method is called', () => {
        expect(mockInvoke).toBeCalledWith([
          {
            role: 'user',
            content: [
              { type: 'text', text: SUMMARIZE_ACTION },
              { type: 'text', text: action }
            ]
          }
        ])
      })
    })
  })
})
