import type { ElementLocation } from './types'

import { JSDOM } from 'jsdom'
import sanitizeHtml from 'sanitize-html'

export const getElementLocations = (html: string, targets: string[] = []) => {
  const allowedTags = JSON.stringify(targets).toUpperCase()
  const dom = new JSDOM(html, { runScripts: 'dangerously' })

  dom.window.eval(`
    const elements = document.querySelectorAll('*:not(script):not(style)')
    const locations = []

    const isTarget = (element) => ${allowedTags}.includes(element.tagName)

    const getElementXPath = (element) => {
      if (element && element.id) return '//*[@id="' + element.id + '"]'
      else return getElementTreeXPath(element)
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

    for (const element of elements) {
      if (!isTarget(element)) {
        continue
      }

      const xpath = getElementXPath(element)
      const clone = element.cloneNode(true)
      let text = ''

      for (const { nodeType, nodeValue } of clone.childNodes) {
        text += nodeType === 3 ? nodeValue : ''
      }
      text = text.trim()

      clone.innerHTML = text

      locations.push({ xpath, element: clone.outerHTML })
    }

    window.locations = locations
  `)

  return dom.window.locations as ElementLocation[]
}

export const sanitize = (html: string) => {
  return sanitizeHtml(html, {
    allowedAttributes: { '*': ['aria-*', 'class', 'data-*', 'href', 'id', 'placeholder', 'title', 'type'] },
    allowedStyles: { '*': { '*': [] } },
    allowedTags: false,
    allowVulnerableTags: true,
    exclusiveFilter: (frame) => ['head', 'script', 'style'].includes(frame.tag)
  })
}
