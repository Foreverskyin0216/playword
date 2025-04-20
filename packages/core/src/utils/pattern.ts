/**
 * The pattern to match AI keywords.
 *
 * If this pattern matches, the input is considered an AI request.
 */
export const aiPattern = new RegExp(/^\[\b(?:ai)\b\]/i)

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
  'option',
  'p',
  'select',
  'span',
  'strong',
  'td',
  'textarea',
  'th',
  'ul'
]
