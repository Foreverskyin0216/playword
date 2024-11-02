/**
 * Create a label for an element with an order number.
 *
 * @param element The element to mark.
 * @param order The order number to display.
 * @returns The created span element.
 */
export const markElement = (element: HTMLElement, order: number) => {
  const rect = element.getBoundingClientRect()
  const span = document.createElement('span')

  span.id = `playword-label-${order}`
  span.innerText = '#' + order.toString()
  span.style.backgroundColor = 'black'
  span.style.color = '#ffd700'
  span.style.fontSize = '24px'
  span.style.fontWeight = 'bold'
  span.style.padding = '4px'
  span.style.position = 'absolute'
  span.style.top = `${rect.top + window.scrollY - 20}px`
  span.style.left = `${rect.left + window.scrollX - 40}px`
  span.style.zIndex = '1000'
  document.body.appendChild(span)

  return span
}

/**
 * Remove the label from an element.
 *
 * @param order - The order number of the label.
 */
export const unmarkElement = (order: number) => {
  const span = document.getElementById(`playword-label-${order}`)
  if (span) span.remove()
}
