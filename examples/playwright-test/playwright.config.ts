import { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  testDir: './',
  workers: 1,
  retries: 1,
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium', headless: false }
    }
  ]
}

export default config
