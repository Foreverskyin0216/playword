/**
 * This example demonstrates how to use the PlayWord class to interact with a browser.
 *
 * You can use the command `npx tsx playword.example.ts` to run this example.
 */
import { chromium } from 'playwright'
import { PlayWord } from '../../src'

// Replace 'sk-...' with your OpenAI API key
process.env.OPENAI_API_KEY = 'sk-...'

const run = async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  const playword = new PlayWord(page)

  await playword.say('Navigate to https://www.google.com')
  await playword.say('Input "Hello, World" in the search field')
  await playword.say('Press Enter')
  const result = await playword.say('Check if the page contains "HELLO WORLD"')

  console.log(result)

  await browser.close()
}

;(async () => await run())()
