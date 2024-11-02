import type { PlayWordProperties } from './types'

import { Document } from '@langchain/core/documents'
import { tool } from '@langchain/core/tools'
import { OpenAIEmbeddings } from '@langchain/openai'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { z } from 'zod'

import { click, getLink, getSnapshot, hover, input, navigate, pressKeys, scroll, select, waitForText } from './actions'
import { clickableTags } from './resources'
import { getElementLocations, sanitize } from './htmlUtils'

export const toolkit = [
  tool(
    async ({ target }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties
      const page = ref.page
      const snapshot = await getSnapshot(ref)

      if (snapshot !== ref.snapshot) {
        const elements = getElementLocations(sanitize(snapshot), clickableTags)
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
        ref.store = await MemoryVectorStore.fromDocuments(docs, embedder)
        ref.snapshot = snapshot
      }

      const retriever = ref.store!.asRetriever()
      const retrieved = await retriever.invoke(target)
      const candidates = [] as string[]

      for (const doc of retrieved) {
        if (!doc.id) continue

        const locator = page.locator(doc.id).first()
        const [visible, enabled] = await Promise.all([locator.isVisible(), locator.isEnabled()])
        if (visible && enabled) {
          const text = await locator.textContent()
          if (text && text.trim() === target) {
            candidates.unshift(doc.id)
            break
          }
          candidates.push(doc.id)
        }
      }

      if (candidates.length === 0) {
        return 'Element not found'
      }

      await click(ref, { xpath: candidates[0] })

      return 'Clicked on ' + target
    },
    {
      name: 'Click',
      description: 'Call to click on an element',
      schema: z.object({
        target: z.string().describe('The name of the element to click on.')
      })
    }
  ),

  tool(
    async ({ target }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties
      const page = ref.page
      const snapshot = await getSnapshot(ref)

      if (snapshot !== ref.snapshot) {
        const elements = getElementLocations(sanitize(snapshot), ['a'])
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
        ref.store = await MemoryVectorStore.fromDocuments(docs, embedder)
        ref.snapshot = snapshot
      }

      const retriever = ref.store!.asRetriever()
      const retrieved = await retriever.invoke(target)
      const candidates = [] as string[]

      for (const doc of retrieved) {
        if (!doc.id) continue

        const locator = page.locator(doc.id).first()
        const [visible, enabled] = await Promise.all([locator.isVisible(), locator.isEnabled()])
        if (visible && enabled) {
          const text = await locator.textContent()
          if (text && text.trim() === target) {
            candidates.unshift(doc.id)
            break
          }
          candidates.push(doc.id)
        }
      }

      if (candidates.length === 0) {
        return 'Element not found'
      }

      return await getLink(ref, { xpath: candidates[0] })
    },
    {
      name: 'GetLink',
      description: 'Call to get the anchor link of an element',
      schema: z.object({
        target: z.string().describe('The name of the element to get the link from.')
      })
    }
  ),

  tool(
    async ({ target }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties
      const page = ref.page
      const snapshot = await getSnapshot(ref)

      if (snapshot !== ref.snapshot) {
        const elements = getElementLocations(sanitize(snapshot), clickableTags)
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
        ref.store = await MemoryVectorStore.fromDocuments(docs, embedder)
        ref.snapshot = snapshot
      }

      const retriever = ref.store!.asRetriever()
      const retrieved = await retriever.invoke(target)
      const candidates = [] as string[]

      for (const doc of retrieved) {
        if (!doc.id) continue

        const locator = page.locator(doc.id).first()
        const [visible, enabled] = await Promise.all([locator.isVisible(), locator.isEnabled()])
        if (visible && enabled) {
          const text = await locator.textContent()
          if (text && text.trim() === target) {
            candidates.unshift(doc.id)
            break
          }
          candidates.push(doc.id)
        }
      }

      if (candidates.length === 0) {
        return 'Element not found'
      }

      await hover(ref, { xpath: candidates[0] })

      return 'Hovered on ' + target
    },
    {
      name: 'Hover',
      description: 'Call to hover over an element',
      schema: z.object({
        target: z.string().describe('The name of the element to hover over.')
      })
    }
  ),

  tool(
    async ({ target, text }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties
      const page = ref.page
      const snapshot = await getSnapshot(ref)

      if (snapshot !== ref.snapshot) {
        const elements = getElementLocations(sanitize(snapshot), ['input', 'textarea'])
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
        ref.store = await MemoryVectorStore.fromDocuments(docs, embedder)
        ref.snapshot = snapshot
      }

      const retriever = ref.store!.asRetriever()
      const retrieved = await retriever.invoke(target)

      for (const doc of retrieved) {
        if (!doc.id) continue

        const locator = page.locator(doc.id).first()
        const [visible, enabled] = await Promise.all([locator.isVisible(), locator.isEnabled()])
        if (visible && enabled) {
          await input(ref, { xpath: doc.id, text })
          return 'Input ' + text + ' into ' + target
        }
      }

      return 'Element not found'
    },
    {
      name: 'Input',
      description: 'Call to input text into the input field or textarea',
      schema: z.object({
        target: z.string().describe('The name of the element to input text into.'),
        text: z.string().describe('The text to input.')
      })
    }
  ),

  tool(
    async ({ url }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties

      await navigate(ref, { url })

      return 'Navigated to ' + url
    },
    {
      name: 'Navigate',
      description: 'Call to go to a specific URL',
      schema: z.object({
        url: z.string().describe('The URL to navigate to.')
      })
    }
  ),

  tool(
    async ({ keys }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties

      await pressKeys(ref, { keys })

      return 'Pressed keys: ' + keys
    },
    {
      name: 'PressKeys',
      description: 'Call to press a key or keys',
      schema: z.object({
        keys: z.string().describe('Keys to press. The format should match the Playwright API.')
      })
    }
  ),

  tool(
    async ({ direction }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties

      await scroll(ref, { direction })

      return 'Scrolled ' + direction
    },
    {
      name: 'Scroll',
      description: 'Call to scroll the page',
      schema: z.object({
        direction: z.enum(['top', 'bottom', 'up', 'down'])
      })
    }
  ),

  tool(
    async ({ target, option }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties
      const page = ref.page
      const snapshot = await getSnapshot(ref)

      if (snapshot !== ref.snapshot) {
        const elements = getElementLocations(sanitize(snapshot), ['select'])
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
        ref.store = await MemoryVectorStore.fromDocuments(docs, embedder)
        ref.snapshot = snapshot
      }

      const retriever = ref.store!.asRetriever()
      const retrieved = await retriever.invoke(target)

      for (const doc of retrieved) {
        if (!doc.id) continue

        const locator = page.locator(doc.id).first()
        const [visible, enabled] = await Promise.all([locator.isVisible(), locator.isEnabled()])
        if (visible && enabled) {
          await select(ref, { xpath: doc.id, option })
          return 'Select ' + option + ' from ' + target
        }
      }

      return 'Element not found'
    },
    {
      name: 'Select',
      description: 'Call to select an option from a select element',
      schema: z.object({
        target: z.string().describe('The name of the dropdown element.'),
        option: z.string().describe('The option to select.')
      })
    }
  ),

  tool(
    async ({ text }, { configurable }) => {
      const ref = configurable.ref as PlayWordProperties

      await waitForText(ref, { text })

      return 'Found text: ' + text
    },
    {
      name: 'WaitForText',
      description: 'Call to wait for text to appear on the page',
      schema: z.object({
        text: z.string().describe('The text to wait for.')
      })
    }
  )
]
