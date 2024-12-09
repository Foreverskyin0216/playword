/**
 * Pattern to match assertion keywords.
 */
export const assertionPattern = new RegExp(
  /^\b(?:are|assert|assure|can|check|compare|confirm|could|did|do|does|ensure|expect|guarantee|has|have|is|match|satisfy|shall|should|test|then|was|were|validate|verify)\b/i
)

/**
 * Pattern to match input variables.
 */
export const inputVariablesPattern = new RegExp(/(?<={)[^{}]+(?=})/g)

/**
 * Pattern to match AI keywords.
 */
export const aiPattern = new RegExp(/^\[\b(?:ai)\b\]/i)

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
