/**
 * The pattern to match AI keywords.
 *
 * If this pattern matches, the input is considered an AI request.
 */
export const aiPattern = new RegExp(/^\[\b(?:ai)\b\]/i)

/**
 * The pattern to match assertion keywords.
 *
 * If this pattern matches, the input is considered an assertion.
 */
export const assertionPattern = new RegExp(
  /^\b(?:are|assert|assure|can|check|compare|confirm|could|did|do|does|ensure|expect|guarantee|has|have|is|match|satisfy|shall|should|test|then|was|were|validate|verify)\b/i
)

/**
 * The pattern to match input variables.
 *
 * If this pattern matches, the part of the input that matches
 * the pattern is considered a variable and is replaced with
 * the corresponding value.
 */
export const variablePattern = new RegExp(/(?<={)[^{}]+(?=})/g)

/** The generic tags that are allowed to fetch locations from. */
export const allowedTags = [
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
  'li',
  'p',
  'select',
  'span',
  'strong',
  'td',
  'textarea',
  'th',
  'ul'
]
