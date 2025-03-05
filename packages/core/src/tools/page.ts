import type { DynamicStructuredTool } from '@langchain/core/tools'
import type { ToolConfig } from '../types'

import { Document } from '@langchain/core/documents'
import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import * as actions from '../actions'
import * as utils from '../utils'

/**
 * Custom tools for interacting with the page.
 *
 * The following tools are available:
 * - Click
 * - GoTo
 * - Hover
 * - Input
 * - PressKeys
 * - Scroll
 * - Select
 * - Sleep
 * - SwitchFrame
 * - SwitchPage
 * - WaitForText
 */
export const page = [
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

      recorder?.addAction({ name: 'click', params: { xpath } })

      return actions.click(ref, { xpath })
    },
    {
      name: 'Click',
      description: 'Call to click on an element',
      schema: z.object({ keywords: z.string().describe('Keywords for searching the relevant element from user input') })
    }
  ),

  tool(
    async ({ url }, { configurable }) => {
      const { ref } = configurable as ToolConfig

      ref.recorder?.addAction({ name: 'goto', params: { url } })

      return actions.goto(ref, { url })
    },
    {
      name: 'GoTo',
      description: 'Call to go to a specific URL',
      schema: z.object({ url: z.string().describe('The URL to navigate to') })
    }
  ),

  tool(
    async ({ duration, keywords }, { configurable }) => {
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

      recorder?.addAction({ name: 'hover', params: { xpath } })

      return actions.hover(ref, { duration, xpath })
    },
    {
      name: 'Hover',
      description: 'Call to hover over an element',
      schema: z.object({
        duration: z.number().describe('The duration to hover over the element. Default is 1000ms'),
        keywords: z.string().describe('Keywords for searching the relevant element from user input')
      })
    }
  ),

  tool(
    async ({ keywords, text }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { ai, input, page, recorder } = ref

      const resource = await page!.evaluate(utils.getElementLocations, ['input', 'textarea'])
      const elements = resource.map(({ html, xpath }) => ({ html: utils.sanitize(html), xpath }))

      utils.info('Embedding the snapshot...')
      await ai.embedTexts(elements.map(({ html }) => html))
      utils.info('Snapshot embedded.')

      const documents = await ai.searchDocuments(keywords)
      const candidate = await ai.getBestCandidate(input, documents)
      const { xpath } = elements.find(({ html }) => html === documents[candidate].pageContent)!

      recorder?.addAction({ name: 'input', params: { text, xpath } })

      return actions.input(ref, { text, xpath })
    },
    {
      name: 'Input',
      description: 'Call to type text into the input field or textarea',
      schema: z.object({
        keywords: z.string().describe('Keywords for searching the relevant element from user input'),
        text: z.string().describe('Text to input')
      })
    }
  ),

  tool(
    async ({ keys }, { configurable }) => {
      const { ref } = configurable as ToolConfig

      ref.recorder?.addAction({ name: 'pressKeys', params: { keys } })

      return actions.pressKeys(ref, { keys })
    },
    {
      name: 'PressKeys',
      description: 'Call to press a key or keys',
      schema: z.object({
        keys: z.string().describe('Keys to press. The format should match the Playwright API')
      })
    }
  ),

  tool(
    async ({ direction }, { configurable }) => {
      const { ref } = configurable as ToolConfig

      ref.recorder?.addAction({ name: 'scroll', params: { direction } })

      return actions.scroll(ref, { direction })
    },
    {
      name: 'Scroll',
      description: 'Call to scroll the page',
      schema: z.object({
        direction: z.enum(['top', 'bottom', 'up', 'down']).describe('The direction to scroll')
      })
    }
  ),

  tool(
    async ({ keywords, option }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { ai, input, page, recorder } = ref

      const resource = await page!.evaluate(utils.getElementLocations, ['select'])
      const elements = resource.map(({ html, xpath }) => ({ html: utils.sanitize(html), xpath }))

      utils.info('Embedding the snapshot...')
      await ai.embedTexts(elements.map(({ html }) => html))
      utils.info('Snapshot embedded.')

      const documents = await ai.searchDocuments(keywords)
      const candidate = await ai.getBestCandidate(input, documents)
      const { xpath } = elements.find(({ html }) => html === documents[candidate].pageContent)!

      recorder?.addAction({ name: 'select', params: { option, xpath } })

      return actions.select(ref, { option, xpath })
    },
    {
      name: 'Select',
      description: 'Call to select an option from a select element',
      schema: z.object({
        keywords: z.string().describe('Keywords for searching the relevant element from user input'),
        option: z.string().describe('The option to select')
      })
    }
  ),

  tool(
    async ({ duration }, { configurable }) => {
      const { ref } = configurable as ToolConfig

      ref.recorder?.addAction({ name: 'sleep', params: { duration } })

      return actions.sleep(ref, { duration })
    },
    {
      name: 'Sleep',
      description: 'Call to wait for a certain amount of time',
      schema: z.object({ duration: z.number().describe('The duration to wait in milliseconds') })
    }
  ),

  tool(
    async ({ enterFrame }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { ai, input, page, recorder } = ref

      const frames = page?.frames().map((frame) => JSON.stringify({ name: frame.name(), url: frame.url() }))

      if (enterFrame && frames?.length) {
        const documents = frames.map((frame) => new Document({ pageContent: frame }))
        const candidate = await ai.getBestCandidate(input, documents)
        recorder?.addAction({ name: 'switchFrame', params: { frameNumber: candidate } })
        return actions.switchFrame(ref, { frameNumber: candidate })
      }

      recorder?.addAction({ name: 'switchFrame', params: {} })

      return actions.switchFrame(ref, {})
    },
    {
      name: 'SwitchFrame',
      description: 'Call to switch, enter or return to a frame',
      schema: z.object({
        enterFrame: z.boolean().describe('Return true to enter the frame, false to return to the main page')
      })
    }
  ),

  tool(
    async ({ pageNumber }, { configurable }) => {
      const { ref } = configurable as ToolConfig

      return actions.switchPage(ref, { pageNumber })
    },
    {
      name: 'SwitchPage',
      description: 'Call to switch to a different page or tab',
      schema: z.object({ pageNumber: z.number().describe('The index of the page to switch to. Starts from 0') })
    }
  ),

  tool(
    async ({ text }, { configurable }) => {
      const { ref } = configurable as ToolConfig

      ref.recorder?.addAction({ name: 'waitForText', params: { text } })

      return actions.waitForText(ref, { text })
    },
    {
      name: 'WaitForText',
      description: 'Call to wait for text to appear on the page',
      schema: z.object({ text: z.string().describe('Text to wait for') })
    }
  )
] as unknown as DynamicStructuredTool[]
