import type { PlayWord } from '@playword/core'
import type { Recording } from './types'

import { existsSync, readFileSync } from 'fs'
import { chromium, firefox, webkit } from 'playwright-core'

/**
 * Get the browser instance based on the browser type.
 *
 * @param browserType The type of browser to use.
 * @param headless Whether to run the browser in headless mode.
 *
 * @returns The browser instance.
 */
export const getBrowser = (browserType = 'chrome', headless = true) => {
  switch (browserType) {
    case 'chromium':
      return chromium.launch({ headless })

    case 'chrome':
      return chromium.launch({ channel: 'chrome', headless })

    case 'msedge':
      return chromium.launch({ channel: 'msedge', headless })

    case 'firefox':
      return firefox.launch({ headless })

    case 'webkit':
      return webkit.launch({ headless })

    default:
      throw new Error(`Invalid browser type: ${browserType}`)
  }
}

/**
 * Get the recordings from the specified path.
 *
 * @param path The path to the recordings file.
 *
 * @returns If the file exists, return the recordings; otherwise, return an empty array.
 */
export const getRecordings = (path: string): Recording[] => {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf-8')) : []
}

/**
 * Print an information message.
 *
 * @param message The message to print.
 * @param color The color of the message.
 */
export const info = (message: string, color: 'green' | 'magenta' | 'red' | 'none' = 'none') => {
  const colorMap = { green: 32, magenta: 35, red: 31 }

  if (color === 'none') console.log(message)
  else console.log(`\x1b[${colorMap[color]}m${message}\x1b[0m`)
}

/**
 * Run the PlayWord's `say` method with the provided input.
 *
 * @param playword The PlayWord instance.
 * @param message The message to pass to the `say` method.
 */
export const runPlayWord = async (playword: PlayWord, message: string) => {
  const result = await playword.say(message)
  if (typeof result === 'boolean') {
    process.stdout.write('Assert: ')
    info(result ? 'PASS' : 'FAIL', result ? 'green' : 'red')
  }
}
