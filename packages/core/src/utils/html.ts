import { JSDOM } from 'jsdom'
import sanitizeHtml from 'sanitize-html'

/**
 * This function creates a DOM from the given HTML snapshot and tries to generate all locations of the target elements.
 *
 * @param html The sanitized HTML snapshot to generate element locations from.
 * @param targets Which elements to generate locations for.
 * @returns The locations of the target elements.
 */
export const getElementLocations = (html: string, targets: string[] = []) => {
  const allowedTags = JSON.stringify(targets).toUpperCase()
  const dom = new JSDOM(html, { runScripts: 'dangerously' })

  dom.window.eval(`
    const elements = document.querySelectorAll('*:not(head):not(script):not(style)')
    const locations = []

    const getElementXPath = (element, text) => {
      switch (true) {
        case Boolean(element && element.id):
          return '//*[@id="' + element.id + '"]'

        case Boolean(element && element.hasAttribute('data-testid')):
          return '//*[@data-testid="' + element.getAttribute('data-testid') + '"]'

        case Boolean(element && element.hasAttribute('data-qa')):
          return '//*[@data-qa="' + element.getAttribute('data-qa') + '"]'

        case Boolean(element && element.tagName === 'A' && element.href && element.href.startsWith('http')):
          return '//a[@href="' + element.href + '"]'

        case Boolean(element && element.tagName === 'DIV'):
          return '//div[@class="' + element.className + '" and text()="' + text + '"]'

        default:
          return getElementTreeXPath(element)
      }
    }

    const getElementTreeXPath = (element) => {
      const paths = []

      for (; element && element.nodeType == 1; element = element.parentNode) {
        let index = 0

        for (let sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
          if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE) continue
          if (sibling.nodeName == element.nodeName) ++index
        }

        paths.splice(0, 0, element.nodeName.toLowerCase() + (index ? '[' + (index + 1) + ']' : ''))
      }
      
      return paths.length ? '//' + paths.join('/') : null
    }

    const isTarget = (element) => ${allowedTags}.includes(element.tagName)

    const isVisibleInViewport = (element) => {
      const rect = element.getBoundingClientRect()
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      )
    }

    for (const element of elements) {
      if (!isTarget(element) || !isVisibleInViewport(element)) continue

      const clone = element.cloneNode(true)
      let text = ''

      for (const { nodeType, nodeValue } of clone.childNodes) {
        text += nodeType === 3 ? nodeValue : ''
      }
      text = text.trim()
      if (element.tagName === 'DIV' && text.length === 0) continue

      clone.innerHTML = text
      const xpath = getElementXPath(element, text)

      locations.push({ xpath, element: clone.outerHTML })
    }

    window.locations = locations
  `)

  return dom.window.locations as ElementLocation[]
}

/**
 * To reduce the size of the HTML snapshot and make it easier to do similarity searches, we need to sanitize the HTML.
 *
 * @param html The original HTML snapshot.
 * @returns The sanitized HTML snapshot.
 */
export const sanitize = (html: string) => {
  return sanitizeHtml(html, {
    allowedAttributes: { '*': ['aria-*', 'class', 'data-*', 'href', 'id', 'placeholder', 'title', 'type', 'value'] },
    allowedStyles: { '*': { '*': [] } },
    allowedTags: false,
    allowVulnerableTags: true,
    exclusiveFilter: (frame) => ['head', 'script', 'style'].includes(frame.tag)
  })
}
