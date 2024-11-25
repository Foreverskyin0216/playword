/**
 * This example demonstrates how to handle frames in a page.
 *
 * Run this example in this directory with the command `npx tsx handle-frames.example.ts`
 */
import { chromium } from 'playwright'
import PlayWord from '../src'

// Replace 'sk-...' with your OpenAI API key
const openAIOptions = { apiKey: 'sk-...' }

const run = async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  const playword = new PlayWord(page, { debug: true, openAIOptions })

  await playword.say('Go to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe')
  await playword.say('Switch to the frame contains the street map')
  await playword.say('Click the "zoom-in" button')
  await playword.say('Click the "zoom-out" button')
  await playword.say('Go back to the main page')

  await browser.close()
}

;(async () => await run())()
