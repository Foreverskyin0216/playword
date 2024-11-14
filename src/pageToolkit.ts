import type { PlayWord } from './types'

import { Document } from '@langchain/core/documents'
import { tool } from '@langchain/core/tools'
import { OpenAIEmbeddings } from '@langchain/openai'

import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { z } from 'zod'

import { getElementLocations, sanitize } from './htmlUtils'

export const toolkit = [
  tool(
    async (_, { configurable }) => {
      const ref = configurable.ref as PlayWord
      const page = ref.getPage()
      await page.waitForLoadState('domcontentloaded')

      return await page.title()
    },
    {
      name: 'GetPageTitle',
      description: 'Call to get the title of the current page',
      schema: z.object({})
    }
  ),

  tool(
    async ({ url }, { configurable }) => {
      const ref = configurable.ref as PlayWord
      const page = ref.getPage()
      await page.waitForLoadState('domcontentloaded')

      await page.goto(url)

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
      const page = ref.getPage()
      await page.waitForLoadState('domcontentloaded')

      await page.keyboard.press(keys)

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
    async ({ target }, { configurable }) => {
      const ref = configurable.ref as PlayWord
      const page = ref.getPage()
      await page.waitForLoadState('domcontentloaded')
      await page.waitForLoadState('networkidle')

      const oldSnapshot = ref.getSnapshot()
      const newSnapshot = await page.content()

      if (newSnapshot !== oldSnapshot) {
        const clickable = ['a', 'button', 'img', 'label', 'input', 'select', 'textarea']
        const elements = getElementLocations(sanitize(newSnapshot), clickable)
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
        ref.setStore(await MemoryVectorStore.fromDocuments(docs, embedder))
        ref.setSnapshot(newSnapshot)
      }

      const retriever = ref.getStore().asRetriever()
      const retrieved = await retriever.invoke(target)

      for (const { id } of retrieved) {
        const locator = page.locator(id!).first()
        const [visible, enabled] = await Promise.all([locator.isVisible(), locator.isEnabled()])
        if (visible && enabled) {
          await locator.scrollIntoViewIfNeeded()
          await locator.hover()
          await locator.click()
          return 'Clicked on ' + target
        }
      }

      return 'Element not found'
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
      const page = ref.getPage()
      await page.waitForLoadState('domcontentloaded')
      await page.waitForLoadState('networkidle')

      const oldSnapshot = ref.getSnapshot()
      const newSnapshot = await page.content()

      if (newSnapshot !== oldSnapshot) {
        const clickable = ['a', 'button', 'img', 'label', 'input', 'select', 'textarea']
        const elements = getElementLocations(sanitize(newSnapshot), clickable)
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
        ref.setStore(await MemoryVectorStore.fromDocuments(docs, embedder))
        ref.setSnapshot(newSnapshot)
      }

      const retriever = ref.getStore().asRetriever()
      const retrieved = await retriever.invoke(target)

      for (const { id } of retrieved) {
        const locator = page.locator(id!).first()
        const [visible, enabled] = await Promise.all([locator.isVisible(), locator.isEnabled()])
        if (visible && enabled) {
          await locator.scrollIntoViewIfNeeded()
          await locator.hover()
          return 'Hovered over ' + target
        }
      }

      return 'Element not found'
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
      const page = ref.getPage()
      await page.waitForLoadState('domcontentloaded')
      await page.waitForLoadState('networkidle')

      const oldSnapshot = ref.getSnapshot()
      const newSnapshot = await page.content()

      if (newSnapshot !== oldSnapshot) {
        const elements = getElementLocations(sanitize(newSnapshot), ['input', 'select', 'textarea'])
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
        ref.setStore(await MemoryVectorStore.fromDocuments(docs, embedder))
        ref.setSnapshot(newSnapshot)
      }

      const retriever = ref.getStore().asRetriever()
      const retrieved = await retriever.invoke(target)

      for (const { id } of retrieved) {
        const locator = page.locator(id!).first()
        const [visible, enabled] = await Promise.all([locator.isVisible(), locator.isEnabled()])
        if (visible && enabled) {
          await locator.scrollIntoViewIfNeeded()
          await locator.hover()
          await locator.click()
          await locator.fill(text)
          return 'Input ' + text + ' into ' + target
        }
      }

      return 'Element not found'
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
    async ({ direction }, { configurable }) => {
      const ref = configurable.ref as PlayWord
      const page = ref.getPage()
      await page.waitForLoadState('domcontentloaded')

      switch (direction) {
        case 'top':
          await page.evaluate(() => window.scrollTo({ top: 0 }))
          break
        case 'bottom':
          await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }))
          break
        case 'up':
          await page.evaluate(() => window.scrollBy({ top: -window.innerHeight }))
          break
        case 'down':
          await page.evaluate(() => window.scrollBy({ top: window.innerHeight }))
          break
        default:
          throw Error(`Unsupported scroll target ${direction}`)
      }

      return 'Scrolled ' + direction
    },
    {
      name: 'ScrollPage',
      description: 'Call to scroll the page',
      schema: z.object({
        direction: z.enum(['top', 'bottom', 'up', 'down'])
      })
    }
  ),

  tool(
    async ({ target, option }, { configurable }) => {
      const ref = configurable.ref as PlayWord
      const page = ref.getPage()
      await page.waitForLoadState('domcontentloaded')
      await page.waitForLoadState('networkidle')

      const oldSnapshot = ref.getSnapshot()
      const newSnapshot = await page.content()

      if (newSnapshot !== oldSnapshot) {
        const elements = getElementLocations(sanitize(newSnapshot), ['input', 'select', 'textarea'])
        const docs = elements.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
        const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
        ref.setStore(await MemoryVectorStore.fromDocuments(docs, embedder))
        ref.setSnapshot(newSnapshot)
      }

      const retriever = ref.getStore().asRetriever()
      const retrieved = await retriever.invoke(target)

      for (const { id } of retrieved) {
        const locator = page.locator(id!).first()
        const [visible, enabled] = await Promise.all([locator.isVisible(), locator.isEnabled()])
        if (visible && enabled) {
          await locator.scrollIntoViewIfNeeded()
          await locator.hover()
          await locator.click()
          await locator.selectOption({ label: option })
          return 'Selected ' + option + ' from ' + target
        }
      }

      return 'Element not found'
    },
    {
      name: 'Select',
      description: 'Call to select an option from a dropdown',
      schema: z.object({
        target: z.string().describe('The name of the dropdown element.'),
        option: z.string().describe('The option to select.')
      })
    }
  ),

  tool(
    async ({ text }, { configurable }) => {
      const ref = configurable.ref as PlayWord
      const page = ref.getPage()
      await page.waitForLoadState('domcontentloaded')

      await page.waitForSelector(`text=${text}`, { state: 'visible', timeout: 30000 })

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
