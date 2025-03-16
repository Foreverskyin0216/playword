import type { DynamicStructuredTool } from '@langchain/core/tools'

import { tool } from '@langchain/core/tools'
import { z } from 'zod'

/**
 * The classifier is a collection of tools that are used to classify the intent of the user input
 * and invoke the corresponding tool to generate the correct action.
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
 * - Click
 * - Hover
 * - Input
 * - GoTo
 * - Scroll
 * - Select
 * - Sleep
 * - WaitForText
 */
export const classifier = [
  tool(
    async ({ text }, { configurable }) =>
      JSON.stringify({
        name: 'assertElementContains',
        params: { ...configurable.action.params, text }
      }),
    {
      name: 'AssertElementContains',
      description: 'Call to verify that an element contains specific text',
      schema: z.object({ text: z.string().describe('The text to verify') })
    }
  ),

  tool(
    async ({ text }, { configurable }) =>
      JSON.stringify({
        name: 'assertElementNotContain',
        params: { ...configurable.action.params, text }
      }),
    {
      name: 'AssertElementNotContain',
      description: 'Call to verify that an element does not contain specific text',
      schema: z.object({ text: z.string().describe('The text to verify') })
    }
  ),

  tool(
    async ({ text }, { configurable }) =>
      JSON.stringify({
        name: 'assertElementContentEquals',
        params: { ...configurable.action.params, text }
      }),
    {
      name: 'AssertElementContentEquals',
      description: 'Call to verify that an element has specific text',
      schema: z.object({ text: z.string().describe('The text to verify') })
    }
  ),

  tool(
    async ({ text }, { configurable }) =>
      JSON.stringify({
        name: 'assertElementContentNotEqual',
        params: { ...configurable.action.params, text }
      }),
    {
      name: 'AssertElementContentNotEqual',
      description: 'Call to verify that an element does not have specific text',
      schema: z.object({ text: z.string().describe('The text to verify') })
    }
  ),

  tool(
    async (_, { configurable }) => JSON.stringify({ name: 'assertElementVisible', params: configurable.action.params }),
    {
      name: 'AssertElementVisible',
      description: 'Call to verify that an element is visible'
    }
  ),

  tool(
    async (_, { configurable }) =>
      JSON.stringify({ name: 'assertElementNotVisible', params: configurable.action.params }),
    {
      name: 'AssertElementNotVisible',
      description: 'Call to verify that an element is not visible'
    }
  ),

  tool(async ({ text }) => JSON.stringify({ name: 'assertPageContains', params: { text } }), {
    name: 'AssertPageContains',
    description: 'Call to verify that the page contains specific text',
    schema: z.object({ text: z.string().describe('The text to verify') })
  }),

  tool(async ({ text }) => JSON.stringify({ name: 'assertPageNotContain', params: { text } }), {
    name: 'AssertPageNotContain',
    description: 'Call to verify that the page does not contain specific text',
    schema: z.object({ text: z.string().describe('The text to verify') })
  }),

  tool(async ({ text }) => JSON.stringify({ name: 'assertPageTitleEquals', params: { text } }), {
    name: 'AssertPageTitleEquals',
    description: 'Call to verify that the page title equals specific text',
    schema: z.object({ text: z.string().describe('The text to verify') })
  }),

  tool(async ({ pattern }) => JSON.stringify({ name: 'assertPageUrlMatches', params: { pattern } }), {
    name: 'AssertPageUrlMatches',
    description: 'Call to verify that the page URL matches a specific pattern',
    schema: z.object({ pattern: z.string().describe('The pattern to match') })
  }),

  tool(async (_, { configurable }) => JSON.stringify({ name: 'click', params: configurable.action.params }), {
    name: 'Click',
    description: 'Call to handle the click event'
  }),

  tool(async ({ url }) => JSON.stringify({ name: 'goto', params: { url } }), {
    name: 'GoTo',
    description: 'Call to handle the navigation event',
    schema: z.object({ url: z.string().describe('The URL to navigate to') })
  }),

  tool(
    async ({ duration }, { configurable }) =>
      JSON.stringify({ name: 'hover', params: { ...configurable.action.params, duration } }),
    {
      name: 'Hover',
      description: 'Call to handle the hover event',
      schema: z.object({ duration: z.number().describe('How long the hover event should last. Default is 1000ms') })
    }
  ),

  tool(
    async ({ text }, { configurable }) =>
      JSON.stringify({ name: 'input', params: { text, ...configurable.action.params } }),
    {
      name: 'Input',
      description: 'Call to handle the input event',
      schema: z.object({ text: z.string().describe('The text to input') })
    }
  ),

  tool(
    async ({ direction }, { configurable }) =>
      JSON.stringify({
        name: 'scroll',
        params: { ...configurable.action.params, direction }
      }),
    {
      name: 'Scroll',
      description: 'Call to handle the scroll event',
      schema: z.object({ direction: z.enum(['up', 'down', 'top', 'bottom']).describe('The direction to scroll') })
    }
  ),

  tool(
    async ({ option }, { configurable }) =>
      JSON.stringify({ name: 'select', params: { option, ...configurable.action.params } }),
    {
      name: 'Select',
      description: 'Call to handle the select event',
      schema: z.object({ option: z.string().describe('The option to select') })
    }
  ),

  tool(async ({ duration }) => JSON.stringify({ name: 'sleep', params: { duration } }), {
    name: 'Sleep',
    description: 'Call to handle the sleep event',
    schema: z.object({ duration: z.number().describe('The duration to sleep in milliseconds') })
  }),

  tool(async ({ text }) => JSON.stringify({ name: 'waitForText', params: { text } }), {
    name: 'WaitForText',
    description: 'Call to handle the wait for text event',
    schema: z.object({ text: z.string().describe('The text to wait for') })
  })
] as unknown as DynamicStructuredTool[]
