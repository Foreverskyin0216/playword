import type { PlayWordProperties } from './types'

import { Document } from '@langchain/core/documents'
import { tool } from '@langchain/core/tools'
import { OpenAIEmbeddings } from '@langchain/openai'

import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { z } from 'zod'

import {
  assertElementContentEquals,
  assertElementInvisible,
  assertElementVisible,
  assertPageContains,
  assertPageDoesNotContain,
  assertPageTitleEquals,
  assertPageUrlMatches,
  getSnapshot
} from './actions'
import { clickableTags } from './resources'
import { getElementLocations, sanitize } from './htmlUtils'

export const toolkit = [
  tool(
    async ({ target, text }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties
      const snapshot = await getSnapshot(ref)

      if (snapshot !== ref.snapshot) {
        const elements = getElementLocations(sanitize(snapshot), clickableTags)
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({
          ...ref.openAIOptions,
          configuration: ref.openAIOptions,
          modelName: 'text-embedding-3-large'
        })
        ref.store = await MemoryVectorStore.fromDocuments(docs, embedder)
        ref.snapshot = snapshot
      }

      const retriever = ref.store!.asRetriever()
      const retrieved = await retriever.invoke(target)

      for (const doc of retrieved) {
        if (!doc.id) continue
        if (await assertElementContentEquals(ref, { xpath: doc.id, text })) {
          return 'Found text: ' + text + ' on the element: ' + target
        }
      }

      return 'Could not find text: ' + text + ' on the element: ' + target
    },
    {
      name: 'AssertElementContentEquals',
      description: 'Call to verify that an element has a specific text.',
      schema: z.object({
        target: z.string().describe('The name of the element to verify.'),
        text: z.string().describe('The text to verify on the element.')
      })
    }
  ),

  tool(
    async ({ target }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties
      const snapshot = await getSnapshot(ref)

      if (snapshot !== ref.snapshot) {
        const elements = getElementLocations(sanitize(snapshot), clickableTags)
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({
          ...ref.openAIOptions,
          configuration: ref.openAIOptions,
          modelName: 'text-embedding-3-large'
        })
        ref.store = await MemoryVectorStore.fromDocuments(docs, embedder)
        ref.snapshot = snapshot
      }

      const retriever = ref.store!.asRetriever()
      const retrieved = await retriever.invoke(target)

      for (const doc of retrieved) {
        if (!doc.id) continue

        if (retrieved.length && (await assertElementInvisible(ref, { xpath: doc.id }))) {
          return 'Element: ' + target + ' is invisible.'
        }
      }

      return 'Element: ' + target + ' is visible.'
    },
    {
      name: 'AssertElementInvisible',
      description: 'Call to verify that an element is invisible.',
      schema: z.object({
        target: z.string().describe('The name of the element to verify.')
      })
    }
  ),

  tool(
    async ({ target }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties
      const snapshot = await getSnapshot(ref)

      if (snapshot !== ref.snapshot) {
        const elements = getElementLocations(sanitize(snapshot), clickableTags)
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({
          ...ref.openAIOptions,
          configuration: ref.openAIOptions,
          modelName: 'text-embedding-3-large'
        })
        ref.store = await MemoryVectorStore.fromDocuments(docs, embedder)
        ref.snapshot = snapshot
      }

      const retriever = ref.store!.asRetriever()
      const retrieved = await retriever.invoke(target)

      for (const doc of retrieved) {
        if (!doc.id) continue

        if (retrieved.length && (await assertElementVisible(ref, { xpath: doc.id }))) {
          return 'Element: ' + target + ' is visible.'
        }
      }

      return 'Element: ' + target + ' is invisible.'
    },
    {
      name: 'AssertElementVisible',
      description: 'Call to verify that an element is visible.',
      schema: z.object({
        target: z.string().describe('The name of the element to verify.')
      })
    }
  ),

  tool(
    async ({ text }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties

      if (await assertPageContains(ref, { text })) {
        return 'Found text: ' + text + ' on the page.'
      }

      return 'Could not find text: ' + text + ' on the page.'
    },
    {
      name: 'AssertPageContains',
      description: 'Call to verify that the page contains a specific text.',
      schema: z.object({
        text: z.string().describe('The text to verify on the page.')
      })
    }
  ),

  tool(
    async ({ text }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties

      if (await assertPageDoesNotContain(ref, { text })) {
        return 'text: ' + text + ' is not found on the page.'
      }

      return 'text: ' + text + ' is found on the page.'
    },
    {
      name: 'AssertPageDoesNotContain',
      description: 'Call to verify that the page does not contain a specific text.',
      schema: z.object({
        text: z.string().describe('The text to verify on the page.')
      })
    }
  ),

  tool(
    async ({ text }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties

      if (await assertPageTitleEquals(ref, { text })) {
        return 'Page title is equal to: ' + text
      }

      return 'Page title is not equal to ' + text
    },
    {
      name: 'AssertPageTitleEquals',
      description: 'Call to verify that the page title is equal to a specific text.',
      schema: z.object({
        text: z.string().describe('The text to verify on the page title.')
      })
    }
  ),

  tool(
    async ({ pattern }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties

      if (await assertPageUrlMatches(ref, { pattern })) {
        return 'Page URL matches the pattern: ' + pattern
      }

      return 'Page URL does not match the pattern: ' + pattern
    },
    {
      name: 'AssertPageUrlMatches',
      description: 'Call to verify that the page URL matches a specific pattern.',
      schema: z.object({
        pattern: z.string().describe('The pattern to verify on the page URL.')
      })
    }
  )
]
