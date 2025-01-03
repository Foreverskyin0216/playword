import { markElement, unmarkElement } from './utils'
import { variablePattern } from './validators'

/**
 * Get the input variable from the environment variables.
 *
 * @param input
 * @returns If the input variable is found in the environment variables, return the value of the input variable. Otherwise, return the original input.
 */
const getInputVariable = (input: string) => {
  const match = input.match(variablePattern)
  if (!match) return input
  return process.env[match[0]] || input
}

/**
 * Assert that the content of an element on the page or within the current frame is equal to a specific text.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the element.
 * @param params.text - The text to compare with the element's content.
 */
export const assertElementContentEquals = async (ref: PlayWordInterface, params: ActionParams) => {
  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const locator = target.locator(params.xpath!).first()
  const text = getInputVariable(params.text!)
  return (await locator.textContent())?.trim() === text.trim()
}

/**
 * Assert that the content of an element on the page or within the current frame is not equal to a specific text.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the element.
 * @param params.text - The text to compare with the element's content.
 */
export const assertElementContentNotEquals = async (ref: PlayWordInterface, params: ActionParams) => {
  return !(await assertElementContentEquals(ref, params))
}

/**
 * Assert that an element on the page or within the current frame is visible.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the element.
 */
export const assertElementVisible = async (ref: PlayWordInterface, params: ActionParams) => {
  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const locator = target.locator(params.xpath!).first()
  return locator.isVisible()
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
 * Assert that an image contains specific information.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the image element.
 */
export const assertImageContains = async (ref: PlayWordInterface, params: ActionParams) => {
  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const image = await target.locator(params.xpath!).first().screenshot()
  return ref.ai.checkImageInformation(ref.input, 'data:image/jpeg;base64,' + image.toString('base64'))
}

/**
 * Assert that the page contains a specific text.
 *
 * @param ref - PlayWord instance.
 * @param params.text - The text to check if it exists on the page.
 */
export const assertPageContains = async (ref: PlayWordInterface, params: ActionParams) => {
  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const text = getInputVariable(params.text!)
  const locators = await target.getByText(text).all()
  return (await Promise.all(locators.map((locator) => locator.isVisible()))).some((item) => item)
}

/**
 * Assert that the page does not contain a specific text.
 *
 * @param ref - PlayWord instance.
 * @param params.text - The text to check if it does not exist on the page.
 */
export const assertPageDoesNotContain = async (ref: PlayWordInterface, params: ActionParams) => {
  return !(await assertPageContains(ref, params))
}

/**
 * Assert that the page title is equal to a specific text.
 *
 * @param ref - PlayWord instance.
 * @param params.text - The text to compare with the page title.
 */
export const assertPageTitleEquals = async (ref: PlayWordInterface, params: ActionParams) => {
  await ref.page.waitForLoadState('load')
  const text = getInputVariable(params.text!)
  return (await ref.page.title()) === text
}

/**
 * Assert that the page URL matches a specific regular expression.
 *
 * @param ref - PlayWord instance.
 * @param params.pattern - The regular expression to match against the page URL.
 */
export const assertPageUrlMatches = async (ref: PlayWordInterface, params: ActionParams) => {
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
 * @returns The frame list containing the name and URL of each frame.
 */
export const getFrames = async (ref: PlayWordInterface) => {
  const frames = [] as string[]
  await ref.page.waitForLoadState('load')

  for (const frame of ref.page.frames()) {
    await frame.waitForLoadState('load')
    frames.push(JSON.stringify({ name: frame.name(), url: frame.url() }))
  }

  return frames
}

/**
 * Get the information from a screenshot of an element.
 * This action requires calling the AI service even if running in record mode.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the element.
 */
export const getImageInformation = async (ref: PlayWordInterface, params: ActionParams) => {
  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const image = await target.locator(params.xpath!).first().screenshot()
  return ref.ai.retrieveImageInformation(ref.input, 'data:image/jpeg;base64,' + image.toString('base64'))
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
  return target.content()
}

/**
 * Get text of an element on the page or within the current frame.
 *
 * @param ref - PlayWord instance.
 * @param params.xpath - XPath to locate the element.
 */
export const getText = async (ref: PlayWordInterface, params: ActionParams) => {
  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const locator = target.locator(params.xpath!).first()
  return (await locator.evaluate((elem) => elem.firstChild?.textContent)) || ''
}

/**
 * Go back to the previous page in the browser history.
 *
 * @param ref - PlayWord instance.
 */
export const goBack = async (ref: PlayWordInterface) => {
  await ref.page.goBack()
  return 'Navigated back'
}

/**
 * Go to a specific URL.
 *
 * @param ref - PlayWord instance.
 * @param params.url - The URL to navigate to.
 */
export const goto = async (ref: PlayWordInterface, params: ActionParams) => {
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
  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const locator = target.locator(params.xpath!).first()
  const text = getInputVariable(params.text!)

  for (const element of await locator.all()) {
    if (await element.isVisible()) {
      await element.fill(text)
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
  ref.frame = params.frameNumber !== undefined ? ref.page.frames()[params.frameNumber] : undefined
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
  const target = ref.frame ? ref.frame : ref.page
  await target.waitForLoadState('load')
  const text = getInputVariable(params.text!)
  await target.waitForSelector('text=' + text, { state: 'visible', timeout: 30000 })
  return 'Waited for text: ' + text
}
