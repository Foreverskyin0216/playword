import { chromium } from 'playwright'
import { PlayWord } from '../src'

// Replace 'sk-...' with your OpenAI API key
process.env.OPENAI_API_KEY = 'sk-...'

const run = async () => {
  const browser = await chromium.launch({ headless: false })
  const player = new PlayWord(await browser.newPage())

  await player.say('Navigate to https://www.google.com')
  await player.say('Click the "Gamil" link')
  const result = await player.say('Check if the page contains "Sign in"')

  console.log(result)

  await browser.close()
}

;(async () => await run())()
