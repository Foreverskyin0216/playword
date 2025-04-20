import type { Browser } from 'playwright-core'
import type { ContextInterface, ContextOptions } from './types'

import { PlayWord } from '@playword/core'
import { getBrowser } from './utils'

/** MCP context that manages the browser and PlayWord instance. */
export class Context implements ContextInterface {
  /** Browser instance used in the context. */
  private browser?: Browser

  /** Options for the Playwright context. */
  private contextOptions: ContextOptions

  /** The PlayWord instance */
  private playword?: PlayWord

  constructor(contextOptions: ContextOptions = {}) {
    this.contextOptions = { browserType: 'chrome', launchOptions: { headless: false }, ...contextOptions }
    this.createPlayWord = this.createPlayWord.bind(this)
    this.close = this.close.bind(this)
    this.getPlayWord = this.getPlayWord.bind(this)
  }

  public async close() {
    await this.playword?.page?.close()
    await this.playword?.context?.close()
    await this.browser?.close()
    this.browser = undefined
    this.playword = undefined
  }

  public async createPlayWord() {
    if (!this.browser) {
      this.browser = await getBrowser(this.contextOptions.browserType, this.contextOptions.launchOptions)
    }

    const context = await this.browser.newContext(this.contextOptions.browserContextOptions)
    this.playword = new PlayWord(context, this.contextOptions.playwordOptions)

    return this.playword
  }

  public getPlayWord() {
    return this.playword
  }
}
