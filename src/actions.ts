import type { ActionParams, PlayWordInterface } from './types'

import { Document } from '@langchain/core/documents'
import { markElement, unmarkElement } from './actionUtils'

/**
 * Assert that the content of an element on the page or within the current frame is equal to a specific text.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the element.
 * @param params.text - The text to compare with the element's content.
 */
export const assertElementContentEquals = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'assertElementContentEquals', params })
  }

  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const locator = target.locator(params.xpath!).first()

  return (await locator.textContent())?.trim() === params.text?.trim()
}

/**
 * Assert that the content of an element on the page or within the current frame is not equal to a specific text.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the element.
 * @param params.text - The text to compare with the element's content.
 */
export const assertElementContentNotEquals = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'assertElementContentNotEquals', params })
  }

  return !(await assertElementContentEquals(ref, params))
}

/**
 * Assert that an element on the page or within the current frame is visible.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the element.
 */
export const assertElementVisible = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'assertElementVisible', params })
  }

  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const locator = target.locator(params.xpath!).first()

  return await locator.isVisible()
}

/**
 * Assert that an element on the page or within the current frame is not visible.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the element.
 */
export const assertElementNotVisible = async (ref: PlayWordInterface, params: ActionParams) => {
  return !(await assertElementVisible(ref, params))
}

/**
 * Assert that the page contains a specific text.
 *
 * @param ref - PlayWord instance.
 * @param params.text - The text to check if it exists on the page.
 */
export const assertPageContains = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'assertPageContains', params })
  }

  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const locators = await target.getByText(params.text!).all()

  return (await Promise.all(locators.map((locator) => locator.isVisible()))).some((item) => item)
}

/**
 * Assert that the page does not contain a specific text.
 *
 * @param ref - PlayWord instance.
 * @param params.text - The text to check if it does not exist on the page.
 */
export const assertPageDoesNotContain = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'assertPageDoesNotContain', params })
  }

  return !(await assertPageContains(ref, params))
}

/**
 * Assert that the page title is equal to a specific text.
 *
 * @param ref - PlayWord instance.
 * @param params.text - The text to compare with the page title.
 */
export const assertPageTitleEquals = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'assertPageTitleEquals', params })
  }

  await ref.page.waitForLoadState('load')

  return (await ref.page.title()) === params.text
}

/**
 * Assert that the page URL matches a specific regular expression.
 *
 * @param ref - PlayWord instance.
 * @param params.pattern - The regular expression to match against the page URL.
 */
export const assertPageUrlMatches = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'assertPageUrlMatches', params })
  }

  await ref.page.waitForLoadState('load')

  return new RegExp(params.pattern!).test(ref.page.url())
}

/**
 * Click on an element on the page or within the current frame.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the clickable element.
 */
export const click = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'click', params })
  }

  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const locator = target.locator(params.xpath!).first()

  for (const element of await locator.all()) {
    if (await element.isVisible()) {
      await element.click()
      return 'Clicked on ' + params.xpath!
    }
  }

  return 'No element found'
}

/**
 * Get the value of an attribute of an element on the page or within the current frame.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the element.
 * @param params.attribute - The attribute to get the value of.
 */
export const getAttribute = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'getAttr', params })
  }

  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const locator = target.locator(params.xpath!).first()

  const attributeValue = await locator.getAttribute(params.attribute!)

  return attributeValue ? 'Attribute value: ' + attributeValue : 'No element found'
}

/**
 * Get all frames on the page.
 *
 * @param ref - PlayWord instance.
 * @returns The frame documents stored within the {@link Document} structure.
 */
export const getFrames = async (ref: PlayWordInterface) => {
  await ref.page.waitForLoadState('load')

  const frames = [] as Document[]

  for (const frame of ref.page.frames()) {
    await frame.waitForLoadState('load')
    frames.push(new Document({ pageContent: JSON.stringify({ name: frame.name(), url: frame.url() }) }))
  }

  return frames
}

/**
 * Get a base64-encoded JPEG screenshot of the page.
 * It will return an empty string when the page is within a frame.
 *
 * @param ref - PlayWord instance.
 */
export const getScreenshot = async (ref: PlayWordInterface) => {
  await ref.page.waitForLoadState('load')
  const screenshot = await ref.page.screenshot()
  return 'data:image/jpeg;base64,' + screenshot.toString('base64')
}

/**
 * Get the HTML snapshot of the page or current frame.
 *
 * @param ref - PlayWord instance.
 */
export const getSnapshot = async (ref: PlayWordInterface) => {
  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')

  return await target.content()
}

