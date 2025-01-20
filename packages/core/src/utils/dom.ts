/**
 * Utility functions for DOM manipulation.
 *
 * This file provides functions specifically designed for interacting with
 * and manipulating the DOM. These utilities are intended
 * for use exclusively in the browser context.
 *
 * Note: Attempting to use these functions in a non-browser context (e.g., Node.js)
 * will result in errors, as the required APIs are not available.
 */
import type { Recording } from '../types'

/**
 * Add a class to a given element.
 *
 * @param e The provided element
 * @param className The class to add
 */
export const addClass = (e: HTMLElement, className: string) => {
  e.classList.add(className)
}

/**
 * Check if an element has a specific class.
 *
 * @param e The provided element
 * @param className The class to check for
 */
export const hasClass = (e: HTMLElement, className: string) => {
  return e.classList.contains(className)
}

/**
 * Remove a class from a given element.
 *
 * @param e The provided element
 * @param className The class to remove
 */
export const removeClass = (e: HTMLElement, className: string) => {
  e.classList.remove(className)
}

/**
 * Set an attribute on a given element.
 *
 * @param e The provided element
 * @param param.name The name of the attribute to set
 * @param param.value The value to set for the attribute. If the value is falsy, the attribute will be removed.
 */
export const setAttribute = (e: HTMLElement, { name, value }: { name: string; value: boolean | string }) => {
  if (name === 'value') {
    ;(e as HTMLInputElement).value = value.toString()
  } else if (value) {
    e.setAttribute(name, value.toString())
  } else {
    e.removeAttribute(name)
  }
}

/**
 * Sets up the required event listeners for the PlayWord observer.
 *
 * This function attaches listeners to handle specific user interactions and translates
 * them into corresponding observer events. These events are used to monitor and control
 * interactions on the page.
 *
 * **Handled Events:**
 *
 * ### change
 * Listens for changes on `select` and `input` elements.
 * - For `select` elements: Emits a `select` event when an option is selected.
 * - For `input` elements: Updates the input value in real-time for the `#plwd-input` element.
 *
 * ### keydown
 * Monitors keypresses to:
 * - Determine whether events are accepted or dropped.
 * - Control the progress of dry runs.
 *
 * If the PlayWord panel is closed or the user is typing in the input field, the keypress will be ignored.
 *
 * ### mousedown
 * Listens for clicks on all elements on the page, except for elements within the PlayWord panel.
 * - If the target element is an `input` or `textarea` with a value:
 *   - Emits an `input` event.
 * - If the target element is an `input` (but not a standard input type):
 *   - Emits a `click` event.
 * - For all other elements:
 *   - Emits a `click` event.
 *
 * ### mouseover
 * Monitors hover actions over elements on the page, excluding elements within the PlayWord panel.
 * - Initiates a timeout to emit a `hover` event after 3 seconds.
 * - If the user moves the cursor before the timeout expires or performs another action:
 *   - The timeout is cleared, and no event is emitted.
 */
