import type Yargs from 'yargs'
import type { ObserveOptions } from '../types'

import { Observer, PlayWord } from '@playword/core'
import { config } from 'dotenv'
import { getBrowser, info } from '../utils'

export default {
  command: 'observe',

  describe: 'Start the PlayWord observer.',

  builder: async (yargs: typeof Yargs) => {
    return yargs
      .option('delay', {
        alias: 'd',
        describe: 'How long to wait before executing each action during the dry run process (ms)',
        default: 250
      })
      .option('env-file', {
        alias: 'e',
        describe: 'Which env file to use'
      })
      .option('verbose', {
        alias: 'v',
        describe: 'Whether to enable verbose mode'
      })
      .option('browser', {
        alias: 'b',
        describe: 'Which browser to use',
        choices: ['chromium', 'chrome', 'msedge', 'firefox', 'webkit'],
        default: 'chrome'
      })
      .option('record-path', {
        alias: 'r',
        describe: 'Where to save the recordings',
        default: '.playword/recordings.json'
      })
      .option('openai-options', {
        alias: 'o',
        describe: 'Additional OpenAI API options',
        type: 'array',
        coerce: (options: string[]) =>
          options.reduce(
            (acc, option) => {
              const [key, value] = option.split('=')
              if (key && value) acc[key] = value
              return acc
            },
            {} as Record<string, string>
          )
      })
      .check(({ recordPath }) => {
        if (typeof recordPath === 'string' && !recordPath.endsWith('.json')) {
          throw new Error('Recording file must be ended with .json')
        }
        return true
      })
      .example('$0 observe -b firefox', 'Use the Firefox browser')
      .example('$0 observe -d 500', 'Set the delay time to 500ms')
      .example('$0 observe -e .env.test', 'Use .env.test file')
      .example('$0 observe -v', 'Enable verbose mode')
      .example('$0 observe -r path/to/rec.json', 'Save the recordings to path/to/rec.json')
      .example('$0 observe -o apiKey=sk-... baseURL=https://...', 'Pass the OpenAI options')
      .version(false)
      .help()
  },

  handler: async ({
    browser = 'chrome',
    delay = 250,
    envFile = '.env',
    openaiOptions = {},
    recordPath = '.playword/recordings.json',
    verbose = false
  }: ObserveOptions) => {
    try {
      config({ path: envFile })

      info('Creating a new context for the browser: ' + browser)
      const br = await getBrowser(browser, false)
      const context = await br.newContext()
      const playword = new PlayWord(context, { debug: verbose, delay, openAIOptions: openaiOptions })
      const observer = new Observer(playword, { delay, recordPath })
      await observer.observe()
      await context.newPage()

      process.on('SIGINT', async () => {
        info('Observer stopped', 'green')
        await br.close()
      })
    } catch (error) {
      info(error.message, 'red')
      process.exit(1)
    }
  }
}
