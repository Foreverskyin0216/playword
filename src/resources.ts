/**
 * Pattern to match assertion keywords.
 */
export const assertionPattern = new RegExp(
  /^\b(?:assert|assure|check|compare|confirm|ensure|expect|guarantee|is|match|satisfy|should|test|then|validate|verify)\b/i
)

/**
 * List of generic tags that are allowed to fetch locations from.
 */
export const genericTags = [
  'a',
  'button',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'img',
  'input',
  'label',
  'p',
  'select',
  'span',
  'textarea'
]
