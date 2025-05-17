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
    async ({ text, thoughts }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { ai, recorder } = ref

      utils.debug('Thoughts: ' + thoughts, 'magenta')

      const handle = await utils.getHandle(ref)
      const resource = await handle.evaluate(utils.getElementLocations, utils.allowedTags)
      const elements = resource.map(({ html, xpath }) => ({ html: utils.sanitize(html), xpath }))
      await ai.embedTexts(elements.map(({ html }) => html))

      const documents = await ai.searchDocuments(thoughts)
      const candidate = await ai.getBestCandidate(thoughts, documents)
      const { xpath } = elements.find(({ html }) => html === documents[candidate].pageContent)!

      recorder?.addAction({ name: 'assertElementContains', params: { text, xpath } })

      return actions.assertElementContains(ref, { text, xpath })
    },
    {
      name: 'AssertElementContains',
      description: 'Call to verify that an element contains specific text',
      schema: z.object({
        text: z.string().describe('The text to verify on the element'),
        thoughts: z.string().describe('Thoughts to search for the relevant element from user input')
      })
    }
  ),

  tool(
    async ({ text, thoughts }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { ai, recorder } = ref

      utils.debug('Thoughts: ' + thoughts, 'magenta')

      const handle = await utils.getHandle(ref)
      const resource = await handle.evaluate(utils.getElementLocations, utils.allowedTags)
      const elements = resource.map(({ html, xpath }) => ({ html: utils.sanitize(html), xpath }))
      await ai.embedTexts(elements.map(({ html }) => html))

      const documents = await ai.searchDocuments(thoughts)
      const candidate = await ai.getBestCandidate(thoughts, documents)
      const { xpath } = elements.find(({ html }) => html === documents[candidate].pageContent)!

      recorder?.addAction({ name: 'assertElementNotContain', params: { text, xpath } })

      return actions.assertElementNotContain(ref, { text, xpath })
    },
    {
      name: 'AssertElementNotContain',
      description: 'Call to verify that an element does not contain specific text',
      schema: z.object({
        text: z.string().describe('The text to verify on the element'),
        thoughts: z.string().describe('Thoughts to search for the relevant element from user input')
      })
    }
  ),

  tool(
    async ({ text, thoughts }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { ai, recorder } = ref

      utils.debug('Thoughts: ' + thoughts, 'magenta')

      const handle = await utils.getHandle(ref)
      const resource = await handle.evaluate(utils.getElementLocations, utils.allowedTags)
      const elements = resource.map(({ html, xpath }) => ({ html: utils.sanitize(html), xpath }))
      await ai.embedTexts(elements.map(({ html }) => html))

      const documents = await ai.searchDocuments(thoughts)
      const candidate = await ai.getBestCandidate(thoughts, documents)
      const { xpath } = elements.find(({ html }) => html === documents[candidate].pageContent)!

      recorder?.addAction({ name: 'assertElementContentEquals', params: { xpath, text } })

      return actions.assertElementContentEquals(ref, { xpath, text })
    },
    {
      name: 'AssertElementContentEquals',
      description: 'Call to verify that an element has specific text',
      schema: z.object({
        text: z.string().describe('The text to verify on the element'),
        thoughts: z.string().describe('Thoughts to search for the relevant element from user input')
      })
    }
  ),

  tool(
    async ({ text, thoughts }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { ai, recorder } = ref

      utils.debug('Thoughts: ' + thoughts, 'magenta')

      const handle = await utils.getHandle(ref)
      const resource = await handle.evaluate(utils.getElementLocations, utils.allowedTags)
      const elements = resource.map(({ html, xpath }) => ({ html: utils.sanitize(html), xpath }))
      await ai.embedTexts(elements.map(({ html }) => html))

      const documents = await ai.searchDocuments(thoughts)
      const candidate = await ai.getBestCandidate(thoughts, documents)
      const { xpath } = elements.find(({ html }) => html === documents[candidate].pageContent)!

      recorder?.addAction({ name: 'assertElementContentNotEqual', params: { xpath, text } })

      return actions.assertElementContentNotEqual(ref, { xpath, text })
    },
    {
      name: 'AssertElementContentNotEqual',
      description: 'Call to verify that an element does not have specific text',
      schema: z.object({
        text: z.string().describe('The text to verify on the element'),
        thoughts: z.string().describe('Thoughts to search for the relevant element from user input')
      })
    }
  ),

  tool(
    async ({ thoughts }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { ai, recorder } = ref

      utils.debug('Thoughts: ' + thoughts, 'magenta')

      const handle = await utils.getHandle(ref)
      const resource = await handle.evaluate(utils.getElementLocations, utils.allowedTags)
      const elements = resource.map(({ html, xpath }) => ({ html: utils.sanitize(html), xpath }))
      await ai.embedTexts(elements.map(({ html }) => html))

      const documents = await ai.searchDocuments(thoughts)
      const candidate = await ai.getBestCandidate(thoughts, documents)
      const { xpath } = elements.find(({ html }) => html === documents[candidate].pageContent)!

      recorder?.addAction({ name: 'assertElementVisible', params: { xpath } })

      return actions.assertElementVisible(ref, { xpath })
    },
    {
      name: 'AssertElementVisible',
      description: 'Call to verify that an element is visible',
      schema: z.object({ thoughts: z.string().describe('Thoughts to search for the relevant element from user input') })
    }
  ),

  tool(
    async ({ thoughts }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { ai, recorder } = ref

      utils.debug('Thoughts: ' + thoughts, 'magenta')

      const handle = await utils.getHandle(ref)
      const resource = await handle.evaluate(utils.getElementLocations, utils.allowedTags)
      const elements = resource.map(({ html, xpath }) => ({ html: utils.sanitize(html), xpath }))
      await ai.embedTexts(elements.map(({ html }) => html))

      const documents = await ai.searchDocuments(thoughts)
      const candidate = await ai.getBestCandidate(thoughts, documents)
      const { xpath } = elements.find(({ html }) => html === documents[candidate].pageContent)!

      recorder?.addAction({ name: 'assertElementNotVisible', params: { xpath } })

      return actions.assertElementNotVisible(ref, { xpath })
    },
    {
      name: 'AssertElementNotVisible',
      description: 'Call to verify that an element is not visible',
      schema: z.object({ thoughts: z.string().describe('Thoughts to search for the relevant element from user input') })
    }
  ),

  tool(
    async ({ text }, { configurable }) => {
      const { ref } = configurable as ToolConfig

      utils.debug('Thoughts: Verify if the page contains "' + text + '"', 'magenta')
      ref.recorder?.addAction({ name: 'assertPageContains', params: { text } })

      return actions.assertPageContains(ref, { text })
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

      utils.debug('Thoughts: Verify if the page does not contain "' + text + '"', 'magenta')
      ref.recorder?.addAction({ name: 'assertPageNotContain', params: { text } })

      return actions.assertPageNotContain(ref, { text })
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

      utils.debug('Thoughts: Verify if the page title is "' + text + '"', 'magenta')
      ref.recorder?.addAction({ name: 'assertPageTitleEquals', params: { text } })

      return actions.assertPageTitleEquals(ref, { text })
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

      utils.debug('Thoughts: Verify if the page URL matches the pattern "' + pattern + '"', 'magenta')
      ref.recorder?.addAction({ name: 'assertPageUrlMatches', params: { pattern } })

      return actions.assertPageUrlMatches(ref, { pattern })
    },
    {
      name: 'AssertPageUrlMatches',
      description: 'Call to verify that the page URL matches a specific pattern',
      schema: z.object({ pattern: z.string().describe('The pattern to verify on the page URL') })
    }
  )
] as unknown as DynamicStructuredTool[]
