import type { ElementLocation } from '../types'

import { JSDOM } from 'jsdom'
import sanitizeHTML from 'sanitize-html'

/**
 * This function creates a JSDOM environment from the given HTML
 * and generates all locations of the target elements.
 *
 * @param html The sanitized HTML snapshot to generate locations from.
 * @param types The types of elements to generate locations for.
 *
 * @returns The locations of the target elements. See {@link ElementLocation} for details.
 */
export const getElementLocations = (html: string, types: string[] = []) => {
  const allowedTags = JSON.stringify(types).toUpperCase()
  const dom = new JSDOM(html, { runScripts: 'dangerously' })

  dom.window.eval(`
    const elements = document.querySelectorAll('*:not(head):not(script):not(style)')
    const locations = []

    const getElementXPath = (e) => {
      const path = []

      for (; e && e.nodeType == 1; e = e.parentNode) {
        let position = 1

        for (let sibling = e.previousSibling; sibling; sibling = sibling.previousSibling) {
          if (sibling.nodeType === 1 && sibling.nodeName === e.nodeName) position++
        }

        path.unshift(e.nodeName.toLowerCase() + '[' + position + ']')
      }

      return path.length ? '//' + path.join('/') : null
    }

    for (const e of elements) {
      if (!${allowedTags}.includes(e.nodeName)) continue

      const clone = e.cloneNode(true)
      clone.innerHTML = [...clone.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join('').trim()

      locations.push({ html: clone.outerHTML, xpath: getElementXPath(e) })
    }

    window.locations = locations
  `)

  return dom.window.locations as ElementLocation[]
}

/**
 * To reduce the size of the HTML snapshot and make it easier to do similarity searches, we need to sanitize the HTML.
 *
 * @param html The original HTML snapshot.
 *
 * @returns The sanitized HTML snapshot.
 */
export const sanitize = (html: string) => {
  return sanitizeHTML(html, {
    allowedAttributes: { '*': ['aria-*', 'class', 'data-*', 'href', 'id', 'placeholder', 'title', 'type', 'value'] },
    allowedStyles: { '*': { '*': [] } },
    allowedTags: false,
    allowVulnerableTags: true,
    exclusiveFilter: (frame) => ['head', 'script', 'style'].includes(frame.tag)
  })
}
