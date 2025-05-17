import { Document } from '@langchain/core/documents'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { afterAll, beforeAll, describe, test, expect, vi } from 'vitest'
import { AI } from '../../packages/core/src/ai'
import * as prompts from '../../packages/core/src/prompts'

const { mockFromTexts, mockMemoryVectorStore, mockOpenAIEmbeddings, mockInvoke } = vi.hoisted(() => ({
  mockFromTexts: vi.fn(),
  mockGoogleGenerativeAIEmbeddings: { embedDocuments: vi.fn().mockResolvedValue([[0]]) },
  mockMemoryVectorStore: vi.fn(() => ({
    asRetriever: vi.fn(() => ({ invoke: mockInvoke })),
    embeddings: mockOpenAIEmbeddings
  })),
  mockOpenAIEmbeddings: { embedDocuments: vi.fn().mockResolvedValue([[0]]) },
  mockVoyageEmbeddings: { embedDocuments: vi.fn().mockResolvedValue([[0]]) },
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

vi.mock('../../packages/core/src/store', () => ({ MemoryVectorStore: mockMemoryVectorStore }))

describe('Spec: AI', () => {
  let ai: AI = new AI({ openAIApiKey: 'mock-openai-api-key' })

  describe('Given the AI class with OpenAI configuration', () => {
    describe('When the analyzeImage method is called', () => {
      const image = 'image-url'
      const input = 'Input'

      beforeAll(() => mockInvoke.mockResolvedValue({ data: 'response' }))

      afterAll(() => mockInvoke.mockReset())

      test('Then the result is returned', async () => {
        const result = await ai.analyzeImage(image, input)
        expect(result).toBe('response')
      })

      test('Then the mockParse method is called', () => {
        expect(mockInvoke).toBeCalledWith([
          new SystemMessage(prompts.ANALYZE_IMAGE),
          {
            role: 'user',
            content: [
              { image_url: { url: image }, type: 'image_url' },
              { text: 'User input: ' + input, type: 'text' }
            ]
          }
        ])
      })
    })

    describe('When the classifyAction method is called', () => {
      const message = new HumanMessage('Input')

      beforeAll(() => mockInvoke.mockResolvedValue({ type: 'operation' }))

      afterAll(() => mockInvoke.mockReset())

      test('Then the result is returned', async () => {
        const result = await ai.classifyAction(message)
        expect(result).toBe('operation')
      })
    })

    describe('When the embedDocuments method is called', () => {
      test('Then the mockFromTexts method is called', async () => {
        const texts = ['Document 1', 'Document 2']
        await ai.embedTexts(texts)
        expect(mockFromTexts).toBeCalledWith(texts, mockOpenAIEmbeddings)
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
              { type: 'text', text: prompts.CANDIDATE_LIST_REFERENCE },
              { type: 'text', text: 'User input: ' + input },
              { type: 'text', text: 'Elements: Index 0: Document 1\nIndex 1: Document 2' }
            ]
          }
        ])
      })
    })

    describe('When the searchDocuments method is called', () => {
      beforeAll(() => {
        process.env.OPENAI_API_KEY = 'mock-openai-api-key'
        ai = new AI({ openAIApiKey: 'mock-openai-api-key' })
        mockInvoke.mockResolvedValue([new Document({ pageContent: 'Document 1' })])
      })

      afterAll(() => {
        delete process.env.OPENAI_API_KEY
        mockInvoke.mockReset()
      })

      test('Then the result is returned', async () => {
        const docs = await ai.searchDocuments('query')
        expect(docs).toEqual([new Document({ pageContent: 'Document 1' })])
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
              { type: 'text', text: prompts.SUMMARIZE_ACTION },
              { type: 'text', text: action }
            ]
          }
        ])
      })
    })

    describe('When the useTools method is called', () => {
      beforeAll(() => mockInvoke.mockResolvedValue(new AIMessage('response')))

      afterAll(() => mockInvoke.mockReset())

      test('Then the result is returned', async () => {
        const { content } = await ai.useTools([], [new HumanMessage('test')])
        expect(content).toBe('response')
      })
    })
  })

  describe('Given the AI class with Google configuration', () => {
    describe('When the searchDocuments method is called', () => {
      beforeAll(() => {
        ai = new AI({ googleApiKey: 'mock-google-api-key' })
        mockInvoke.mockResolvedValue([new Document({ pageContent: 'Document 1' })])
      })

      afterAll(() => mockInvoke.mockReset())

      test('Then the result is returned', async () => {
        const docs = await ai.searchDocuments('query')
        expect(docs).toEqual([new Document({ pageContent: 'Document 1' })])
      })
    })

    describe('When the embedDocuments method is called', () => {
      beforeAll(() => {
        process.env.GOOGLE_API_KEY = 'mock-google-api-key'
        ai = new AI()
      })

      afterAll(() => delete process.env.GOOGLE_API_KEY)

      test('Then the mockFromTexts method is called', async () => {
        const texts = ['Document 1', 'Document 2']
        await ai.embedTexts(texts)
        expect(mockFromTexts).toBeCalledWith(texts, mockOpenAIEmbeddings)
      })
    })
  })

  describe('Given the AI class with Anthropic and Voyage configuration', () => {
    describe('When the searchDocuments method is called', () => {
      beforeAll(() => {
        ai = new AI({ anthropicApiKey: 'mock-anthropic-api-key', voyageAIApiKey: 'mock-voyageai-api-key' })
        mockInvoke.mockResolvedValue([new Document({ pageContent: 'Document 1' })])
      })

      afterAll(() => mockInvoke.mockReset())

      test('Then the result is returned', async () => {
        const docs = await ai.searchDocuments('query')
        expect(docs).toEqual([new Document({ pageContent: 'Document 1' })])
      })
    })

    describe('When the embedDocuments method is called', () => {
      beforeAll(() => {
        process.env.ANTHROPIC_API_KEY = 'mock-anthropic-api-key'
        process.env.VOYAGEAI_API_KEY = 'mock-voyageai-api-key'
        ai = new AI()
      })

      afterAll(() => {
        delete process.env.ANTHROPIC_API_KEY
        delete process.env.VOYAGEAI_API_KEY
      })

      test('Then the mockFromTexts method is called', async () => {
        const texts = ['Document 1', 'Document 2']
        await ai.embedTexts(texts)
        expect(mockFromTexts).toBeCalledWith(texts, mockOpenAIEmbeddings)
      })
    })
  })

  describe('Given the AI class with invalid configuration', () => {
    describe('When the embeddings model is not set', () => {
      test('Then an error is thrown', () => {
        expect(() => new AI({ anthropicApiKey: 'mock-anthropic-api-key' })).toThrowError(
          'Embeddings model setup failed. An API key for Google, OpenAI, or VoyageAI is required.'
        )
      })
    })

    describe('When the LLM model is not set', () => {
      test('Then an error is thrown', () => {
        expect(() => new AI({ voyageAIApiKey: 'mock-voyageai-api-key' })).toThrowError(
          'LLM setup failed. An API key for Google, OpenAI, or Anthropic is required.'
        )
      })
    })
  })
})
