import type { ActionParams, PlayWordInterface } from './types'

import { setTimeout } from 'timers/promises'
import * as utils from './utils'

/**
 * Get the handle used to interact with the page or frame.
 *
 * If the frame source is provided, wait for the frame to load and get the handle of the frame.
 * If the frame source is not provided, get the handle of the page.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
const getHandle = async (ref: PlayWordInterface, params: Partial<ActionParams> = {}) => {
  ref.frame = undefined

  if (params.frameSrc && (await waitForFrame(ref, params.frameSrc))) {
    const frame = ref.page?.frames().find((frame) => frame.url() === params.frameSrc)
    ref.frame = frame
  }

  const handle = ref.frame || ref.page!
  await handle.waitForLoadState('domcontentloaded')

  return handle
}

/**
 * Get the input variable from the environment variables.
 *
 * @param input The user input.
 */
const getInputVariable = (input: string) => {
  const matched = input.match(utils.variablePattern)

  if (!matched) {
    return input
  }

  return process.env[matched[0]] || input
}

/**
 * Wait for the frame to load.
 *
 * @param ref The PlayWord instance.
 * @param frameSrc The source of the frame to wait for.
 * @param timeout The timeout in milliseconds. Default is 30 seconds.
 */
const waitForFrame = async (ref: PlayWordInterface, frameSrc: string, timeout = 30000) => {
  const start = Date.now()
  let isFound = false

  while (!isFound && Date.now() - start < timeout) {
    isFound = Boolean(ref.page?.frames().some((f) => f.url() === frameSrc))
    await setTimeout(500)
  }

  return isFound
}

/**
 * Assert that an element on the page or within the current frame contains a specific text.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const assertElementContains = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const handle = await getHandle(ref, params)
    const locator = handle.locator(params.xpath!).first()
    const text = getInputVariable(params.text!)

    await locator.waitFor({ state: 'visible', timeout: 5000 })

    return Boolean((await locator.textContent())?.includes(text))
  } catch {
    return false
  }
}

/**
 * Assert that an element on the page or within the current frame does not contain a specific text.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const assertElementNotContain = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const handle = await getHandle(ref, params)
    const locator = handle.locator(params.xpath!).first()
    const text = getInputVariable(params.text!)

    await locator.waitFor({ state: 'visible', timeout: 5000 })

    return !(await locator.textContent())?.includes(text) || false
  } catch {
    return false
  }
}

/**
 * Assert that the content of an element on the page or within the current frame is equal to a specific text.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const assertElementContentEquals = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const handle = await getHandle(ref, params)
    const locator = handle.locator(params.xpath!).first()
    const text = getInputVariable(params.text!)

    await locator.waitFor({ state: 'visible', timeout: 5000 })

    return (await locator.textContent())?.trim() === text.trim()
  } catch {
    return false
  }
}

/**
 * Assert that the content of an element on the page or within the current frame is not equal to a specific text.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const assertElementContentNotEqual = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const handle = await getHandle(ref, params)
    const locator = handle.locator(params.xpath!).first()
    const text = getInputVariable(params.text!)

    await locator.waitFor({ state: 'visible', timeout: 5000 })

    return (await locator.textContent())?.trim() !== text.trim()
  } catch {
    return false
  }
}

/**
 * Assert that an element on the page or within the current frame is visible.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const assertElementVisible = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const handle = await getHandle(ref, params)
    const locator = handle.locator(params.xpath!).first()

    await locator.waitFor({ state: 'visible', timeout: 5000 })

    return true
  } catch {
    return false
  }
}

/**
 * Assert that an element on the page or within the current frame is not visible.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const assertElementNotVisible = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const handle = await getHandle(ref, params)
    const locator = handle.locator(params.xpath!).first()

    await locator.waitFor({ state: 'hidden', timeout: 5000 })

    return true
  } catch {
    return false
  }
}

/**
 * Assert that the page contains a specific text.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const assertPageContains = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const handle = await getHandle(ref, params)
    const text = getInputVariable(params.text!)

    const locators = await handle.getByText(text).all()
    const results = await Promise.all(locators.map((locator) => locator.isVisible()))

    return results.some(Boolean)
  } catch {
    return false
  }
}

/**
 * Assert that the page does not contain a specific text.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const assertPageNotContain = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const handle = await getHandle(ref, params)
    const text = getInputVariable(params.text!)

    const locators = await handle.getByText(text).all()
    const results = await Promise.all(locators.map((locator) => locator.isVisible()))

    return !results.some(Boolean)
  } catch {
    return false
  }
}

/**
 * Assert that the page title is equal to a specific text.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const assertPageTitleEquals = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const text = getInputVariable(params.text!)
    const title = await ref.page?.title()
    return title === text
  } catch {
    return false
  }
}

/**
 * Assert that the page URL matches a specific regular expression.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const assertPageUrlMatches = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const url = ref.page!.url()
    return new RegExp(params.pattern!).test(url)
  } catch {
    return false
  }
}

/**
 * Click on an element on the page or within the current frame.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const click = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const handle = await getHandle(ref, params)
    const locator = handle.locator(params.xpath!).first()

    await locator.waitFor({ state: 'visible', timeout: 5000 })
    await locator.click({ timeout: 5000 })

    return 'Performed the click action'
  } catch (error) {
    utils.info(error.message, 'red')
    return 'Failed to perform the action'
  }
}

/**
 * Get the text content on the page based on the provided screenshot.
 *
 * @param ref The PlayWord instance.
 */
