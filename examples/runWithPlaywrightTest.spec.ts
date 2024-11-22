/**
 * This example demonstrates how to use PlayWord in a Playwright test.
 *
 * Run this example in this directory with the command `npx playwright test`
 */
import { test, expect } from '@playwright/test'
import PlayWord from '../src'

// Replace 'sk-...' with your OpenAI API key
const openAIOptions = { apiKey: 'sk-...' }

test('An example of using PlayWord in a Playwright test', async ({ page }) => {
  const playword = new PlayWord(page, { debug: true, openAIOptions })

  await playword.say('Navigate to https://www.google.com')
  await playword.say('Input "Hello, World" in the search field')
  await playword.say('Press Enter')
  const result = await playword.say('Check if the page contains "HELLO WORLD"')

  expect(result).toBe(true)
})
