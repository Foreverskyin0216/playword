import type Yargs from 'yargs'
import type { TestOptions } from './types'

import confirm from '@inquirer/confirm'
import input from '@inquirer/input'
import { PlayWord } from '@playword/core'
import { config as envConfig } from 'dotenv'
import { info } from './logger'
import { getBrowser, getRecordings, runPlayWord } from './utils'

export default {
  command: 'test',

  describe: 'Run a PlayWord test step by step',

  builder: async (yargs: typeof Yargs) =>
    yargs
      .option('headed', {
        alias: 'h',
        describe: 'Whether to enable headed mode'
      })
      .option('env-file', {
        alias: 'e',
        describe: 'Which env file to use'
      })
      .option('record', {
        alias: 'r',
        describe: 'Whether to enable recording.'
      })
      .option('playback', {
        alias: 'p',
        describe: 'Playback the specified recording file. Should be used with --record.'
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
      .option('verbosity', {
        alias: 'v',
        describe: 'Verbosity level. 0 = silent, 1 = normal, 2 = debug',
        choices: [0, 1, 2],
        default: 1
      })
      .option('openai-options', {
        alias: 'o',
        describe: 'Options to pass to OpenAI API',
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
      .check((argv) => {
        const record = argv.record as string | boolean
        if (record && typeof record === 'string' && !record.endsWith('.json')) {
          throw new Error('Recording file must be ended with .json')
        }
        return true
      })
      .example('npx @playword/cli test -b firefox', 'Use Firefox browser')
      .example('npx @playword/cli test -h', 'Enable headed mode')
      .example('npx @playword/cli test -e .env.test', 'Use .env.test file')
      .example('npx @playword/cli test -v 2', 'Enable debug mode')
      .example('npx @playword/cli test -s', 'Enable screenshot reference')
      .example('npx @playword/cli test -r', 'Save recordings to .playword/recordings.json as default')
      .example('npx @playword/cli test -r path/to/rec.json', 'Save recordings to path/to/rec.json')
      .example('npx @playword/cli test -r -p', 'Replay the recordings')
      .example('npx @playword/cli test -o apiKey=sk-... baseURL=https://...', 'Pass OpenAI options')
      .version(false)
      .help()
      .hide('help'),

  handler: async (argv: TestOptions) => {
    try {
      envConfig({ path: argv.envFile || '.env' })
      const recordings = getRecordings(argv.record)

      if (argv.verbosity > 0) info('Opening browser: ' + argv.browser)
      const browser = await getBrowser(argv.browser, !argv.headed)
      const playword = new PlayWord(await browser.newPage(), {
        debug: argv.verbosity > 1,
        openAIOptions: argv.openAIOptions,
        record: argv.record,
        retryOnFailure: Boolean(argv.record),
        useScreenshot: argv.useScreenshot
      })

      if (recordings && argv.playback)
        for (const { input } of recordings) {
          await runPlayWord(playword, input)
        }
      else
        do {
          await runPlayWord(playword, await input({ message: 'What do you want to do?' }))
        } while (await confirm({ message: 'Continue to next step?' }))

      if (argv.verbosity > 0) info('Closing browser')
      await browser.close()
      if (argv.verbosity > 0 && argv.record) info('Recordings saved', 'green')
      process.exit(0)
    } catch (error) {
      console.error(error.message)
      process.exit(1)
    }
  }
}
