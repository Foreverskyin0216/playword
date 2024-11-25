/**
 * This example demonstrates how to use the PlayWord with a custom OpenAI endpoint.
 *
 * Run this example in this directory with the command `npx tsx use-custom-endpoint.example.ts`
 */
import { chromium } from 'playwright'
import PlayWord from '../src'

// Replace apiKey and baseURL with a custom API key and endpoint.
const openAIOptions = { apiKey: 'custom-api-key', baseURL: 'custom-endpoint' }

const run = async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  const playword = new PlayWord(page, { debug: true, openAIOptions })

  await playword.say('Navigate to https://www.google.com')
  await playword.say('Input "Hello, World" in the search field')
  await playword.say('Press Enter')
  const result = await playword.say('Check if the page contains "HELLO WORLD"')

  console.log(result)

  await browser.close()
}

;(async () => await run())()
