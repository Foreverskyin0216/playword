import type { PlayWord } from '@playword/core'
import type { Recording } from './types'

import { existsSync, readFileSync } from 'fs'
import { chromium, firefox, webkit } from 'playwright-core'
import { info } from './logger'

export const getBrowser = (browserType: string, headless = true) => {
  switch (browserType) {
    case 'chromium':
      return chromium.launch({ headless, slowMo: 100 })
    case 'chrome':
      return chromium.launch({ channel: 'chrome', headless, slowMo: 100 })
    case 'msedge':
      return chromium.launch({ channel: 'msedge', headless, slowMo: 100 })
    case 'firefox':
      return firefox.launch({ headless, slowMo: 100 })
    case 'webkit':
      return webkit.launch({ headless, slowMo: 100 })
    default:
      throw new Error(`Invalid browser type: ${browserType}`)
  }
}

export const getRecordings = (path: string): Recording[] => {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf-8')) : []
}

export const runPlayWord = async (playword: PlayWord, input: string) => {
  const result = await playword.say(input)
  if (typeof result === 'boolean') {
    process.stdout.write('Assert: ')
    info(result ? 'PASS' : 'FAIL', result ? 'green' : 'red')
  }
}
