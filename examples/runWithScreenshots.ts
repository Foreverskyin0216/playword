/**
 * This example demonstrates how to use screenshots to help AI understand the page.
 *
 * Run this example in this directory with the command `npx tsx with-screenshot-reference.example.ts`
 */
import { chromium } from 'playwright'
import PlayWord from '../src'

// Replace 'sk-...' with your OpenAI API key
const openAIOptions = { apiKey: 'sk-...' }

const run = async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  const playword = new PlayWord(page, { debug: true, openAIOptions, useScreenshot: true })

  await playword.say('Navigate to https://www.google.com')
  await playword.say('Input "Hello, World" in the search field')
  await playword.say('Press Enter')
  const result = await playword.say('Check if the page contains "HELLO WORLD"')

  console.log(result)

  await browser.close()
}

;(async () => await run())()
