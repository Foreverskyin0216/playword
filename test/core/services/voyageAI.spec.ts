import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { VoyageEmbeddings } from '../../../packages/core/src/services/voyageAI'

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }))

describe('Spec: Embeddings', () => {
  describe('Given the VoyageAI embeddings', () => {
    const voyageEmbeddings = new VoyageEmbeddings({ apiKey: 'mock-voyage-api-key' })

    beforeAll(() => vi.spyOn(global, 'fetch').mockImplementation(mockFetch))

    afterAll(() => vi.clearAllMocks())

    describe('When the embedQuery method is called', () => {
      beforeAll(() => {
        mockFetch.mockResolvedValue({ json: () => Promise.resolve({ data: [{ embedding: [[1, 2, 3]] }] }) })
      })

      afterAll(() => mockFetch.mockReset())

      test('Then the embeddings are returned as expected', async () => {
        const vectors = await voyageEmbeddings.embedQuery('mock-query')
        expect(vectors).toEqual([[1, 2, 3]])
      })
    })

    describe('When the embedDocuments method is called', () => {
      beforeAll(() => {
        mockFetch.mockResolvedValue({ json: () => Promise.resolve({ data: [{ embedding: [[1, 2, 3]] }] }) })
      })

      afterAll(() => mockFetch.mockReset())

      test('Then the embeddings are returned as expected', async () => {
        const vectors = await voyageEmbeddings.embedDocuments(['mock-document'])
        expect(vectors).toEqual([[[1, 2, 3]]])
      })
    })

    describe('When the api key is not provided', () => {
      test('Then an error is thrown', () => {
        expect(() => new VoyageEmbeddings()).toThrowError('VoyageAI API key not found')
      })
    })
  })
})
