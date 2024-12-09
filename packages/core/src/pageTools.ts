import type { DynamicStructuredTool } from '@langchain/core/tools'
import type { ToolConfig } from './types'

import { tool } from '@langchain/core/tools'
import { z } from 'zod'

import * as actions from './actions'
import { getElementLocations, sanitize } from './htmlUtils'
import { genericTags } from './resources'

/**
 * Tools for interacting with the page.
 *
 * Include the following tools:
 * - **Click**
 * - **GetAttribute**
 * - **GetImageInformation**
 * - **GoBack**
 * - **GoTo**
 * - **Hover**
 * - **Input**
 * - **PressKeys**
 * - **Scroll**
 * - **Select**
 * - **Sleep**
 * - **SwitchFrame**
 * - **WaitForText**
 */
export default [
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

      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'click', params: { xpath } })

      return await actions.click(ref, { xpath })
    },
    {
      name: 'Click',
      description: 'Call to click on an element',
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
    async ({ attribute, keywords }, { configurable }) => {
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

      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'getAttribute', params: { attribute, xpath } })

      return await actions.getAttribute(ref, { attribute, xpath })
    },
    {
      name: 'GetAttribute',
      description: 'Call to get a specific attribute from an element',
      schema: z.object({
        attribute: z.string().describe('The attribute to get from the element'),
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

      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'getImageInformation', params: { xpath } })

      return await actions.getImageInformation(ref, { xpath })
    },
    {
      name: 'GetImageInformation',
      description: 'Call to capture a screenshot from an element and get its information',
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

      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'getText', params: { xpath } })

      return await actions.getText(ref, { xpath })
    },
    {
      name: 'GetText',
      description: 'Call to get text of an element',
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
    async (_, { configurable }) => {
      const { ref } = configurable as ToolConfig
      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'goBack', params: {} })
      return await actions.goBack(ref)
    },
    {
      name: 'GoBack',
      description: 'Call to go back to the previous page',
      schema: z.object({})
    }
  ),

  tool(
    async ({ url }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'goto', params: { url } })
      return await actions.goto(configurable.ref, { url })
    },
    {
      name: 'GoTo',
      description: 'Call to go to a specific URL',
      schema: z.object({
        url: z.string().describe('The URL to navigate to')
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

      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'hover', params: { xpath } })

      return await actions.hover(ref, { xpath })
    },
    {
      name: 'Hover',
      description: 'Call to hover over an element',
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
    async ({ keywords, text }, { configurable }) => {
      const { ref, use_screenshot } = configurable as ToolConfig
      const snapshot = await actions.getSnapshot(ref)
      const elements = getElementLocations(sanitize(snapshot), ['input', 'textarea'])

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

      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'input', params: { text, xpath } })

      return await actions.input(ref, { text, xpath })
    },
    {
      name: 'Input',
      description: 'Call to type text into the input field or textarea',
      schema: z.object({
        keywords: z
          .string()
          .describe(
            'Keywords used to retrieve the location of the element. Should contain the element name and any other relevant information mentioned in the sentence'
          ),
        text: z.string().describe('Text to input')
      })
    }
  ),

  tool(
    async ({ keys }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'pressKeys', params: { keys } })
      return await actions.pressKeys(ref, { keys })
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
      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'scroll', params: { direction } })
      return await actions.scroll(configurable.ref, { direction })
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
      const { ref, use_screenshot } = configurable as ToolConfig
      const snapshot = await actions.getSnapshot(ref)
      const elements = getElementLocations(sanitize(snapshot), ['select'])

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

      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'select', params: { option, xpath } })

      return await actions.select(ref, { option, xpath })
    },
    {
      name: 'Select',
      description: 'Call to select an option from a select element',
      schema: z.object({
        keywords: z
          .string()
          .describe(
            'Keywords used to retrieve the location of the element. Should contain the element name and any other relevant information mentioned in the sentence'
          ),
        option: z.string().describe('The option to select')
      })
    }
  ),

  tool(
    async ({ duration }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'sleep', params: { duration } })
      return await actions.sleep(configurable.ref, { duration })
    },
    {
      name: 'Sleep',
      description: 'Call to wait for a certain amount of time',
      schema: z.object({
        duration: z.number().describe('The duration to wait in seconds')
      })
    }
  ),

  tool(
    async ({ enterFrame }, { configurable }) => {
      const { ref } = configurable as ToolConfig

      if (enterFrame) {
        const frames = await actions.getFrames(ref)
        const candidate = await ref.ai.getBestCandidate(ref.input, frames)
        if (ref.record)
          ref.recordings[ref.step].actions.push({ name: 'switchFrame', params: { frameNumber: candidate } })

        return await actions.switchFrame(ref, { frameNumber: candidate })
      }

      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'switchFrame', params: { frameNumber: undefined } })

      return await actions.switchFrame(ref, { frameNumber: undefined })
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
    async ({ text }, { configurable }) => {
      const { ref } = configurable as ToolConfig
      if (ref.record) ref.recordings[ref.step].actions.push({ name: 'waitForText', params: { text } })
      return await actions.waitForText(ref, { text })
    },
    {
      name: 'WaitForText',
      description: 'Call to wait for text to appear on the page',
      schema: z.object({
        text: z.string().describe('Text to wait for')
      })
    }
  )
] as unknown as DynamicStructuredTool[]
