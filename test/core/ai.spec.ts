import { Document } from '@langchain/core/documents'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { afterAll, beforeAll, describe, test, expect, vi } from 'vitest'
import {
  AI,
  CANDIDATE_LIST_REFERENCE,
  CANDIDATE_SCREENSHOT_REFERENCE,
  CHECK_IMAGE_INFORMATION,
  DETERMINE_ASSERTION_RESULT,
  RETRIEVE_IMAGE_INFORMATION
} from '../../packages/core/src/ai'

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

vi.mock('../../packages/core/src/memoryVectorStore', () => ({ MemoryVectorStore: mockMemoryVectorStore }))

describe('Spec: AI', () => {
  describe('Given the AI class', () => {
    const ai = new AI()

    describe('When the useTools method is called', () => {
      let result: AIMessage

      beforeAll(async () => {
        mockInvoke.mockResolvedValue(new AIMessage('response'))
        result = await ai.useTools([], [new HumanMessage('test')])
      })

      afterAll(() => mockInvoke.mockRestore())

      test('Then the result is returned', () => {
        expect(result.content).toBe('response')
      })
    })

    describe('When the searchDocuments method is called', () => {
      const query = 'query'
      let result: Document[]

      beforeAll(async () => {
        mockInvoke.mockResolvedValue([new Document({ pageContent: 'Document 1' })])
        result = await ai.searchDocuments(query)
      })

      afterAll(() => mockInvoke.mockRestore())

      test('Then the result is returned', () => {
        expect(result).toEqual([new Document({ pageContent: 'Document 1' })])
      })
    })

    describe('When the embedDocuments method is called', () => {
      const documents = ['Document 1', 'Document 2']

      beforeAll(async () => await ai.embedDocuments(documents))

      test('Then the mockFromTexts method is called', () => {
        expect(mockFromTexts).toHaveBeenCalledWith(documents, mockOpenAIEmbeddings)
      })
    })

    describe('When the parseResult method is called', () => {
      const messages = [new HumanMessage('Assertion')]
      let result: boolean

      beforeAll(async () => {
        mockInvoke.mockResolvedValue({ result: true })
        result = await ai.parseResult(messages)
      })

      afterAll(() => mockInvoke.mockRestore())

      test('Then the result is returned', () => {
        expect(result).toBe(true)
      })

      test('Then the mockParse method is called', () => {
        expect(mockInvoke).toHaveBeenCalledWith([
          { role: 'system', content: DETERMINE_ASSERTION_RESULT },
          { role: 'user', content: 'User: Assertion' },
          { role: 'assistant', content: 'AI: Assertion' }
        ])
      })
    })

    describe('When the getBestCandidate method is called', () => {
      const input = 'Input'
      const docs = [new Document({ pageContent: 'Document 1' }), new Document({ pageContent: 'Document 2' })]
      let resultWithScreenshot: number
      let resultWithoutScreenshot: number

      beforeAll(async () => {
        mockInvoke.mockResolvedValue({ index: '1' })
        resultWithScreenshot = await ai.getBestCandidate(input, docs, 'Screenshot')
        resultWithoutScreenshot = await ai.getBestCandidate(input, docs)
      })

      afterAll(() => mockInvoke.mockRestore())

      test('Then the result is returned', () => {
        expect(resultWithScreenshot).toBe(1)
        expect(resultWithoutScreenshot).toBe(1)
      })

      test('Then the mockParse method is called', () => {
        expect(mockInvoke).toHaveBeenNthCalledWith(1, [
          {
            role: 'user',
            content: [
              { type: 'text', text: CANDIDATE_SCREENSHOT_REFERENCE },
              { type: 'text', text: 'User input: ' + input },
              { type: 'text', text: 'Candidates: Index 0: Document 1\nIndex 1: Document 2' },
              { type: 'image_url', image_url: { url: 'Screenshot' } }
            ]
          }
        ])

        expect(mockInvoke).toHaveBeenNthCalledWith(2, [
          {
            role: 'user',
            content: [
              { type: 'text', text: CANDIDATE_LIST_REFERENCE },
              { type: 'text', text: 'User input: ' + input },
              { type: 'text', text: 'Candidates: Index 0: Document 1\nIndex 1: Document 2' }
            ]
          }
        ])
      })
    })

    describe('When the retrieveImageInformation method is called', () => {
      const input = 'Input'
      const image = 'Image'
      let result: string

      beforeAll(async () => {
        mockInvoke.mockResolvedValue({ info: 'Information' })
        result = await ai.retrieveImageInformation(input, image)
      })

      afterAll(() => mockInvoke.mockRestore())

      test('Then the result is returned', () => {
        expect(result).toBe('Information')
      })

      test('Then the mockParse method is called', () => {
        expect(mockInvoke).toHaveBeenCalledWith([
          {
            role: 'user',
            content: [
              { type: 'text', text: RETRIEVE_IMAGE_INFORMATION },
              { type: 'text', text: 'User input: ' + input },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ])
      })
    })

    describe('When the checkImageInformation method is called', () => {
      const input = 'Input'
      const image = 'Image'
      let result: boolean

      beforeAll(async () => {
        mockInvoke.mockResolvedValue({ result: true })
        result = await ai.checkImageInformation(input, image)
      })

      afterAll(() => mockInvoke.mockRestore())

      test('Then the result is returned', () => {
        expect(result).toBe(true)
      })

      test('Then the mockParse method is called', () => {
        expect(mockInvoke).toHaveBeenCalledWith([
          {
            role: 'user',
            content: [
              { type: 'text', text: CHECK_IMAGE_INFORMATION },
              { type: 'text', text: 'User input: ' + input },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ])
      })
    })
  })
})
