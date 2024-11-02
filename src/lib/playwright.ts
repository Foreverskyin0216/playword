import { type ElementHandle, type Frame, type Page } from '@playwright/test'
import { type ScrollTarget, CDP } from './cdp'
import { sanitizeHtml } from '../utils/sanitization'

/**
 * A class used to perform actions on a page using the Playwright API.
 */
export class Playwright {
  cdp: CDP

  constructor() {
    this.cdp = new CDP()
  }

  // Actions using CDP
  public async clearCDPElement(page: Page) {
    await page.evaluate(() => delete (window as unknown as { [key: string]: Element })['$$CDP_TEMP_NODE'])
  }

  public async clickAndInputCDPElement(page: Page, params: { backendNodeId: number; value: string }) {
    const { cX, cY } = await this.cdp.getContentQuads(page, { backendNodeId: params.backendNodeId })
    await this.clickAndInputLocation(page, { x: cX, y: cY, value: params.value })
  }

  public async clickCDPElement(page: Page, params: { backendNodeId: number }) {
    const { cX, cY } = await this.cdp.getContentQuads(page, params)
    await this.clickLocation(page, { x: cX, y: cY })
  }

  public async getStoredCDPElement(page: Page) {
    const handle = await page.evaluateHandle(
      () => (window as unknown as { [key: string]: Element })['$$TEMP_NODE']
    )
    return handle.asElement()
  }

  public async hoverCDPElement(page: Page, params: { backendNodeId: number }) {
    const { cX, cY } = await this.cdp.getContentQuads(page, params)
    await this.hoverLocation(page, { x: cX, y: cY })
  }

  public async scrollCDPElement(page: Page, params: { backendNodeId: number; target: ScrollTarget }) {
    const element = await this.moveCDPElementToPlaywrightHandle(page, { backendNodeId: params.backendNodeId })
    await this.scrollElement({ element, target: params.target })
  }

  public async storeCDPElement(page: Page, params: { backendNodeId: number }) {
    await this.cdp.callFunctionOn(page, {
      backendNodeId: params.backendNodeId,
      functionDeclaration: 'function () { window.$$TEMP_NODE = this }'
    })
  }

  // Actions using Location
  public async clickAndInputLocation(page: Page, params: { x: number; y: number; value: string }) {
    const { element, isCustomElement, tagName } = await this.getElementAtLocation(page, params)
    if (!element || isCustomElement) {
      await this.hover(page, { x: params.x, y: params.y })
      await this.click(page, { x: params.x, y: params.y })
      await Promise.all([this.sendKeys(page, { keys: 'Control+A' }), this.sendKeys(page, { keys: 'Meta+A' })])
      await this.sendKeys(page, { keys: 'Backspace' })
      await this.input(page, params)
    } else if (tagName === 'SELECT') {
      await this.clickAndSelectOptionElement({ element, value: params.value })
    } else {
      await this.clickAndInputElement({ element, value: params.value })
    }
  }

  public async clickLocation(page: Page, params: { x: number; y: number }) {
    const { element, isCustomElement, tagName } = await this.getElementAtLocation(page, params)
    if (!element || isCustomElement || tagName === 'CANVAS') {
      await this.click(page, params)
    } else {
      await this.clickElement({ element })
    }
  }

  public async getElementAtLocation(
    ctx: Page | Frame | ElementHandle<ShadowRoot>,
    params: { x: number; y: number; isShadowRoot?: boolean }
  ): Promise<{
    element: ElementHandle<Element> | null
    isCustomElement: boolean
    tagName: string | null
  }> {
    const handle = params.isShadowRoot
      ? await (ctx as ElementHandle<ShadowRoot>).evaluateHandle(
          (e, { x, y }) => (Reflect.has(e, 'elementFromPoint') ? e.elementFromPoint(x, y) : null),
          params
        )
      : await (ctx as Page | Frame).evaluateHandle(({ x, y }) => document.elementFromPoint(x, y), params)

    const element = handle.asElement()
    if (!element) {
      return { element: null, tagName: null, isCustomElement: false }
    }

    const tagProperty = await element.getProperty('tagName')
    const tagName = tagProperty?.toString()
    const isCustomElement = tagName.includes('-')

    if (tagName === 'IFRAME') {
      const frame = await element.contentFrame()
      if (frame) {
        const boundingClientRect = await element.evaluate((node) => node.getBoundingClientRect())
        return await this.getElementAtLocation(frame, {
          x: params.x - boundingClientRect.x,
          y: params.y - boundingClientRect.y
        })
      }
    }

    if (isCustomElement) {
      const shadowRootHandle = await element.evaluateHandle((e) => e.shadowRoot)
      const shadowRoot = shadowRootHandle.asElement()
      if (shadowRoot) {
        return await this.getElementAtLocation(shadowRoot, {
          x: params.x,
          y: params.y,
          isShadowRoot: true
        })
      }
    }

    return { element, isCustomElement, tagName }
  }

