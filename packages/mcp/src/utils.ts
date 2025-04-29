import type { LaunchOptions } from 'playwright-core'

import { chromium, firefox, webkit } from 'playwright-core'

/**
 * Get a browser instance based on the specified type and launch options.
 *
 * @param browserType The type of browser to use.
 * @param options The launch options for the browser.
 */
export const getBrowser = (browserType: string = 'chrome', options: LaunchOptions = { headless: false }) => {
  switch (browserType) {
    case 'chrome':
      return chromium.launch({ ...options, channel: 'chrome' })

    case 'chromium':
      return chromium.launch({ ...options, channel: 'chromium' })

    case 'firefox':
      return firefox.launch({ ...options })

    case 'msedge':
      return chromium.launch({ ...options, channel: 'msedge' })

    case 'webkit':
      return webkit.launch({ ...options })

    default:
      throw new Error(`Invalid browser type: ${browserType}`)
  }
}
