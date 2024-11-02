import type { ActionParams, PlayWordProperties } from './types'

export const assertElementContentEquals = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'assertElementContentEquals', params })
  }

  await ref.page.waitForLoadState('domcontentloaded')
  await ref.page.waitForLoadState('networkidle')

  const { xpath, text } = params as { xpath: string; text: string }
  const locator = ref.page.locator(xpath).first()
  const content = await locator.textContent()

  return Boolean(content && content.trim() === text)
}

export const assertElementInvisible = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'assertElementInvisible', params })
  }

  await ref.page.waitForLoadState('domcontentloaded')
  await ref.page.waitForLoadState('networkidle')

  const { xpath } = params as { xpath: string }
  const locator = ref.page.locator(xpath).first()

  return locator.isHidden()
}

export const assertElementVisible = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'assertElementVisible', params })
  }

  await ref.page.waitForLoadState('domcontentloaded')
  await ref.page.waitForLoadState('networkidle')

  const { xpath } = params as { xpath: string }
  const locator = ref.page.locator(xpath).first()

  return locator.isVisible()
}

export const assertPageContains = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'assertPageContains', params })
  }

  await ref.page.waitForLoadState('domcontentloaded')
  await ref.page.waitForLoadState('networkidle')

  const { text } = params as { text: string }
  const content = await ref.page.content()

  return content.includes(text)
}

export const assertPageDoesNotContain = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'assertPageDoesNotContain', params })
  }

  await ref.page.waitForLoadState('domcontentloaded')
  await ref.page.waitForLoadState('networkidle')

  const { text } = params as { text: string }
  const content = await ref.page.content()

  return !content.includes(text)
}

export const assertPageTitleEquals = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'assertPageTitleEquals', params })
  }

  await ref.page.waitForLoadState('domcontentloaded')
  await ref.page.waitForLoadState('networkidle')

  const { text } = params as { text: string }
  const title = await ref.page.title()

  return title === text
}

export const assertPageUrlMatches = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'assertPageUrlMatches', params })
  }

  const { pattern } = params as { pattern: string }
  return new RegExp(pattern).test(ref.page.url())
}

export const click = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'click', params })
  }

  await ref.page.waitForLoadState('domcontentloaded')
  await ref.page.waitForLoadState('networkidle')

  const { xpath } = params as { xpath: string }
  const locator = ref.page.locator(xpath).first()
  await locator.hover()
  await locator.click()
}

export const getLink = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'getLink', params })
  }

  await ref.page.waitForLoadState('domcontentloaded')
  await ref.page.waitForLoadState('networkidle')

  const { xpath } = params as { xpath: string }
  return ref.page.locator(xpath).first().getAttribute('href')
}

export const getSnapshot = async (ref: PlayWordProperties) => {
  await ref.page.waitForLoadState('domcontentloaded')
  await ref.page.waitForLoadState('networkidle')
  return ref.page.content()
}

export const hover = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'hover', params })
  }

  await ref.page.waitForLoadState('domcontentloaded')
  await ref.page.waitForLoadState('networkidle')

  const { xpath } = params as { xpath: string }
  await ref.page.locator(xpath).first().hover()
}

export const input = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'input', params })
  }

  await ref.page.waitForLoadState('domcontentloaded')
  await ref.page.waitForLoadState('networkidle')

  const { xpath, text } = params as { xpath: string; text: string }
  const locator = ref.page.locator(xpath).first()
  await locator.hover()
  await locator.click()
  await locator.fill(text)
}

export const navigate = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'navigate', params })
  }

  const { url } = params as { url: string }
  await ref.page.goto(url)
}

export const pressKeys = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'pressKeys', params })
  }

  await ref.page.waitForLoadState('domcontentloaded')
  await ref.page.waitForLoadState('networkidle')

  const { keys } = params as { keys: string }
  await ref.page.keyboard.press(keys)
}

export const scroll = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'scroll', params })
  }

  await ref.page.waitForLoadState('domcontentloaded')
  await ref.page.waitForLoadState('networkidle')

  const { direction } = params as { direction: 'up' | 'down' | 'top' | 'bottom' }
  switch (direction) {
    case 'up':
      await ref.page.evaluate(() => window.scrollBy({ top: -window.innerHeight }))
      return 'scrolled up'
    case 'down':
      await ref.page.evaluate(() => window.scrollBy({ top: window.innerHeight }))
      return 'scrolled down'
    case 'top':
      await ref.page.evaluate(() => window.scrollTo({ top: 0 }))
      return 'scrolled to top'
    case 'bottom':
      await ref.page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }))
      return 'scrolled to bottom'
    default:
      return `Unsupported scroll target ${direction}`
  }
}

export const select = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'select', params })
  }

  await ref.page.waitForLoadState('domcontentloaded')
  await ref.page.waitForLoadState('networkidle')

  const { xpath, option } = params as { xpath: string; option: string }
  const locator = ref.page.locator(xpath).first()
  await locator.selectOption({ label: option })
}

export const waitForText = async (ref: PlayWordProperties, params: ActionParams) => {
  if (ref.record) {
    ref.recordings[ref.step].actions.push({ name: 'waitForText', params })
  }

  const { text } = params as { text: string }
  await ref.page.waitForSelector(`text=${text}`, { state: 'visible', timeout: 30000 })
}