export const setEventListeners = () => {
  window.__name = (fn: unknown) => fn
  let hoverTimeout: NodeJS.Timeout | undefined

  /**
   * Block an event from propagating and prevent its default behavior.
   *
   * @param event The event to block
   */
  const blockEvent = (event: Event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  /**
   * Retrieve the element location details for a given element.
   *
   * @param e The target element
   * @returns The element map containing the frame source, HTML, and XPath. See {@link ElementLocation} for details.
   */
  const getElementMap = (e: HTMLElement) => {
    const clone = e.cloneNode(true) as Element
    const texts = [...clone.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue)
    const attributes = [...clone.attributes].map((attr) => `${attr.name}="${attr.value}"`)
    const node = e.nodeName.toLowerCase()
    return {
      frameSrc: getFrameSrc(),
      html: `<${node} ${attributes.join(' ')}>${texts.join(' ').trim()}</${node}>`,
      xpath: getElementXPath(e) as string
    }
  }

  /**
   * Retrieve the XPath for a given element.
   *
   * @param e The target element
   * @returns The XPath for the element. If no path is found, returns null.
   */
  const getElementXPath = (e: HTMLElement) => {
    const path: string[] = []

    for (; e && e.nodeType == 1; e = e.parentNode as HTMLElement) {
      let position = 1

      for (let sibling = e.previousSibling; sibling; sibling = sibling.previousSibling) {
        if (sibling.nodeType === 1 && sibling.nodeName === e.nodeName) {
          position++
        }
      }

      path.unshift(`${e.nodeName.toLowerCase()}[${position}]`)
    }

    return '//' + path.join('/')
  }

  /**
   * Retrieve the source URL for the current frame.
   *
   * @returns The source URL for the current frame. If the window is not in an iframe, returns undefined.
   */
  const getFrameSrc = () => {
    if (window.self === window.top) return

    const { origin, pathname, search, hash } = new URL(document.location.href)

    return origin + decodeURIComponent(pathname) + search + hash
  }

  /**
   * Emits a `click` event for a given element.
   *
   * @param e The target element
   */
  const performClick = async (e: HTMLElement) => {
    return window.emit({ name: 'click', params: { ...getElementMap(e) } })
  }

  /**
   * For elements that can be typed into, emits an `input` event.
   *
   * For other elements that has no input, emits a `click` event.
   *
   * @param e The target input element
   */
  const performInput = async (e: HTMLInputElement) => {
    const inputTypes = [
      'color',
      'date',
      'datetime-local',
      'email',
      'text',
      'month',
      'number',
      'password',
      'range',
      'search',
      'tel',
      'time',
      'url',
      'week'
    ]

    if (!e.value) return

    if (inputTypes.includes(e.type) || e.nodeName === 'TEXTAREA') {
      return window.emit({ name: 'input', params: { ...getElementMap(e), text: e.value } })
    }

    return window.emit({ name: 'click', params: { ...getElementMap(e) } })
  }

  document.addEventListener('change', async (event) => {
    clearTimeout(hoverTimeout)

    const e = event.target as HTMLSelectElement

    if (e.nodeName === 'SELECT') {
      return window.emit({ name: 'select', params: { ...getElementMap(e), option: e.value } })
    }

    if (e.id === 'plwd-input') {
      return window.updateInput(e.value)
    }
  })

  document.addEventListener('keydown', async (event) => {
    clearTimeout(hoverTimeout)

    const closed = document.querySelector('#plwd-panel:not(.open)')
    const typing = document.activeElement?.id === 'plwd-input'
    if (closed || typing) return

    blockEvent(event)

    if (['A', 'a'].includes(event.key)) {
      return Promise.all([window.acceptEvent(), window.notify('Accepted', '✓', '#4db6ac')])
    }

    if (['C', 'c'].includes(event.key)) {
      return window.dropEvent()
    }
  })

  document.addEventListener('mousedown', async (event) => {
    clearTimeout(hoverTimeout)

    const e = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement

    if (['SELECT', 'OPTION'].includes(e.nodeName)) return

    if (!['INPUT', 'TEXTAREA'].includes(e.nodeName)) {
      const { activeElement } = document

      if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.nodeName)) {
        ;(activeElement as HTMLElement).blur()
      }

      blockEvent(event)
    }

    const state = await window.state()
    if (state.isWaitingForAI) return

    switch (e.id) {
      case 'plwd-accept-btn':
        return Promise.all([window.acceptEvent(), window.notify('Accepted', '✓', '#4db6ac')])

      case 'plwd-drop-btn':
        return window.dropEvent()

      case 'plwd-clear-btn':
        return window.clearAll()

      case 'plwd-dry-run-btn':
        return Promise.all([window.dryRun(), window.notify('Dry Run', '🚀', '#e5c07b')])
    }

    if (['INPUT', 'TEXTAREA'].includes(e.nodeName)) {
      return performInput(e as HTMLInputElement)
    }

    return performClick(e)
  })

  document.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimeout)
  })

  document.addEventListener('mouseout', () => {
    clearTimeout(hoverTimeout)
  })

  document.addEventListener('mouseover', (event) => {
    clearTimeout(hoverTimeout)

    const e = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement
    if (e.nodeName === 'IFRAME') return

    hoverTimeout = setTimeout(async () => {
      const e = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement
      if (!e.id.startsWith('plwd')) {
        return window.emit({ name: 'hover', params: { ...getElementMap(e), duration: 1000 } })
      }
    }, 3000)
  })
}

/**
 * Set up the PlayWord panel.
 *
 * @param css The style sheet to apply to the PlayWord panel
 */
