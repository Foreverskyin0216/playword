/**
 * This example demonstrates how to use the PlayWord with custom endpoint.
 *
 * You can use the command `npx tsx playword.example.ts` to run this example.
 */
import { chromium } from 'playwright'
import { PlayWord } from '../../src'

// Replace apiKey and baseURL with your own OpenAI API key and endpoint.
const openAIOptions = { apiKey: '<OPENAI_API_KEY>', baseURL: 'https://<ENDPOINT>' }

const run = async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  const playword = new PlayWord(page, { openAIOptions })

  await playword.say('Navigate to https://www.google.com')
  await playword.say('Input "Hello, World" in the search field')
  await playword.say('Press Enter')
  const result = await playword.say('Check if the page contains "HELLO WORLD"')

  console.log(result)

  await browser.close()
}

;(async () => await run())()
