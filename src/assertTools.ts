import type { DynamicStructuredTool } from '@langchain/core/tools'
import type { ToolConfig } from './types'

import { tool } from '@langchain/core/tools'
import { z } from 'zod'

import * as actions from './actions'
import { AI } from './ai'
import { getElementLocations, sanitize } from './htmlUtils'
import { genericTags } from './resources'
import { info } from './logger'

/**
 * Tools for asserting conditions on the page.
 *
 * Include the following tools:
 * - **AssertElementContentEquals**
 * - **AssertElementVisible**
 * - **AssertPageContains**
 * - **AssertPageDoesNotContain**
 * - **AssertPageTitleEquals**
 * - **AssertPageUrlMatches**
 */
export default [
  tool(
    async ({ keywords, text }, { configurable }) => {
      const { ref, use_screenshot } = configurable as ToolConfig
      const openAI = new AI(ref.openAIOptions)
      const snapshot = await actions.getSnapshot(ref)
      const elements = getElementLocations(sanitize(snapshot), genericTags)

      if (snapshot !== ref.snapshot) {
        if (ref.debug) info('Snapshot changed. Embedding the new snapshot...')
        ref.snapshot = snapshot
        ref.store = await openAI.embedDocuments(elements.map(({ element }) => element))
        if (ref.debug) info('Snapshot embedded.')
      }

      const retrieved = await ref.store!.asRetriever(10).invoke(keywords)
      const xpaths = retrieved.map(({ pageContent }) => elements.find(({ element }) => element === pageContent)?.xpath)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.mark(ref, { xpath, order })))
      }
      const screenshot = use_screenshot ? await actions.getScreenshot(ref) : undefined
      const candidate = await openAI.getBestCandidate(ref.input, retrieved, screenshot)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.unmark(ref, { xpath, order })))
      }

      const xpath = elements.find(({ element }) => element === retrieved[candidate].pageContent)?.xpath

      if (await actions.assertElementContentEquals(ref, { xpath, text })) return 'Element content is equal to: ' + text
      else return 'Element content is not equal to: ' + text
    },
    {
      name: 'AssertElementContentEquals',
      description: 'Call to verify that an element has a specific text',
      schema: z.object({
        keywords: z
          .string()
          .describe(
            'Keywords used to retrieve the location of the element. Should contain the element name and any other relevant information mentioned in the sentence'
          ),
        text: z.string().describe('The text to verify on the element')
      })
    }
  ),

  tool(
    async ({ keywords, text }, { configurable }) => {
      const { ref, use_screenshot } = configurable as ToolConfig
      const openAI = new AI(ref.openAIOptions)
      const snapshot = await actions.getSnapshot(ref)
      const elements = getElementLocations(sanitize(snapshot), genericTags)

      if (snapshot !== ref.snapshot) {
        if (ref.debug) info('Snapshot changed. Embedding the new snapshot...')
        ref.snapshot = snapshot
        ref.store = await openAI.embedDocuments(elements.map(({ element }) => element))
        if (ref.debug) info('Snapshot embedded.')
      }

      const retrieved = await ref.store!.asRetriever(10).invoke(keywords)
      const xpaths = retrieved.map(({ pageContent }) => elements.find(({ element }) => element === pageContent)?.xpath)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.mark(ref, { xpath, order })))
      }
      const screenshot = use_screenshot ? await actions.getScreenshot(ref) : undefined
      const candidate = await openAI.getBestCandidate(ref.input, retrieved, screenshot)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.unmark(ref, { xpath, order })))
      }

      const xpath = elements.find(({ element }) => element === retrieved[candidate].pageContent)?.xpath

      if (await actions.assertElementContentNotEquals(ref, { xpath, text })) {
        return 'Element content is not equal to: ' + text
      } else {
        return 'Element content is equal to: ' + text
      }
    },
    {
      name: 'AssertElementContentNotEquals',
      description: 'Call to verify that an element does not have a specific text',
      schema: z.object({
        keywords: z
          .string()
          .describe(
            'Keywords used to retrieve the location of the element. Should contain the element name and any other relevant information mentioned in the sentence'
          ),
        text: z.string().describe('The text to verify on the element')
      })
    }
  ),

  tool(
    async ({ keywords }, { configurable }) => {
      const { ref, use_screenshot } = configurable as ToolConfig
      const openAI = new AI(ref.openAIOptions)
      const snapshot = await actions.getSnapshot(ref)
      const elements = getElementLocations(sanitize(snapshot), genericTags)

      if (snapshot !== ref.snapshot) {
        if (ref.debug) info('Snapshot changed. Embedding the new snapshot...')
        ref.snapshot = snapshot
        ref.store = await openAI.embedDocuments(elements.map(({ element }) => element))
        if (ref.debug) info('Snapshot embedded.')
      }

      const retrieved = await ref.store!.asRetriever(10).invoke(keywords)
      const xpaths = retrieved.map(({ pageContent }) => elements.find(({ element }) => element === pageContent)?.xpath)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.mark(ref, { xpath, order })))
      }

      const screenshot = use_screenshot ? await actions.getScreenshot(ref) : undefined
      const candidate = await openAI.getBestCandidate(ref.input, retrieved, screenshot)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.unmark(ref, { xpath, order })))
      }

      const xpath = elements.find(({ element }) => element === retrieved[candidate].pageContent)?.xpath

      if (await actions.assertElementVisible(ref, { xpath })) return 'Element is visible'
      else return 'Element is invisible'
    },
    {
      name: 'AssertElementVisible',
      description: 'Call to verify that an element is visible',
      schema: z.object({
        keywords: z
          .string()
          .describe(
            'Keywords used to retrieve the location of the element. Should contain the element name and any other relevant information mentioned in the sentence'
          )
      })
    }
  ),

  tool(
    async ({ keywords }, { configurable }) => {
      const { ref, use_screenshot } = configurable as ToolConfig
      const openAI = new AI(ref.openAIOptions)
      const snapshot = await actions.getSnapshot(ref)
      const elements = getElementLocations(sanitize(snapshot), genericTags)

      if (snapshot !== ref.snapshot) {
        if (ref.debug) info('Snapshot changed. Embedding the new snapshot...')
        ref.snapshot = snapshot
        ref.store = await openAI.embedDocuments(elements.map(({ element }) => element))
        if (ref.debug) info('Snapshot embedded.')
      }

      const retrieved = await ref.store!.asRetriever(10).invoke(keywords)
      const xpaths = retrieved.map(({ pageContent }) => elements.find(({ element }) => element === pageContent)?.xpath)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.mark(ref, { xpath, order })))
      }

      const screenshot = use_screenshot ? await actions.getScreenshot(ref) : undefined
      const candidate = await openAI.getBestCandidate(ref.input, retrieved, screenshot)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.unmark(ref, { xpath, order })))
      }

      const xpath = elements.find(({ element }) => element === retrieved[candidate].pageContent)?.xpath

      if (await actions.assertElementNotVisible(ref, { xpath })) return 'Element is invisible'
      else return 'Element is visible'
    },
    {
      name: 'AssertElementNotVisible',
      description: 'Call to verify that an element is not visible',
      schema: z.object({
        keywords: z
          .string()
          .describe(
            'Keywords used to retrieve the location of the element. Should contain the element name and any other relevant information mentioned in the sentence'
          )
      })
    }
  ),

  tool(
    async ({ text }, { configurable }) => {
      if (await actions.assertPageContains(configurable.ref, { text })) {
        return 'Page contains text: ' + text
      }
      return 'Page does not contain text: ' + text
    },
    {
      name: 'AssertPageContains',
      description: 'Call to verify that the page contains a specific text',
      schema: z.object({
        text: z.string().describe('The text to verify on the page')
      })
    }
  ),

  tool(
    async ({ text }, { configurable }) => {
      if (await actions.assertPageDoesNotContain(configurable.ref, { text })) {
        return 'Page does not contain text: ' + text
      }
      return 'Page contains text: ' + text
    },
    {
      name: 'AssertPageDoesNotContain',
      description: 'Call to verify that the page does not contain a specific text',
      schema: z.object({
        text: z.string().describe('The text to verify on the page')
      })
    }
  ),

  tool(
    async ({ text }, { configurable }) => {
      if (await actions.assertPageTitleEquals(configurable.ref, { text })) {
        return 'Page title is equal to: ' + text
      }
      return 'Page title is not equal to: ' + text
    },
    {
      name: 'AssertPageTitleEquals',
      description: 'Call to verify that the page title is equal to a specific text',
      schema: z.object({
        text: z.string().describe('The text to verify on the page title')
      })
    }
  ),

  tool(
    async ({ pattern }, { configurable }) => {
      if (await actions.assertPageUrlMatches(configurable.ref, { pattern })) {
        return 'Page URL matches the pattern: ' + pattern
      }
      return 'Page URL does not match the pattern: ' + pattern
    },
    {
      name: 'AssertPageUrlMatches',
      description: 'Call to verify that the page URL matches a specific pattern',
      schema: z.object({
        pattern: z.string().describe('The pattern to verify on the page URL')
      })
    }
  )
] as unknown as DynamicStructuredTool[]
