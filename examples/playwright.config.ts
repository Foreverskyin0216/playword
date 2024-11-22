/**
 * This is the Playwright configuration file for the examples.
 * It is used to run the examples in this directory.
 */
import { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  testDir: './',
  reporter: 'null',
  workers: 1,
  retries: 1,
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium', headless: true }
    }
  ]
}

export default config