export const getText = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const screenshot = await ref.page!.screenshot({ type: 'jpeg', quality: 100 })
    const encodedImg = 'data:image/jpeg;base64,' + screenshot.toString('base64')
    return await ref.ai.analyzeImage(encodedImg, params.input!)
  } catch (error) {
    utils.info(error.message, 'red')
    return 'Failed to perform the action'
  }
}

/**
 * Go to a specific URL.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const goto = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    await ref.page?.goto(params.url!)
    return 'Navigated to ' + params.url
  } catch (error) {
    utils.info(error.message, 'red')
    return 'Failed to perform the action'
  }
}

/**
 * Hover over an element on the page or within the current frame.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const hover = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const handle = await getHandle(ref, params)
    const locator = handle.locator(params.xpath!).first()

    await locator.waitFor({ state: 'visible', timeout: 5000 })
    await locator.hover({ timeout: 5000 })

    if (params.duration) {
      await ref.page?.waitForTimeout(params.duration)
    }

    return 'Performed the hover action'
  } catch (error) {
    utils.info(error.message, 'red')
    return 'Failed to perform the action'
  }
}

/**
 * Fill in an element on the page or within the current frame.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const input = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const handle = await getHandle(ref, params)
    const locator = handle.locator(params.xpath!).first()
    const text = getInputVariable(params.text!)

    await locator.waitFor({ state: 'visible', timeout: 5000 })
    await locator.fill(text, { timeout: 5000 })

    return 'Performed the input action'
  } catch (error) {
    utils.info(error.message, 'red')
    return 'Failed to perform the action'
  }
}

/**
 * Press specific keys on the keyboard.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const pressKeys = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    await ref.page?.keyboard.press(params.keys!)
    return 'Pressed keys ' + params.keys
  } catch (error) {
    utils.info(error.message, 'red')
    return 'Failed to perform the action'
  }
}

/**
 * Scroll the page or current frame in a specific direction.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const scroll = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const handle = await getHandle(ref, params)

    switch (params.direction) {
      case 'up':
        await handle.evaluate(() => window.scrollBy({ top: window.innerHeight }))
        return 'scrolled up'

      case 'down':
        await handle.evaluate(() => window.scrollBy({ top: window.innerHeight }))
        return 'scrolled down'

      case 'top':
        await handle.evaluate(() => window.scrollTo({ top: 0 }))
        return 'scrolled to top'

      case 'bottom':
        await handle.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }))
        return 'scrolled to bottom'

      default:
        return `Unsupported scroll target ${params.direction}`
    }
  } catch (error) {
    utils.info(error.message, 'red')
    return 'Failed to perform the action'
  }
}

/**
 * Select an option from a dropdown element on the page or within the current frame.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const select = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const handle = await getHandle(ref, params)
    const locator = handle.locator(params.xpath!).first()

    await locator.waitFor({ state: 'visible', timeout: 5000 })
    await locator.selectOption({ value: params.option! }, { timeout: 5000 })

    return 'Performed the select action'
  } catch (error) {
    utils.info(error.message, 'red')
    return 'Failed to perform the action'
  }
}

/**
 * Sleep for a specific duration.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const sleep = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    await ref.page?.waitForTimeout(params.duration!)
    return 'Slept for ' + params.duration! + ' milliseconds'
  } catch (error) {
    utils.info(error.message, 'red')
    return 'Failed to perform the action'
  }
}

/**
 * Switch to a specific frame on the page.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const switchFrame = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    ref.frame = undefined

    if (params.frameNumber !== undefined) {
      ref.frame = ref.page?.frames()[params.frameNumber]
    }

    return 'Switched to frame'
  } catch (error) {
    utils.info(error.message, 'red')
    return 'Failed to perform the action'
  }
}

/**
 * Switch to a specific page on the browser.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const switchPage = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    ref.page = ref.context.pages()[params.pageNumber || 0]
    return 'Switched to page'
  } catch (error) {
    utils.info(error.message, 'red')
    return 'Failed to perform the action'
  }
}

/**
 * Wait for a specific text to appear on the page or within the current frame.
 *
 * If the text is not found within 30 seconds, the action will fail.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const waitForText = async (ref: PlayWordInterface, params: Partial<ActionParams>) => {
  try {
    const handle = await getHandle(ref, params)
    const text = getInputVariable(params.text!)

    await handle.waitForSelector('text=' + text, { state: 'visible', timeout: 30000 })

    return 'Waited for text: ' + text
  } catch (error) {
    utils.info(error.message, 'red')
    return 'Failed to perform the action'
  }
}
