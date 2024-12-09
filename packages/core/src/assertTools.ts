import type { DynamicStructuredTool } from '@langchain/core/tools'
import type { ToolConfig } from './types'

import { tool } from '@langchain/core/tools'
import { z } from 'zod'

import * as actions from './actions'
import { getElementLocations, sanitize } from './htmlUtils'
import { genericTags } from './resources'

/**
 * Tools for asserting conditions on the page.
 *
 * Include the following tools:
 * - **AssertElementContentEquals**
 * - **AssertElementVisible**
 * - **AssertImageContains**
 * - **AssertPageContains**
 * - **AssertPageDoesNotContain**
 * - **AssertPageTitleEquals**
 * - **AssertPageUrlMatches**
 */
export default [
  tool(
    async ({ keywords, text }, { configurable }) => {
      const { ref, use_screenshot } = configurable as ToolConfig
      const snapshot = await actions.getSnapshot(ref)
      const elements = getElementLocations(sanitize(snapshot), genericTags)

      if (snapshot !== ref.snapshot || elements.length !== ref.elements.length) {
        if (ref.debug && ref.logger) ref.logger.text = 'Snapshot changed. Embedding the new snapshot...'
        ref.snapshot = snapshot
        ref.elements = elements
        await ref.ai.embedDocuments(elements.map(({ element }) => element))
        if (ref.debug && ref.logger) ref.logger.text = 'Snapshot embedded.'
      }

      const retrieved = await ref.ai.searchDocuments(keywords)
      const xpaths = retrieved.map(({ pageContent }) => elements.find(({ element }) => element === pageContent)?.xpath)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.mark(ref, { xpath, order })))
      }
      const screenshot = use_screenshot ? await actions.getScreenshot(ref) : undefined
      const candidate = await ref.ai.getBestCandidate(ref.input, retrieved, screenshot)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.unmark(ref, { xpath, order })))
      }

      const xpath = elements.find(({ element }) => element === retrieved[candidate].pageContent)?.xpath

      if (ref.record)
        ref.recordings[ref.step].actions.push({ name: 'assertElementContentEquals', params: { xpath, text } })

      if (await actions.assertElementContentEquals(ref, { xpath, text })) {
        return 'PASS: Element content is equal to: ' + text
      }
      return 'FAIL: Element content is not equal to: ' + text
    },
    {
      name: 'AssertElementContentEquals',
      description: 'Call to verify that an element has specific text',
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
      const snapshot = await actions.getSnapshot(ref)
      const elements = getElementLocations(sanitize(snapshot), genericTags)

      if (snapshot !== ref.snapshot || elements.length !== ref.elements.length) {
        if (ref.debug && ref.logger) ref.logger.text = 'Snapshot changed. Embedding the new snapshot...'
        ref.snapshot = snapshot
        ref.elements = elements
        await ref.ai.embedDocuments(elements.map(({ element }) => element))
        if (ref.debug && ref.logger) ref.logger.text = 'Snapshot embedded.'
      }

      const retrieved = await ref.ai.searchDocuments(keywords)
      const xpaths = retrieved.map(({ pageContent }) => elements.find(({ element }) => element === pageContent)?.xpath)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.mark(ref, { xpath, order })))
      }
      const screenshot = use_screenshot ? await actions.getScreenshot(ref) : undefined
      const candidate = await ref.ai.getBestCandidate(ref.input, retrieved, screenshot)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.unmark(ref, { xpath, order })))
      }

      const xpath = elements.find(({ element }) => element === retrieved[candidate].pageContent)?.xpath

      if (ref.record)
        ref.recordings[ref.step].actions.push({ name: 'assertElementContentNotEquals', params: { xpath, text } })

      if (await actions.assertElementContentNotEquals(ref, { xpath, text })) {
        return 'PASS: Element content is not equal to: ' + text
      }
      return 'FAIL: Element content is equal to: ' + text
    },
    {
      name: 'AssertElementContentNotEquals',
      description: 'Call to verify that an element does not have specific text',
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
      const snapshot = await actions.getSnapshot(ref)
      const elements = getElementLocations(sanitize(snapshot), genericTags)

      if (snapshot !== ref.snapshot || elements.length !== ref.elements.length) {
        if (ref.debug && ref.logger) ref.logger.text = 'Snapshot changed. Embedding the new snapshot...'
        ref.snapshot = snapshot
        ref.elements = elements
        await ref.ai.embedDocuments(elements.map(({ element }) => element))
        if (ref.debug && ref.logger) ref.logger.text = 'Snapshot embedded.'
      }

      const retrieved = await ref.ai.searchDocuments(keywords)
      const xpaths = retrieved.map(({ pageContent }) => elements.find(({ element }) => element === pageContent)?.xpath)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.mark(ref, { xpath, order })))
      }

      const screenshot = use_screenshot ? await actions.getScreenshot(ref) : undefined
      const candidate = await ref.ai.getBestCandidate(ref.input, retrieved, screenshot)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.unmark(ref, { xpath, order })))
      }

      const xpath = elements.find(({ element }) => element === retrieved[candidate].pageContent)?.xpath

      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'assertElementVisible', params: { xpath } })

      if (await actions.assertElementVisible(ref, { xpath })) {
        return 'PASS: Element is visible'
      }
      return 'FAIL: Element is invisible'
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
      const snapshot = await actions.getSnapshot(ref)
      const elements = getElementLocations(sanitize(snapshot), genericTags)

      if (snapshot !== ref.snapshot || elements.length !== ref.elements.length) {
        if (ref.debug && ref.logger) ref.logger.text = 'Snapshot changed. Embedding the new snapshot...'
        ref.snapshot = snapshot
        ref.elements = elements
        await ref.ai.embedDocuments(elements.map(({ element }) => element))
        if (ref.debug && ref.logger) ref.logger.text = 'Snapshot embedded.'
      }

      const retrieved = await ref.ai.searchDocuments(keywords)
      const xpaths = retrieved.map(({ pageContent }) => elements.find(({ element }) => element === pageContent)?.xpath)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.mark(ref, { xpath, order })))
      }

      const screenshot = use_screenshot ? await actions.getScreenshot(ref) : undefined
      const candidate = await ref.ai.getBestCandidate(ref.input, retrieved, screenshot)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.unmark(ref, { xpath, order })))
      }

      const xpath = elements.find(({ element }) => element === retrieved[candidate].pageContent)?.xpath

      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'assertElementNotVisible', params: { xpath } })

      if (await actions.assertElementNotVisible(ref, { xpath })) {
        return 'PASS: Element is invisible'
      }
      return 'FAIL: Element is visible'
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
    async ({ keywords }, { configurable }) => {
      const { ref, use_screenshot } = configurable as ToolConfig
      const snapshot = await actions.getSnapshot(ref)
      const elements = getElementLocations(sanitize(snapshot), genericTags)

      if (snapshot !== ref.snapshot || elements.length !== ref.elements.length) {
        if (ref.debug && ref.logger) ref.logger.text = 'Snapshot changed. Embedding the new snapshot...'
        ref.snapshot = snapshot
        ref.elements = elements
        await ref.ai.embedDocuments(elements.map(({ element }) => element))
        if (ref.debug && ref.logger) ref.logger.text = 'Snapshot embedded.'
      }

      const retrieved = await ref.ai.searchDocuments(keywords)
      const xpaths = retrieved.map(({ pageContent }) => elements.find(({ element }) => element === pageContent)?.xpath)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.mark(ref, { xpath, order })))
      }

      const screenshot = use_screenshot ? await actions.getScreenshot(ref) : undefined
      const candidate = await ref.ai.getBestCandidate(ref.input, retrieved, screenshot)

      if (use_screenshot) {
        await Promise.all(xpaths.map((xpath, order) => actions.unmark(ref, { xpath, order })))
      }

      const xpath = elements.find(({ element }) => element === retrieved[candidate].pageContent)?.xpath

      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'assertImageContains', params: { xpath } })

      if (await actions.assertImageContains(ref, { xpath })) {
        return 'PASS: Image contains the information'
      }
      return 'FAIL: Image does not contain the information'
    },
    {
      name: 'AssertImageContains',
      description:
        'Call to capture a screenshot and verify that the image contains specific information the user is looking for',
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
      const { ref } = configurable as ToolConfig
      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'assertPageContains', params: { text } })

      if (await actions.assertPageContains(ref, { text })) {
        return 'PASS: Page contains text: ' + text
      }
      return 'FAIL: Page does not contain text: ' + text
    },
    {
      name: 'AssertPageContains',
      description: 'Call to verify that the page contains specific text',
      schema: z.object({
        text: z.string().describe('The text to verify on the page')
      })
    }
  ),

  tool(
    async ({ text }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'assertPageDoesNotContain', params: { text } })

      if (await actions.assertPageDoesNotContain(ref, { text })) {
        return 'PASS: Page does not contain text: ' + text
      }
      return 'FAIL: Page contains text: ' + text
    },
    {
      name: 'AssertPageDoesNotContain',
      description: 'Call to verify that the page does not contain specific text',
      schema: z.object({
        text: z.string().describe('The text to verify on the page')
      })
    }
  ),

  tool(
    async ({ text }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'assertPageTitleEquals', params: { text } })

      if (await actions.assertPageTitleEquals(ref, { text })) {
        return 'PASS: Page title is equal to: ' + text
      }
      return 'FAIL: Page title is not equal to: ' + text
    },
    {
      name: 'AssertPageTitleEquals',
      description: 'Call to verify that the page title is equal to specific text',
      schema: z.object({
        text: z.string().describe('The text to verify on the page title')
      })
    }
  ),

  tool(
    async ({ pattern }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'assertPageUrlMatches', params: { pattern } })

      if (await actions.assertPageUrlMatches(ref, { pattern })) {
        return 'PASS: Page URL matches the pattern: ' + pattern
      }
      return 'FAIL: Page URL does not match the pattern: ' + pattern
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
