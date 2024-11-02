import { type CDPSession, type Page } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'

/**
 * Supported scroll targets for the scrollElement method.
 */
export type ScrollTarget = 'top' | 'bottom' | 'up' | 'down'

/**
 * A unique key to identify elements in the CDP.
 */
export const CDP_ELEMENT_KEY = `cdp-element-${uuidV4()}`

/**
 * Get an instance of the CDPSession for a given page.
 */
export class CDP {
  sessionMap: Map<Page, CDPSession>

  constructor() {
    this.sessionMap = new Map()
  }

  public async callFunctionOn(page: Page, params: { backendNodeId: number; functionDeclaration: string }) {
    const session = await this.getSession(page)
    const { object } = await session.send('DOM.resolveNode', { backendNodeId: params.backendNodeId })
    const { result } = await session.send('Runtime.callFunctionOn', {
      functionDeclaration: params.functionDeclaration,
      objectId: object.objectId
    })
    return result.value
  }

  public async clearElement(page: Page, params: { backendNodeId: number }) {
    await this.callFunctionOn(page, {
      backendNodeId: params.backendNodeId,
      functionDeclaration: 'function () { this.value = "" }'
    })
  }

  public async clickElement(page: Page, params: { backendNodeId: number }) {
    const session = await this.getSession(page)
    const { cX, cY } = await this.getContentQuads(page, params)

    await session.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: cX,
      y: cY,
      button: 'left',
      clickCount: 1,
      buttons: 1
    })

    await session.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: cX,
      y: cY,
      button: 'left',
      clickCount: 1,
      buttons: 1
    })
  }

  public async executeScript(page: Page, params: { script: string; args: unknown[] }) {
    const functionArgs = params.args.map((arg) => {
      const type = typeof arg

      if (['boolean', 'number', 'string'].includes(type)) {
        return { value: arg }
      }

      if (type === 'object' && arg && Reflect.has(arg, CDP_ELEMENT_KEY)) {
        return { objectId: (arg as { [key: string]: string })[CDP_ELEMENT_KEY] }
      }

      return { value: undefined }
    })

    const session = await this.getSession(page)
    await session.send('Runtime.enable')
    const window = await session.send('Runtime.evaluate', { expression: 'window' })
    const call = await session.send('Runtime.callFunctionOn', {
      functionDeclaration: `function() { ${params.script} }`,
      arguments: functionArgs,
      objectId: window.result.objectId
    })

    switch (call.result.className) {
      case 'HTMLHtmlElement': {
        return { [CDP_ELEMENT_KEY]: call.result.objectId }
      }

      case 'NodeList': {
        const properties = await session.send('Runtime.getProperties', {
          objectId: call.result.objectId!,
          ownProperties: true
        })
        const validProperties = properties.result.filter(({ name }) => !isNaN(parseInt(name)))
        return validProperties.map(({ value }) => ({ [CDP_ELEMENT_KEY]: value?.objectId }))
      }

      default: {
        const { result } = await session.send('Runtime.callFunctionOn', {
          functionDeclaration: `function() { ${params.script} }`,
          arguments: functionArgs,
          objectId: window.result.objectId,
          returnByValue: true
        })
        return result.value
      }
    }
  }

  public async findElements(page: Page, params: { selector: string }) {
    const session = await this.getSession(page)
    const { root } = await session.send('DOM.getDocument', { depth: -1 })
    const { nodeIds } = await session.send('DOM.querySelectorAll', {
      nodeId: root.nodeId,
      selector: params.selector
    })

    const nodes = await Promise.all(nodeIds.map((nodeId) => session.send('DOM.resolveNode', { nodeId })))

    return nodes.map((node) => ({ [CDP_ELEMENT_KEY]: node.object.objectId }))
  }

  public async focusElement(page: Page, params: { backendNodeId: number }) {
    const session = await this.getSession(page)
    await session.send('DOM.focus', params)
  }

  public async getAttribute(page: Page, params: { name: string; objectId: string }) {
    const session = await this.getSession(page)
    const { nodeId } = await session.send('DOM.requestNode', { objectId: params.objectId })
    const { attributes } = await session.send('DOM.getAttributes', { nodeId })
    return attributes.find((attr) => attr === params.name)
  }

  public async getContentQuads(page: Page, params: { backendNodeId: number }) {
    const session = await this.getSession(page)
    const { quads } = await session.send('DOM.getContentQuads', params)

    const [tlX, tlY, trX, trY, brX, brY, blX, blY] = quads[0]

    const width = trX - tlX
    const height = brY - trY
    const cX = tlX + width / 2
    const cY = trY + height / 2

    return { tlX, tlY, trX, trY, blX, blY, brX, brY, width, height, cX, cY }
  }

  public async getCurrentURL(page: Page) {
    const session = await this.getSession(page)
    const pages = await session.send('Page.getNavigationHistory')
    return pages.entries[pages.currentIndex].url
  }

  public async getElementRect(page: Page, params: { backendNodeId: number }) {
    return this.callFunctionOn(page, {
      backendNodeId: params.backendNodeId,
      functionDeclaration: 'function () { return this.getBoundingClientRect() }'
    })
  }

  public async getLayoutMetrics(page: Page) {
    const session = await this.getSession(page)
    return session.send('Page.getLayoutMetrics')
  }

  public async getScreenshot(page: Page) {
    const session = await this.getSession(page)
    const screenshot = await session.send('Page.captureScreenshot')
    return screenshot.data
  }

  public async getSession(page: Page) {
    if (!this.sessionMap.has(page)) {
      const session = await page.context().newCDPSession(page)
      this.sessionMap.set(page, session)
    }
    return this.sessionMap.get(page) as CDPSession
  }

  public async getSnapshot(page: Page) {
    const session = await this.getSession(page)
    return session.send('DOMSnapshot.captureSnapshot', {
      computedStyles: ['background-color', 'visibility', 'opacity', 'z-index', 'overflow'],
      includeDOMRects: true,
      includePaintOrder: true
    })
  }

  public async getTagName(page: Page, params: { backendNodeId: number }) {
    return this.callFunctionOn(page, {
      backendNodeId: params.backendNodeId,
      functionDeclaration: 'function () { return this.tagName }'
    })
  }

  public async getTitle(page: Page) {
    const session = await this.getSession(page)
    const { result } = await session.send('Runtime.evaluate', {
      expression: 'document.title',
      returnByValue: true
    })
    return result.value as string
  }

  public async goTo(page: Page, params: { url: string }) {
    const session = await this.getSession(page)
    await session.send('Page.navigate', params)
  }

  public async scrollElement(page: Page, params: { backendNodeId: number; target: ScrollTarget }) {
    await this.callFunctionOn(page, {
      backendNodeId: params.backendNodeId,
      functionDeclaration: `function () {
        let element = this
        let height = 0

        switch (element.tagName) {
          case 'BODY':
          case 'HTML':
            element = document.scrollingElement || document.body
            height = window.visualViewport?.height ?? 720
            break
          default:
            height = element.clientHeight ?? 720
            break
        }
        
        const relativeScrollDistance = 0.75 * height

        switch ('${params.target}') {
          case 'top':
            return element.scrollTo({ top: 0 })
          case 'bottom':
            return element.scrollTo({ top: element.scrollHeight })
          case 'up':
            return element.scrollBy({ top: -relativeScrollDistance })
          case 'down':
            return element.scrollBy({ top: relativeScrollDistance })
          default:
            throw Error('Unsupported scroll target ${params.target}')
        }
      }`
    })
  }

  public async scrollIntoView(page: Page, params: { backendNodeId: number }) {
    const session = await this.getSession(page)
    await session.send('DOM.scrollIntoViewIfNeeded', params)
  }

  public async sendKeys(page: Page, params: { objectId: string; text: string }) {
    const session = await this.getSession(page)

    const { nodeId } = await session.send('DOM.requestNode', { objectId: params.objectId })
    await session.send('DOM.focus', { nodeId })

    for (const char of params.text) {
      await session.send('Input.dispatchKeyEvent', { type: 'char', text: char })
    }
  }
}
