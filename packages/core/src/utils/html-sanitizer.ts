import sanitizeHTML from 'sanitize-html'
import { allowedTags } from './pattern'

/**
 * Sanitizes the HTML to reduce the size of the HTML snapshot.
 *
 * @param html The original HTML snapshot.
 */
export const sanitize = (html: string) => {
  const allowedAttributes = {
    '*': ['aria*', 'class', 'data*', 'href', 'id', 'name', 'placeholder', 'title', 'type', 'value']
  }
  const allowedStyles = {
    '*': { '*': [] }
  }

  return sanitizeHTML(html, { allowedAttributes, allowedStyles, allowedTags })
}
