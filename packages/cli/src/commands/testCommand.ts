import type Yargs from 'yargs'
import type { Recording, TestOptions } from '../types'

import confirm from '@inquirer/confirm'
import input from '@inquirer/input'
import { PlayWord } from '@playword/core'
import { config } from 'dotenv'
import { getBrowser, getRecordings, info } from '../utils'

export default {
  command: 'test',

  describe: 'Run a PlayWord test step by step',

  builder: async (yargs: typeof Yargs) => {
    return yargs
      .option('headed', {
        alias: 'h',
        describe: 'Whether to open the browser in headed mode'
      })
      .option('delay', {
        alias: 'd',
        describe: 'How long to wait before executing each action during the playback (ms)',
        default: 250
      })
      .option('env-file', {
        alias: 'e',
        describe: 'Which env file to use',
        default: '.env'
      })
      .option('record', {
        alias: 'r',
        describe: 'Whether to record the test steps'
      })
      .option('playback', {
        alias: 'p',
        describe: 'Whether to playback the test steps from a recording file'
      })
      .option('browser', {
        alias: 'b',
        describe: 'Which browser to use',
        choices: ['chrome', 'chromium', 'firefox', 'msedge', 'webkit'],
        default: 'chrome'
      })
      .option('verbose', {
        alias: 'v',
        describe: 'Whether to enable verbose mode'
      })
      .option('ai-options', {
        alias: 'o',
        describe: 'Additional AI options',
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
      .check(({ record }) => {
        if (typeof record === 'string' && !record.endsWith('.json')) {
          throw new Error('Recording file must be ended with .json')
        }
        return true
      })
      .example('$0 test -b firefox', 'Use the Firefox browser')
      .example('$0 test -d 500', 'Set the delay time to 500ms')
      .example('$0 test -h', 'Enable headed mode')
      .example('$0 test -e .env.test', 'Use .env.test file')
      .example('$0 test -v', 'Enable verbose mode')
      .example('$0 test -r', 'Save the recordings to .playword/recordings.json as default')
      .example('$0 test -r path/to/rec.json', 'Save the recordings to path/to/rec.json')
      .example('$0 test -r -p', 'Replay the recordings')
      .example('$0 test -o googleApiKey=sk...', 'Set options for Google AI')
      .example('$0 test -o openAIApiKey=sk... baseURL=https://...', 'Set options for self-hosted OpenAI')
      .example('$0 test -o anthropicApiKey=sk... voyageAIApiKey=pa...', 'Set options for Anthropic and VoyageAI')
      .version(false)
      .help()
  },

  handler: async ({
    aiOptions = {},
    browser = 'chrome',
    delay = 250,
    envFile = '.env',
    headed = false,
    playback = false,
    record = false,
    verbose = false
  }: TestOptions) => {
    try {
      config({ path: envFile })

      const recordPath = typeof record === 'string' ? record : '.playword/recordings.json'
      const recordings: Recording[] = record ? getRecordings(recordPath) : []

      info('Creating a new context for the browser: ' + browser)
      const br = await getBrowser(browser, headed)
      const context = await br.newContext()
      const playword = new PlayWord(context, { aiOptions, debug: verbose, delay, record })

      if (playback && recordings.length) for (const { input } of recordings) await playword.say(input)
      else
        do await playword.say(await input({ message: 'What do you want to do?' }))
        while (await confirm({ message: 'Continue to next step?' }))

      if (record) {
        info('Saved recordings to ' + recordPath)
      }
      info('Test completed', 'green')

      await br.close()

      process.exit(0)
    } catch (error) {
      info(error.message, 'red')
      process.exit(1)
    }
  }
}
