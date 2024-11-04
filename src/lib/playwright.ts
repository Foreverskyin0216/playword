import type { Locator, Page } from '@playwright/test'
import type { Browser, BrowserType, LaunchOptions } from 'playwright'

/**
 * Supported scroll targets for the scrollElement method.
 */
type ScrollTarget = 'top' | 'bottom' | 'up' | 'down'

/**
 * A class used to perform actions on a page using the Playwright API.
 */
export class Playwright {
  constructor(
    private browser: Browser,
    private page: Page
  ) {}

  static async from({ launch }: BrowserType, options?: LaunchOptions) {
    const browser = await launch(options)
    const page = await browser.newPage()
    return new Playwright(browser, page)
  }

  // Browser actions
  public async close() {
    await this.browser.close()
  }

  // Page actions
  public getPage() {
    return this.page
  }

  public async getSnapshot() {
    return this.page.content()
  }

  public async navigate(url: string) {
    return this.page.goto(url)
  }

  public async pressKeys(keys: string) {
    await this.page.keyboard.press(keys)
  }

  public async scrollPage(scrollTarget: ScrollTarget) {
    return this.page.evaluate((target) => {
      const viewportHeight = window.visualViewport?.height ?? 720
      const relativeScrollDistance = 0.75 * viewportHeight
      const elementToScroll = document.scrollingElement || document.body

      switch (target) {
        case 'top':
          return elementToScroll.scrollTo({ top: 0 })

        case 'bottom':
          return elementToScroll.scrollTo({ top: elementToScroll.scrollHeight })

        case 'up':
          return elementToScroll.scrollBy({ top: -relativeScrollDistance })

        case 'down':
          return elementToScroll.scrollBy({ top: relativeScrollDistance })

        default:
          throw Error(`Unsupported scroll target ${target}`)
      }
    }, scrollTarget)
  }

  // Element actions
  public async click(locator: Locator | string) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator
    await element.hover()
    await element.click()
  }

  public async hover(locator: Locator | string) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator
    await element.hover()
  }

  public async inputText(locator: Locator | string, value: string) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator
    await element.hover()
    await element.click()
    await element.fill(value)
  }

  public async isEnabled(locator: Locator | string) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator
    return element.isEnabled()
  }

  public async isVisible(locator: Locator | string) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator
    return element.isVisible()
  }

  public async scrollElement(locator: Locator | string, scrollTarget: ScrollTarget) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator

    return element.evaluate((elem, target) => {
      const height = elem.clientHeight ?? 720
      const relativeScrollDistance = 0.75 * height

      switch (target) {
        case 'top':
          return elem.scrollTo({ top: 0 })

        case 'bottom':
          return elem.scrollTo({ top: elem.scrollHeight })

        case 'up':
          return elem.scrollBy({ top: -relativeScrollDistance })

        case 'down':
          return elem.scrollBy({ top: relativeScrollDistance })

        default:
          throw Error(`Unsupported scroll target ${target}`)
      }
    }, scrollTarget)
  }

  public async select(locator: Locator | string, value: string) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator
    await element.hover()
    await element.click()
    await element.selectOption(value)
  }
}
