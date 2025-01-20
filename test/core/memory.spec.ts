import { SyntheticEmbeddings } from '@langchain/core/utils/testing'
import { describe, expect, test } from 'vitest'
import { MemoryVectorStore } from '../../packages/core/src/memory'

describe('Spec: MemoryVectorStore', () => {
  describe('When the MemoryVectorStore is queried', () => {
    test('Then it should have the correct vectors', async () => {
      const texts = [
        '<div id="targetDiv">ID</div>',
        '<div data-testid="testDiv">Test ID</div>',
        '<div data-qa="testQA">Test QA</div>',
        '<a href="https://test.url">Test URL</a>',
        '<div class="testClass">Test Class</div>',
        '<p style="color: red">Text</p>',
        '<input type="text" />'
      ]

      const memoryVectorStore = await MemoryVectorStore.fromTexts(texts, new SyntheticEmbeddings())
      const result = await memoryVectorStore.asRetriever().invoke('Test Class')
      expect(result[0].pageContent).toBe('<div class="testClass">Test Class</div>')
    })
  })
})