export const setPanel = (css: string) => {
  document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style')
    style.textContent = css
    document.head.appendChild(style)

    const banner = document.createElement('div')
    banner.id = 'plwd-banner'
    banner.innerText = 'PlayWord'

    const loaderBox = document.createElement('div')
    loaderBox.id = 'plwd-loader-box'

    const input = document.createElement('input')
    input.id = 'plwd-input'
    input.placeholder = 'Step Description'

    const acceptBtn = document.createElement('button')
    acceptBtn.id = 'plwd-accept-btn'
    acceptBtn.innerText = '✓ Accept (a)'
    acceptBtn.setAttribute('title', 'Add the step to the test case')

    const dropBtn = document.createElement('button')
    dropBtn.id = 'plwd-drop-btn'
    dropBtn.innerText = '✕ Cancel (c)'
    dropBtn.setAttribute('title', 'Undo the step')

    const inputBox = document.createElement('div')
    inputBox.id = 'plwd-input-box'
    inputBox.appendChild(input)
    inputBox.appendChild(loaderBox)
    inputBox.appendChild(dropBtn)
    inputBox.appendChild(acceptBtn)

    const timeline = document.createElement('ul')
    timeline.id = 'plwd-timeline'

    const dryRunBtn = document.createElement('button')
    dryRunBtn.id = 'plwd-dry-run-btn'
    dryRunBtn.innerText = 'Dry Run'

    const clearBtn = document.createElement('button')
    clearBtn.id = 'plwd-clear-btn'
    clearBtn.innerText = 'Clear All'

    const previewTitle = document.createElement('p')
    previewTitle.id = 'plwd-preview-title'
    previewTitle.innerText = 'Test Case Preview'

    const preview = document.createElement('div')
    preview.id = 'plwd-preview'
    preview.appendChild(previewTitle)
    preview.appendChild(dryRunBtn)
    preview.appendChild(clearBtn)
    preview.appendChild(timeline)

    const toastIcon = document.createElement('div')
    toastIcon.id = 'plwd-toast-icon'

    const toastContent = document.createElement('div')
    toastContent.id = 'plwd-toast-content'

    const panel = document.createElement('div')
    panel.id = 'plwd-panel'
    panel.appendChild(banner)
    panel.appendChild(inputBox)
    panel.appendChild(preview)
    document.body.appendChild(panel)

    const toast = document.createElement('div')
    toast.id = 'plwd-toast'
    toast.appendChild(toastIcon)
    toast.appendChild(toastContent)
    document.body.appendChild(toast)
  })
}

/**
 * Preview the recorded test steps in the PlayWord panel.
 *
 * @param e The target element to display the test case preview
 * @param recordings The list of recording to display. See {@link Recording} for details.
 */
export const setTestCasePreview = (e: HTMLElement, recordings: Recording[]) => {
  e.replaceChildren(...[])

  for (const step of recordings) {
    const item = document.createElement('li')
    const marker = document.createElement('span')
    const text = document.createTextNode(step.input)

    if ('success' in step.actions[0]) {
      marker.innerText = step.actions[0].success ? '✓' : '✕'
      marker.style.color = step.actions[0].success ? '#26a69a' : '#f44336'
    }

    marker.classList.add('plwd-marker')
    item.classList.add('plwd-timeline-item')

    item.appendChild(marker)
    item.appendChild(text)
    e.appendChild(item)
  }
}

/**
 * Display a toast message.
 *
 * @param message.content The message text to display in the notification.
 * @param message.icon The icon to display in the notification.
 * @param message.color The text color for the notification. Accepts color names or HEX values (e.g., `#ffffff`).
 */
export const showMessage = (message: { content: string; icon: string; color: string }) => {
  const content = document.getElementById('plwd-toast-content')
  const icon = document.getElementById('plwd-toast-icon')
  const toast = document.querySelector('#plwd-toast:not(.open)') as HTMLElement

  if (content && icon && toast) {
    content.innerText = message.content
    icon.innerText = message.icon
    toast.style.color = message.color
    toast.classList.add('open')
    setTimeout(() => toast.classList.remove('open'), 1900)
  }
}

/**
 * Enable or disable the loader in the PlayWord panel.
 *
 * @param e The target element to display the loader
 * @param on A boolean indicating whether to display the loader
 */
export const toggleLoader = (e: HTMLElement, on: boolean) => {
  e.replaceChildren(...[])

  if (!on) return

  const loader = document.createElement('div')
  loader.id = 'plwd-loader'

  e.appendChild(loader)
}
