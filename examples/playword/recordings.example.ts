/**
 * This example demonstrates how to record a series of actions and then replay them.
 *
 * You can use the command `npx tsx recordings.example.ts` to run this example.
 *
 * When setting the `record` option to `true`, it will record the actions performed on the page.
 * The default path for the recordings file is `.playword/recordings.json`.
 * You can also set a custom path to save the recordings. e.g. `record: 'path/to/recordings.json'`.
 * Upon recordings are saved, running the script again will replay the actions from the recordings file.
 */
import { chromium } from 'playwright'
import { PlayWord } from '../../src'

// Replace 'sk-...' with your OpenAI API key
process.env.OPENAI_API_KEY = 'sk-...'

const run = async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  const playword = new PlayWord(page, { record: true })

  await playword.say('Navigate to https://www.google.com')
  await playword.say('Input "Hello, World" in the search field')
  await playword.say('Press Enter')
  const result = await playword.say('Check if the page contains "HELLO WORLD"')

  console.log(result)

  await browser.close()
}

;(async () => await run())()
