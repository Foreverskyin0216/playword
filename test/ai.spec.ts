import type { MemoryVectorStore } from 'langchain/vectorstores/memory'

import { Document } from '@langchain/core/documents'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { zodResponseFormat } from 'openai/helpers/zod'
import { afterAll, beforeAll, describe, test, expect, vi } from 'vitest'
import { z } from 'zod'
import { AI, CANDIDATE_LIST_REFERENCE, CANDIDATE_SCREENSHOT_REFERENCE, DETERMINE_ASSERTION_RESULT } from '../src/ai'

const { mockFromTexts, mockOpenAIEmbeddings, mockParse } = vi.hoisted(() => ({
  mockFromTexts: vi.fn(),
  mockOpenAIEmbeddings: {},
  mockParse: vi.fn()
}))

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn(() => ({
    bindTools: vi.fn(() => ({ invoke: vi.fn().mockResolvedValue(new AIMessage('response')) }))
  })),
  OpenAIEmbeddings: vi.fn()
}))

vi.mock('langchain/vectorstores/memory', () => ({
  MemoryVectorStore: { fromTexts: mockFromTexts }
}))

vi.mock('openai', () => ({
  OpenAI: vi.fn(() => ({ beta: { chat: { completions: { parse: mockParse } } } }))
}))

describe('Spec: AI', () => {
  describe('Given the AI class', () => {
    const ai = new AI()

    describe('When the useTools method is called', () => {
      let result: AIMessage

      beforeAll(async () => {
        result = await ai.useTools([], [new HumanMessage('test')])
      })

      test('Then the result is returned', () => {
        expect(result.content).toBe('response')
      })
    })

    describe('When the embedDocuments method is called', () => {
      const documents = ['Document 1', 'Document 2']
      let result: MemoryVectorStore

      beforeAll(async () => {
        mockFromTexts.mockResolvedValue(['Document 1', 'Document 2'])
        result = await ai.embedDocuments(documents)
      })

      afterAll(() => mockFromTexts.mockRestore())

      test('Then the result is returned', () => {
        expect(result).toEqual(['Document 1', 'Document 2'])
      })

      test('Then the mockFromTexts method is called', () => {
        expect(mockFromTexts).toHaveBeenCalledWith(documents, [], mockOpenAIEmbeddings)
      })
    })

    describe('When the getAssertionResult method is called', () => {
      const messages = [new HumanMessage('Assertion')]
      let result: AIMessage

      beforeAll(async () => {
        mockParse.mockResolvedValue({ choices: [{ message: { parsed: { result: true } } }] })
        result = await ai.getAssertionResult(messages)
      })

      afterAll(() => mockParse.mockRestore())

      test('Then the result is returned', () => {
        expect(result.content).toBe('true')
      })

      test('Then the mockParse method is called', () => {
        expect(mockParse).toHaveBeenCalledWith({
          model: 'gpt-4o-mini',
          temperature: 0,
          messages: [
            { role: 'system', content: DETERMINE_ASSERTION_RESULT },
            { role: 'user', content: 'Assertion' },
            { role: 'assistant', content: 'Assertion' }
          ],
          response_format: zodResponseFormat(z.object({ result: z.boolean() }), 'result')
        })
      })
    })

    describe('When the getBestCandidate method is called', () => {
      const input = 'Input'
      const docs = [new Document({ pageContent: 'Document 1' }), new Document({ pageContent: 'Document 2' })]
      let resultWithScreenshot: number
      let resultWithoutScreenshot: number

      beforeAll(async () => {
        mockParse.mockResolvedValueOnce({ choices: [{ message: { parsed: { index: '1' } } }] })
        mockParse.mockResolvedValueOnce({ choices: [{ message: { parsed: {} } }] })
        resultWithScreenshot = await ai.getBestCandidate(input, docs, 'Screenshot')
        resultWithoutScreenshot = await ai.getBestCandidate(input, docs)
      })

      afterAll(() => mockParse.mockRestore())

      test('Then the result is returned', () => {
        expect(resultWithScreenshot).toBe(1)
        expect(resultWithoutScreenshot).toBe(0)
      })

      test('Then the mockParse method is called', () => {
        expect(mockParse).toHaveBeenNthCalledWith(1, {
          model: 'gpt-4o-mini',
          temperature: 0,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: CANDIDATE_SCREENSHOT_REFERENCE },
                { type: 'text', text: 'User input: ' + input },
                { type: 'text', text: 'Candidates: Index 0: Document 1\nIndex 1: Document 2' },
                { type: 'image_url', image_url: { url: 'Screenshot' } }
              ]
            }
          ],
          response_format: zodResponseFormat(z.object({ index: z.enum(['0', '1']) }), 'index')
        })

        expect(mockParse).toHaveBeenNthCalledWith(2, {
          model: 'gpt-4o-mini',
          temperature: 0,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: CANDIDATE_LIST_REFERENCE },
                { type: 'text', text: 'User input: ' + input },
                { type: 'text', text: 'Candidates: Index 0: Document 1\nIndex 1: Document 2' }
              ]
            }
          ],
          response_format: zodResponseFormat(z.object({ index: z.enum(['0', '1']) }), 'index')
        })
      })
    })
  })
})
