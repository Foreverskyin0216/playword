import type { DynamicStructuredTool } from '@langchain/core/tools'
import type { ToolConfig } from '../types'

import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import * as actions from '../actions'
import * as utils from '../utils'

/**
 * Custom tools for asserting conditions on the page.
 *
 * The following tools are available:
 * - AssertElementContains
 * - AssertElementNotContain
 * - AssertElementContentEquals
 * - AssertElementContentNotEqual
 * - AssertElementVisible
 * - AssertElementNotVisible
 * - AssertPageContains
 * - AssertPageNotContain
 * - AssertPageTitleEquals
 * - AssertPageUrlMatches
 */
export const assertion = [
  tool(
    async ({ keywords, text }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { ai, input, page, recorder } = ref

      const resource = await page!.evaluate(utils.getElementLocations, utils.allowedTags)
      const elements = resource.map(({ html, xpath }) => ({ html: utils.sanitize(html), xpath }))

      utils.info('Embedding the snapshot...')
      await ai.embedTexts(elements.map(({ html }) => html))
      utils.info('Snapshot embedded.')

      const documents = await ai.searchDocuments(keywords)
      const candidate = await ai.getBestCandidate(input, documents)
      const { xpath } = elements.find(({ html }) => html === documents[candidate].pageContent)!

      recorder?.addAction({ name: 'assertElementContains', params: { text } })

      return (await actions.assertElementContains(ref, { text, xpath }))
        ? 'PASS: Element contains text: ' + text
        : 'FAIL: Element does not contain text: ' + text
    },
    {
      name: 'AssertElementContains',
      description: 'Call to verify that an element contains specific text',
      schema: z.object({
        keywords: z.string().describe('Keywords for searching the relevant element from user input'),
        text: z.string().describe('The text to verify on the element')
      })
    }
  ),

  tool(
    async ({ keywords, text }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { ai, input, page, recorder } = ref

      const resource = await page!.evaluate(utils.getElementLocations, utils.allowedTags)
      const elements = resource.map(({ html, xpath }) => ({ html: utils.sanitize(html), xpath }))

      utils.info('Embedding the snapshot...')
      await ai.embedTexts(elements.map(({ html }) => html))
      utils.info('Snapshot embedded.')

      const documents = await ai.searchDocuments(keywords)
      const candidate = await ai.getBestCandidate(input, documents)
      const { xpath } = elements.find(({ html }) => html === documents[candidate].pageContent)!

      recorder?.addAction({ name: 'assertElementNotContain', params: { text } })

      return (await actions.assertElementNotContain(ref, { text, xpath }))
        ? 'PASS: Element does not contain text: ' + text
        : 'FAIL: Element contains text: ' + text
    },
    {
      name: 'AssertElementNotContain',
      description: 'Call to verify that an element does not contain specific text',
      schema: z.object({
        keywords: z.string().describe('Keywords for searching the relevant element from user input'),
        text: z.string().describe('The text to verify on the element')
      })
    }
  ),

  tool(
    async ({ keywords, text }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { ai, input, page, recorder } = ref

      const resource = await page!.evaluate(utils.getElementLocations, utils.allowedTags)
      const elements = resource.map(({ html, xpath }) => ({ html: utils.sanitize(html), xpath }))

      utils.info('Embedding the snapshot...')
      await ai.embedTexts(elements.map(({ html }) => html))
      utils.info('Snapshot embedded.')

      const documents = await ai.searchDocuments(keywords)
      const candidate = await ai.getBestCandidate(input, documents)
      const { xpath } = elements.find(({ html }) => html === documents[candidate].pageContent)!

      recorder?.addAction({ name: 'assertElementContentEquals', params: { xpath, text } })

      return (await actions.assertElementContentEquals(ref, { xpath, text }))
        ? 'PASS: Element content is equal to: ' + text
        : 'FAIL: Element content is not equal to: ' + text
    },
    {
      name: 'AssertElementContentEquals',
      description: 'Call to verify that an element has specific text',
      schema: z.object({
        keywords: z.string().describe('Keywords for searching the relevant element from user input'),
        text: z.string().describe('The text to verify on the element')
      })
    }
  ),

  tool(
    async ({ keywords, text }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { ai, input, page, recorder } = ref

      const resource = await page!.evaluate(utils.getElementLocations, utils.allowedTags)
      const elements = resource.map(({ html, xpath }) => ({ html: utils.sanitize(html), xpath }))

      utils.info('Embedding the snapshot...')
      await ai.embedTexts(elements.map(({ html }) => html))
      utils.info('Snapshot embedded.')

      const documents = await ai.searchDocuments(keywords)
      const candidate = await ai.getBestCandidate(input, documents)
      const { xpath } = elements.find(({ html }) => html === documents[candidate].pageContent)!

      recorder?.addAction({ name: 'assertElementContentNotEqual', params: { xpath, text } })

      return (await actions.assertElementContentNotEqual(ref, { xpath, text }))
        ? 'PASS: Element content is not equal to: ' + text
        : 'FAIL: Element content is equal to: ' + text
    },
    {
      name: 'AssertElementContentNotEqual',
      description: 'Call to verify that an element does not have specific text',
      schema: z.object({
        keywords: z.string().describe('Keywords for searching the relevant element from user input'),
        text: z.string().describe('The text to verify on the element')
      })
    }
  ),

  tool(
    async ({ keywords }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { ai, input, page, recorder } = ref

      const resource = await page!.evaluate(utils.getElementLocations, utils.allowedTags)
      const elements = resource.map(({ html, xpath }) => ({ html: utils.sanitize(html), xpath }))

      utils.info('Embedding the snapshot...')
      await ai.embedTexts(elements.map(({ html }) => html))
      utils.info('Snapshot embedded.')

      const documents = await ai.searchDocuments(keywords)
      const candidate = await ai.getBestCandidate(input, documents)
      const { xpath } = elements.find(({ html }) => html === documents[candidate].pageContent)!

      recorder?.addAction({ name: 'assertElementVisible', params: { xpath } })

      return (await actions.assertElementVisible(ref, { xpath }))
        ? 'PASS: Element is visible'
        : 'FAIL: Element is invisible'
    },
    {
      name: 'AssertElementVisible',
      description: 'Call to verify that an element is visible',
      schema: z.object({ keywords: z.string().describe('Keywords for searching the relevant element from user input') })
    }
  ),

  tool(
    async ({ keywords }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { ai, input, page, recorder } = ref

      const resource = await page!.evaluate(utils.getElementLocations, utils.allowedTags)
      const elements = resource.map(({ html, xpath }) => ({ html: utils.sanitize(html), xpath }))

      utils.info('Embedding the snapshot...')
      await ai.embedTexts(elements.map(({ html }) => html))
      utils.info('Snapshot embedded.')

      const documents = await ai.searchDocuments(keywords)
      const candidate = await ai.getBestCandidate(input, documents)
      const { xpath } = elements.find(({ html }) => html === documents[candidate].pageContent)!

      recorder?.addAction({ name: 'assertElementNotVisible', params: { xpath } })

      return (await actions.assertElementNotVisible(ref, { xpath }))
        ? 'PASS: Element is invisible'
        : 'FAIL: Element is visible'
    },
    {
      name: 'AssertElementNotVisible',
      description: 'Call to verify that an element is not visible',
      schema: z.object({ keywords: z.string().describe('Keywords for searching the relevant element from user input') })
    }
  ),

  tool(
    async ({ text }, { configurable }) => {
      const { ref } = configurable as ToolConfig

      ref.recorder?.addAction({ name: 'assertPageContains', params: { text } })

      return (await actions.assertPageContains(ref, { text }))
        ? 'PASS: Page contains text: ' + text
        : 'FAIL: Page does not contain text: ' + text
    },
    {
      name: 'AssertPageContains',
      description: 'Call to verify that the page contains specific text',
      schema: z.object({ text: z.string().describe('The text to verify on the page') })
    }
  ),

  tool(
    async ({ text }, { configurable }) => {
      const { ref } = configurable as ToolConfig

      ref.recorder?.addAction({ name: 'assertPageNotContain', params: { text } })

      return (await actions.assertPageNotContain(ref, { text }))
        ? 'PASS: Page does not contain text: ' + text
        : 'FAIL: Page contains text: ' + text
    },
    {
      name: 'AssertPageNotContain',
      description: 'Call to verify that the page does not contain specific text',
      schema: z.object({ text: z.string().describe('The text to verify on the page') })
    }
  ),

  tool(
    async ({ text }, { configurable }) => {
      const { ref } = configurable as ToolConfig

      ref.recorder?.addAction({ name: 'assertPageTitleContains', params: { text } })

      return (await actions.assertPageTitleEquals(ref, { text }))
        ? 'PASS: Page title is equal to: ' + text
        : 'FAIL: Page title is not equal to: ' + text
    },
    {
      name: 'AssertPageTitleEquals',
      description: 'Call to verify that the page title is equal to specific text',
      schema: z.object({ text: z.string().describe('The text to verify on the page title') })
    }
  ),

  tool(
    async ({ pattern }, { configurable }) => {
      const { ref } = configurable as ToolConfig

      ref.recorder?.addAction({ name: 'assertPageTitleMatches', params: { pattern } })

      return (await actions.assertPageUrlMatches(ref, { pattern }))
        ? 'PASS: Page URL matches the pattern: ' + pattern
        : 'FAIL: Page URL does not match the pattern: ' + pattern
    },
    {
      name: 'AssertPageUrlMatches',
      description: 'Call to verify that the page URL matches a specific pattern',
      schema: z.object({ pattern: z.string().describe('The pattern to verify on the page URL') })
    }
  )
] as unknown as DynamicStructuredTool[]
