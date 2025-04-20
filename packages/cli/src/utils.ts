import type { Recording } from './types'

import { existsSync, readFileSync } from 'fs'
import { chromium, firefox, webkit } from 'playwright-core'

/**
 * Get the browser instance based on the browser type.
 *
 * @param browserType The type of browser to use.
 * @param headed Whether to run the browser in headed mode.
 */
export const getBrowser = (browserType = 'chrome', headed = false) => {
  switch (browserType) {
    case 'chrome':
      return chromium.launch({ channel: 'chrome', headless: !headed })

    case 'chromium':
      return chromium.launch({ headless: !headed })

    case 'firefox':
      return firefox.launch({ headless: !headed })

    case 'msedge':
      return chromium.launch({ channel: 'msedge', headless: !headed })

    case 'webkit':
      return webkit.launch({ headless: !headed })

    default:
      throw new Error(`Invalid browser type: ${browserType}`)
  }
}

/**
 * Get the recordings from the specified path.
 *
 * @param path The path to the recordings file.
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

  if (color === 'none') {
    return console.log(message)
  }

  return console.log(`\x1b[${colorMap[color]}m${message}\x1b[0m`)
}
