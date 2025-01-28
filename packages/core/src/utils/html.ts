import type { ElementLocation } from '../types'

import { JSDOM } from 'jsdom'
import sanitizeHTML from 'sanitize-html'

/**
 * This function creates a JSDOM environment from the given HTML
 * and generates all locations of the target elements.
 *
 * @param html The sanitized HTML snapshot to generate locations from.
 * @param types The types of elements to generate locations for.
 */
export const getElementLocations = (html: string, types: string[] = []) => {
  const allowedTags = JSON.stringify(types).toUpperCase()
  const dom = new JSDOM(html, { runScripts: 'dangerously' })

  dom.window.eval(`
    const elements = document.querySelectorAll('*:not(head):not(script):not(style)')
    const locations = []

    const getElementXPath = (element) => {
      const nodes = []

      for (; element && element.nodeType == 1; element = element.parentNode) {
        let position = 1

        for (let sib = element.previousSibling; sib; sib = sib.previousSibling) {
          if (sib.nodeType === 1 && sib.nodeName === element.nodeName) position++
        }

        nodes.unshift(element.nodeName.toLowerCase() + '[' + position + ']')
      }

      return '//' + nodes.join('/')
    }

    for (const element of elements) {
      if (!${allowedTags}.includes(element.nodeName)) continue

      const clone = element.cloneNode(true)
      clone.innerHTML = [...clone.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join('').trim()

      locations.push({ html: clone.outerHTML, xpath: getElementXPath(element) })
    }

    window.locations = locations
  `)

  return dom.window.locations as ElementLocation[]
}

/**
 * Sanitizes the HTML to reduce the size of the HTML snapshot.
 *
 * @param html The original HTML snapshot.
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