/**
 * Go to a specific URL.
 *
 * @param ref - PlayWord instance.
 * @param params.url - The URL to navigate to.
 */
export const goto = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'goto', params })
  }

  const { url } = params as { url: string }
  await ref.page.goto(url)

  return 'Navigated to ' + params.url!
}

/**
 * Hover over an element on the page or within the current frame.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the element.
 */
export const hover = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'hover', params })
  }

  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const locator = target.locator(params.xpath!).first()

  for (const element of await locator.all()) {
    if (await element.isVisible()) {
      await element.hover()
      return 'Hovered on ' + params.xpath!
    }
  }

  return 'No element found'
}

/**
 * Fill in an element on the page or within the current frame.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the input/textarea element.
 * @param params.text - The text to fill in the element.
 */
export const input = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'input', params })
  }

  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const locator = target.locator(params.xpath!).first()

  for (const element of await locator.all()) {
    if (await element.isVisible()) {
      await element.fill(params.text!)
      return 'Filled in ' + params.xpath!
    }
  }

  return 'No element found'
}

/**
 * Mark an element on the page or within the current frame with a specific order.
 * The label will be used to help AI understand the layout of the page and better
 * achieve the requested actions.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the element to mark.
 * @param params.order - The marker order.
 */
export const mark = async (ref: PlayWordInterface, params: ActionParams) => {
  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const locator = target.locator(params.xpath!).first()

  for (const element of await locator.all()) {
    if (await element.isVisible()) {
      await element.evaluate(markElement, params.order!)
      return 'Marked ' + params.xpath! + ' with order ' + params.order!
    }
  }

  return 'No element found'
}

/**
 * Press specific keys on the keyboard.
 *
 * @param ref - PlayWord instance.
 * @param params.keys - The keys to press.
 */
export const pressKeys = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'pressKeys', params })
  }

  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')

  await ref.page.keyboard.press(params.keys!)

  return 'Pressed keys ' + params.keys!
}

/**
 * Scroll the page or current frame in a specific direction.
 *
 * @param ref - PlayWord instance.
 * @param params.direction - Supported values for `direction` are `up`, `down`, `top`, and `bottom`.
 */
export const scroll = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'scroll', params })
  }

  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')

  switch (params.direction) {
    case 'up':
      await target.evaluate(() => window.scrollBy({ top: -window.innerHeight }))
      return 'scrolled up'
    case 'down':
      await target.evaluate(() => window.scrollBy({ top: window.innerHeight }))
      return 'scrolled down'
    case 'top':
      await target.evaluate(() => window.scrollTo({ top: 0 }))
      return 'scrolled to top'
    case 'bottom':
      await target.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }))
      return 'scrolled to bottom'
    default:
      return `Unsupported scroll target ${params.direction}`
  }
}

/**
 * Select an option from a dropdown element on the page or within the current frame.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the dropdown element.
 * @param params.option - The option to select from the dropdown.
 */
export const select = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'select', params })
  }

  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const locator = target.locator(params.xpath!).first()

  for (const element of await locator.all()) {
    if (await element.isVisible()) {
      await element.selectOption({ label: params.option! })
      return 'Selected ' + params.option!
    }
  }

  return 'No element found'
}

/**
 * Sleep for a specific duration.
 *
 * @param ref - PlayWord instance.
 * @param params.duration - The number of seconds to sleep.
 */
export const sleep = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'sleep', params })
  }

  await ref.page.waitForTimeout(params.duration! * 1000)

  return 'Slept for ' + params.duration! + ' seconds'
}

/**
 * Switch to a specific frame on the page.
 *
 * @param ref - PlayWord instance.
 * @param params.frameNumber - The index of the frame to switch to.
 */
export const switchFrame = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'switchFrame', params })
  }

  ref.frame = ref.page.frames()[params.frameNumber!]

  return 'Switched to frame'
}

/**
 * Unmark an element on the page or within the current frame.
 *
 * @param ref - PlayWord instance.
 * @param params.order - The marker order.
 */
export const unmark = async (ref: PlayWordInterface, params: ActionParams) => {
  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')

  await target.evaluate(unmarkElement, params.order!)

  return 'Unmarked ' + params.xpath! + ' with order ' + params.order!
}

/**
 * Wait for a specific text to appear on the page or within the current frame.
 *
 * @param ref - PlayWord instance.
 * @param params.text - The text to wait for.
 */
export const waitForText = async (ref: PlayWordInterface, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'waitForText', params })
  }

  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')

  await target.waitForSelector(`text=${params.text}`, { state: 'visible', timeout: 30000 })

  return 'Waited for text ' + params.text!
}
