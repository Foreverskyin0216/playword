import type { Document } from '@langchain/core/documents'

import { SyntheticEmbeddings } from '@langchain/core/utils/testing'
import { beforeAll, describe, expect, test } from 'vitest'
import { MemoryVectorStore } from '../../packages/core/src/memoryVectorStore'

describe('Spec: MemoryVectorStore', () => {
  describe('Given the MemoryVectorStore class is from texts', async () => {
    const texts = [
      '<div id="targetDiv">ID</div>',
      '<div data-testid="testDiv">Test ID</div>',
      '<div data-qa="testQA">Test QA</div>',
      '<a href="https://test.url">Test URL</a>',
      '<div class="testClass">Test Class</div>',
      '<p style="color: red">Text</p>',
      '<input type="text" />'
    ]
    let memoryVectorStore: MemoryVectorStore

    beforeAll(async () => {
      memoryVectorStore = await MemoryVectorStore.fromTexts(texts, new SyntheticEmbeddings())
    })

    describe('When the MemoryVectorStore is queried', () => {
      let result: Document[]

      beforeAll(async () => {
        result = await memoryVectorStore.asRetriever().invoke('Test Class')
      })

      test('It should have the correct vectors', () => {
        expect(result[0].pageContent).toBe('<div class="testClass">Test Class</div>')
      })
    })
  })
})
