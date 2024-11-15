import type { Page } from 'playwright'

export const assertElementContentEquals = async (page: Page, { id, text }: { id: string; text: string }) => {
  const locator = page.locator(id).first()
  const content = await locator.textContent()
  return Boolean(content && content.trim() === text)
}

export const assertPageContains = async (page: Page, { text }: { text: string }) => {
  const content = await page.content()
  return content.includes(text)
}

export const assertPageDoesNotContain = async (page: Page, { text }: { text: string }) => {
  const content = await page.content()
  return !content.includes(text)
}

export const assertPageTitleEquals = async (page: Page, { text }: { text: string }) => {
  const title = await page.title()
  return title === text
}

export const assertPageUrlMatches = (page: Page, { pattern }: { pattern: string }) => {
  return new RegExp(pattern).test(page.url())
}

export const click = async (page: Page, { id }: { id: string }) => {
  const locator = page.locator(id).first()
  await locator.hover()
  await locator.click()
}

export const getLink = async (page: Page, { id }: { id: string }) => {
  return page.locator(id).first().getAttribute('href')
}

export const hover = async (page: Page, { id }: { id: string }) => {
  await page.locator(id).first().hover()
}

export const input = async (page: Page, { id, text }: { id: string; text: string }) => {
  const locator = page.locator(id).first()
  await locator.hover()
  await locator.click()
  await locator.fill(text)
}

export const navigate = async (page: Page, { url }: { url: string }) => {
  await page.goto(url)
}

export const pressKeys = async (page: Page, { keys }: { keys: string }) => {
  await page.keyboard.press(keys)
}

export const scroll = async (page: Page, { direction }: { direction: 'top' | 'bottom' | 'up' | 'down' }) => {
  switch (direction) {
    case 'top':
      await page.evaluate(() => window.scrollTo({ top: 0 }))
      break
    case 'bottom':
      await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }))
      break
    case 'up':
      await page.evaluate(() => window.scrollBy({ top: -window.innerHeight }))
      break
    case 'down':
      await page.evaluate(() => window.scrollBy({ top: window.innerHeight }))
      break
    default:
      throw Error(`Unsupported scroll target ${direction}`)
  }
}

export const select = async (page: Page, { id, option }: { id: string; option: string }) => {
  const locator = page.locator(id).first()
  await locator.selectOption({ label: option })
}

export const waitForText = async (page: Page, { text }: { text: string }) => {
  await page.waitForSelector(`text=${text}`, { state: 'visible', timeout: 30000 })
}
