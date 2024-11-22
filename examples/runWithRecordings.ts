/**
 * This example demonstrates how to record a series of actions and then replay them.
 *
 * Run this example in this directory with the command `npx tsx use-recordings.example.ts`
 */
import { chromium } from 'playwright'
import PlayWord from '../src'

// Replace 'sk-...' with your OpenAI API key
const openAIOptions = { apiKey: 'sk-...' }

const run = async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  const playword = new PlayWord(page, { debug: true, openAIOptions, record: true })

  await playword.say('Navigate to https://www.google.com')
  await playword.say('Input "Hello, World" in the search field')
  await playword.say('Press Enter')
  const result = await playword.say('Check if the page contains "HELLO WORLD"')

  console.log(result)

  await browser.close()
}

;(async () => await run())()
