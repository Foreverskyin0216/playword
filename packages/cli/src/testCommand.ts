import type Yargs from 'yargs'
import type { Recording, TestOptions } from './types'

import confirm from '@inquirer/confirm'
import input from '@inquirer/input'
import { PlayWord } from '@playword/core'
import { config as dotenvConfig } from 'dotenv'
import { info } from './logger'
import { getBrowser, getRecordings, runPlayWord } from './utils'

export default {
  command: 'test',

  describe: 'Run a PlayWord test step by step',

  builder: async (yargs: typeof Yargs) => {
    return yargs
      .option('headed', {
        alias: 'h',
        describe: 'Whether to open the browser in headed mode'
      })
      .option('env-file', {
        alias: 'e',
        describe: 'Which env file to use'
      })
      .option('record', {
        alias: 'r',
        describe: 'Whether to record the test steps'
      })
      .option('playback', {
        alias: 'p',
        describe: 'Whether to playback the test steps from a recording file'
      })
      .option('use-screenshot', {
        alias: 's',
        describe: 'Whether to enable screenshot reference'
      })
      .option('browser', {
        alias: 'b',
        describe: 'Which browser to use',
        choices: ['chromium', 'chrome', 'msedge', 'firefox', 'webkit'],
        default: 'chrome'
      })
      .option('verbose', {
        alias: 'v',
        describe: 'Whether to enable verbose mode'
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
      .check(({ record }) => {
        if (typeof record === 'string' && !record.endsWith('.json')) {
          throw new Error('Recording file must be ended with .json')
        }
        return true
      })
      .example('$0 test -b firefox', 'Use Firefox browser')
      .example('$0 test -h', 'Enable headed mode')
      .example('$0 test -e .env.test', 'Use .env.test file')
      .example('$0 test -v', 'Enable verbose mode')
      .example('$0 test -s', 'Enable screenshot reference')
      .example('$0 test -r', 'Save recordings to .playword/recordings.json as default')
      .example('$0 test -r path/to/rec.json', 'Save recordings to path/to/rec.json')
      .example('$0 test -r -p', 'Replay the recordings')
      .example('$0 test -o apiKey=sk-... baseURL=https://...', 'Pass OpenAI options')
      .version(false)
      .help()
  },

  handler: async (argv: TestOptions) => {
    try {
      dotenvConfig({ path: argv.envFile || '.env' })

      const record = typeof argv.record === 'string' ? argv.record : '.playword/recordings.json'
      const recordings: Recording[] = argv.record ? getRecordings(record) : []

      info('Opening browser: ' + argv.browser)
      const browser = await getBrowser(argv.browser, !argv.headed)
      const playword = new PlayWord(await browser.newPage(), {
        debug: argv.verbose,
        openAIOptions: argv.openaiOptions,
        record: argv.record,
        retryOnFailure: true,
        useScreenshot: argv.useScreenshot
      })

      if (recordings.length && argv.playback) for (const rec of recordings) await runPlayWord(playword, rec.input)
      else
        do await runPlayWord(playword, await input({ message: 'What do you want to do?' }))
        while (await confirm({ message: 'Continue to next step?' }))

      info('Closing browser')
      await browser.close()

      if (argv.record) info('Saved recordings to ' + record)
      info('Test completed', 'green')

      process.exit(0)
    } catch (error) {
      info(error.message, 'red')
      process.exit(1)
    }
  }
}