  public async hoverLocation(page: Page, params: { x: number; y: number }) {
    const { element, tagName, isCustomElement } = await this.getElementAtLocation(page, params)
    if (!element || isCustomElement || tagName === 'CANVAS') {
      await this.hover(page, params)
    } else {
      await this.hoverElement({ element })
    }
  }

  // Actions using Element
  public async clickAndInputElement(params: { element: ElementHandle<Element>; value: string }) {
    await params.element.hover()
    await params.element.click()
    await params.element.fill(params.value)
  }

  public async clickAndSelectOptionElement(params: { element: ElementHandle<Element>; value: string }) {
    await params.element.hover()
    await params.element.click()
    await params.element.selectOption(params.value)
  }

  public async clickElement(params: { element: ElementHandle<Element> }) {
    await params.element.hover()
    await params.element.click()
  }

  public async hoverElement(params: { element: ElementHandle<Element> }) {
    await params.element.hover()
  }

  // Actions using Device
  public async click(page: Page, params: { x: number; y: number }) {
    await page.mouse.move(params.x, params.y)
    await page.mouse.click(params.x, params.y)
  }

  public async goTo(page: Page, params: { url: string }) {
    await page.goto(params.url)
  }

  public async hover(page: Page, params: { x: number; y: number }) {
    await page.mouse.move(params.x, params.y)
  }

  public async input(page: Page, params: { x: number; y: number; value: string }) {
    await page.keyboard.type(params.value)
  }

  public async sendKeys(page: Page, params: { keys: string }) {
    await page.keyboard.press(params.keys)
  }

  // Actions using Script
  public async getSnapshot(page: Page) {
    const [screenshot, snapshot, layoutMetrics, viewport] = await Promise.all([
      page.screenshot({ scale: 'css' }).then((b) => b.toString('base64')),
      this.cdp.getSnapshot(page).then((r) => JSON.stringify(r)),
      this.cdp.getLayoutMetrics(page),
      this.getViewportMetadata(page)
    ])
    const { pixelRatio, viewportHeight, viewportWidth } = viewport

    return {
      screenshot,
      snapshot: sanitizeHtml(snapshot),
      layoutMetrics,
      pixelRatio,
      viewportHeight,
      viewportWidth
    }
  }

  public async getViewportMetadata(page: Page) {
    return page.evaluate(() => ({
      pixelRatio: window.devicePixelRatio,
      viewportWidth: window.visualViewport?.width || 0,
      viewportHeight: window.visualViewport?.height || 0
    }))
  }

  public async moveCDPElementToPlaywrightHandle(page: Page, params: { backendNodeId: number }) {
    await this.storeCDPElement(page, params)
    const element = await this.getStoredCDPElement(page)
    await this.clearCDPElement(page)
    return element
  }

  public async scrollElement(params: { element: ElementHandle<Element>; target: ScrollTarget }) {
    await params.element.evaluate((element, { target }) => {
      const height = element.clientHeight ?? 720
      const relativeScrollDistance = 0.75 * height

      switch (target) {
        case 'top':
          return element.scrollTo({ top: 0 })
        case 'bottom':
          return element.scrollTo({ top: element.scrollHeight })
        case 'up':
          return element.scrollBy({ top: -relativeScrollDistance })
        case 'down':
          return element.scrollBy({ top: relativeScrollDistance })
        default:
          throw Error(`Unsupported scroll target ${target}`)
      }
    }, params)
  }

  public async scrollPage(page: Page, params: { target: ScrollTarget }) {
    await page.evaluate(({ target }) => {
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
    }, params)
  }
}
