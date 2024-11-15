import type { PlayWord } from './types'

import { Document } from '@langchain/core/documents'
import { tool } from '@langchain/core/tools'
import { OpenAIEmbeddings } from '@langchain/openai'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { z } from 'zod'

import { click, getLink, hover, input, navigate, pressKeys, scroll, select, waitForText } from './actions'
import { clickableTags } from './resources'
import { getElementLocations, sanitize } from './htmlUtils'

export const toolkit = [
  tool(
    async ({ target }, { configurable }) => {
      const ref = configurable.ref as PlayWord
      const page = ref.page
      await page.waitForLoadState('domcontentloaded')
      await page.waitForLoadState('networkidle')

      const oldSnapshot = ref.snapshot
      const newSnapshot = await page.content()

      if (newSnapshot !== oldSnapshot) {
        const elements = getElementLocations(sanitize(newSnapshot), clickableTags)
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
        ref.store = await MemoryVectorStore.fromDocuments(docs, embedder)
        ref.snapshot = newSnapshot
      }

      const retriever = ref.store!.asRetriever()
      const retrieved = await retriever.invoke(target)
      const candidates = [] as string[]

      for (const { id } of retrieved) {
        const locator = page.locator(id!).first()
        const [visible, enabled] = await Promise.all([locator.isVisible(), locator.isEnabled()])
        if (visible && enabled) {
          const text = await locator.textContent()
          if (text && text.trim() === target) {
            await click(page, { id: id! })
            return 'Clicked on ' + target
          }
          candidates.push(id!)
        }
      }

      if (candidates.length === 0) {
        return 'Element not found'
      }

      await click(page, { id: candidates[0] })

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
      const ref = configurable.ref as PlayWord
      const page = ref.page
      await page.waitForLoadState('domcontentloaded')
      await page.waitForLoadState('networkidle')

      const oldSnapshot = ref.snapshot
      const newSnapshot = await page.content()

      if (newSnapshot !== oldSnapshot) {
        const elements = getElementLocations(sanitize(newSnapshot), ['a'])
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
        ref.store = await MemoryVectorStore.fromDocuments(docs, embedder)
        ref.snapshot = newSnapshot
      }

      const retriever = ref.store!.asRetriever()
      const retrieved = await retriever.invoke(target)
      const candidates = [] as string[]

      for (const { id } of retrieved) {
        const locator = page.locator(id!).first()
        const [visible, enabled] = await Promise.all([locator.isVisible(), locator.isEnabled()])
        if (visible && enabled) {
          const text = await locator.textContent()
          if (text && text.trim() === target) {
            return await getLink(page, { id: id! })
          }
          candidates.push(id!)
        }
      }

      if (candidates.length === 0) {
        return 'Element not found'
      }

      return await getLink(page, { id: candidates[0] })
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
      const ref = configurable.ref as PlayWord
      const page = ref.page
      await page.waitForLoadState('domcontentloaded')
      await page.waitForLoadState('networkidle')

      const oldSnapshot = ref.snapshot
      const newSnapshot = await page.content()

      if (newSnapshot !== oldSnapshot) {
        const elements = getElementLocations(sanitize(newSnapshot), clickableTags)
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
        ref.store = await MemoryVectorStore.fromDocuments(docs, embedder)
        ref.snapshot = newSnapshot
      }

      const retriever = ref.store!.asRetriever()
      const retrieved = await retriever.invoke(target)
      const candidates = [] as string[]

      for (const { id } of retrieved) {
        const locator = page.locator(id!).first()
        const [visible, enabled] = await Promise.all([locator.isVisible(), locator.isEnabled()])
        if (visible && enabled) {
          const text = await locator.textContent()
          if (text && text.trim() === target) {
            await hover(page, { id: id! })
            return 'Hovered on ' + target
          }
          candidates.push(id!)
        }
      }

      if (candidates.length === 0) {
        return 'Element not found'
      }

      await hover(page, { id: candidates[0] })

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
      const ref = configurable.ref as PlayWord
      const page = ref.page
      await page.waitForLoadState('domcontentloaded')
      await page.waitForLoadState('networkidle')

      const oldSnapshot = ref.snapshot
      const newSnapshot = await page.content()

      if (newSnapshot !== oldSnapshot) {
        const elements = getElementLocations(sanitize(newSnapshot), ['input', 'textarea'])
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
        ref.store = await MemoryVectorStore.fromDocuments(docs, embedder)
        ref.snapshot = newSnapshot
      }

      const retriever = ref.store!.asRetriever()
      const retrieved = await retriever.invoke(target)
      const candidates = [] as string[]

      for (const { id } of retrieved) {
        const locator = page.locator(id!).first()
        const [visible, enabled] = await Promise.all([locator.isVisible(), locator.isEnabled()])
        if (visible && enabled) {
          candidates.push(id!)
        }
      }

      if (candidates.length === 0) {
        return 'Element not found'
      }

      await input(page, { id: candidates[0], text })

      return 'Input ' + text + ' into ' + target
    },
    {
      name: 'Input',
      description: 'Call to input text into an element',
      schema: z.object({
        target: z.string().describe('The name of the element to input text into.'),
        text: z.string().describe('The text to input.')
      })
    }
  ),

  tool(
    async ({ url }, { configurable }) => {
      const ref = configurable.ref as PlayWord
      const page = ref.page
      await page.waitForLoadState('domcontentloaded')

      await navigate(page, { url })

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
      const ref = configurable.ref as PlayWord
      const page = ref.page
      await page.waitForLoadState('domcontentloaded')

      await pressKeys(page, { keys })

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
      const ref = configurable.ref as PlayWord
      const page = ref.page
      await page.waitForLoadState('domcontentloaded')

      await scroll(page, { direction })

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
      const ref = configurable.ref as PlayWord
      const page = ref.page
      await page.waitForLoadState('domcontentloaded')
      await page.waitForLoadState('networkidle')

      const oldSnapshot = ref.snapshot
      const newSnapshot = await page.content()

      if (newSnapshot !== oldSnapshot) {
        const elements = getElementLocations(sanitize(newSnapshot), ['select'])
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
        ref.store = await MemoryVectorStore.fromDocuments(docs, embedder)
        ref.snapshot = newSnapshot
      }

      const retriever = ref.store!.asRetriever()
      const retrieved = await retriever.invoke(target)
      const candidates = [] as string[]

      for (const { id } of retrieved) {
        const locator = page.locator(id!).first()
        const [visible, enabled] = await Promise.all([locator.isVisible(), locator.isEnabled()])
        if (visible && enabled) {
          candidates.push(id!)
        }
      }

      if (candidates.length === 0) {
        return 'Element not found'
      }

      await select(page, { id: candidates[0], option })

      return 'Select ' + option + ' from ' + target
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
      const ref = configurable.ref as PlayWord
      const page = ref.page
      await page.waitForLoadState('domcontentloaded')

      await waitForText(page, { text })

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
