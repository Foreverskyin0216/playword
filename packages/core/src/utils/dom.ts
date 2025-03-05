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
import type { ElementLocation, Recording } from '../types'

/**
 * Adds a class to a given element.
 *
 * @param element The provided element.
 * @param className The class to add.
 */
export const addClass = (element: HTMLElement, className: string) => {
  element.classList.add(className)
}

/**
 * Clears all browser caches.
 */
export const clearCaches = async () => {
  const keys = await caches.keys()
  await Promise.all(keys.map((key) => caches.delete(key)))
}

/**
 * Clears all indexedDB databases.
 */
export const clearIndexedDB = async () => {
  const databases = await indexedDB.databases()
  databases.filter((db) => db.name).map((db) => indexedDB.deleteDatabase(db.name!))
}

/**
 * Clears the local and session storage.
 */
export const clearStorage = () => {
  localStorage.clear()
  sessionStorage.clear()
}

/**
 * Clears all service workers.
 */
export const clearServiceWorkers = async () => {
  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((registration) => registration.unregister()))
}

/**
 * Retrieves all the locations of the target elements on the page.
 *
 * @param types The types of elements to generate locations for.
 * @returns The list of element locations. See {@link ElementLocation} for details.
 */
export const getElementLocations = (types: string[]) => {
  const elements = document.querySelectorAll('*:not(head):not(script):not(style)')
  const locations = [] as ElementLocation[]

  /**
   * Retrieves the XPath for a given element.
   *
   * @param element The target element.
   */
  const getElementXPath = (element: Element) => {
    const nodes: string[] = []

    for (; element && element.nodeType == 1; element = element.parentNode as Element) {
      let position = 1

      for (let sib = element.previousSibling; sib; sib = sib.previousSibling) {
        if (sib.nodeType === 1 && sib.nodeName === element.nodeName) position++
      }

      nodes.unshift(`${element.nodeName.toLowerCase()}[${position}]`)
    }

    return '//' + nodes.join('/')
  }

  /**
   * Check if an element is in the allowed list and visible.
   *
   * @param e The target element.
   */
  const isAllowed = (e: Element) => {
    if (!types.includes(e.nodeName.toLowerCase())) {
      return false
    }

    return e?.checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true, contentVisibilityAuto: true }) ?? true
  }

  for (const element of elements) {
    if (!isAllowed(element)) continue

    const clone = element.cloneNode(true) as Element
    clone.innerHTML = [...clone.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.nodeValue)
      .join('')
      .trim()

    if (clone.outerHTML.length > 1000) continue

    locations.push({ html: clone.outerHTML, xpath: getElementXPath(element) })
  }

  return locations
}

/**
 * Checks if an element has a specific class.
 *
 * @param element The provided element.
 * @param className The class to check for.
 */
export const hasClass = (element: HTMLElement, className: string) => {
  return element.classList.contains(className)
}

/**
 * Removes a class from a given element.
 *
 * @param element The provided element.
 * @param className The class to remove.
 */
export const removeClass = (element: HTMLElement, className: string) => {
  element.classList.remove(className)
}

/**
 * Sets an attribute on a given element.
 *
 * @param element The provided element.
 * @param param.name The name of the attribute to set.
 * @param param.value The value to set for the attribute. If the value is falsy, the attribute will be removed.
 */
export const setAttribute = (element: HTMLElement, { name, value }: { name: string; value: boolean | string }) => {
  if (name === 'value' && element instanceof HTMLInputElement) {
    element.value = value.toString()
  } else if (value) {
    element.setAttribute(name, value.toString())
  } else {
    element.removeAttribute(name)
  }
}

/**
 * Sets up the required event listeners for the PlayWord observer.
 *
 * This function attaches listeners to handle specific user interactions and translates
 * them into corresponding observer actions. These listeners are used to monitor and control
 * interactions on the page.
 *
 * **Handled Events:**
 *
 * ### change
 * Listens for changes on `select` and `input` elements.
 * - For `select` elements: Emits a `select` action when an option is selected.
 * - For `input` elements: Updates the input value in real-time for the `#plwd-input` element.
 *
 * ### keydown
 * Monitors keypresses to:
 * - Determine whether actions are accepted or dropped.
 * - Control the progress of dry runs.
 *
 * If the PlayWord panel is closed or the user is typing in the input field, the keypress will be ignored.
 *
 * ### mousedown
 * Listens for clicks on all elements on the page, except for elements within the PlayWord panel.
 * - If the target element is an `input` or `textarea` with a value:
 *   - Emits an `input` action.
 * - If the target element is an `input` (but not a standard input type):
 *   - Emits a `click` action.
 * - For all other elements:
 *   - Emits a `click` action.
 *
 * ### mouseover
 * Monitors hover actions over elements on the page, excluding elements within the PlayWord panel.
 * - Initiates a timeout to emit a `hover` action after 3 seconds.
 * - If the user moves the cursor before the timeout expires or performs another action:
 *   - The timeout is cleared, and no action is emitted.
 */
export const setEventListeners = () => {
  window.__name = (fn: unknown) => fn
  let hoverTimeout: NodeJS.Timeout | undefined

  /**
   * Blocks an event from propagating and prevent its default behavior.
   *
   * @param event The event to block.
   */
  const blockEvent = (event: Event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  /**
   * Retrieves the element location details for a given element.
   *
   * @param element The target element.
   */
  const getElementMap = (element: HTMLElement) => {
    const clone = element.cloneNode(true) as Element
    const texts = [...clone.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue)
    const attributes = [...clone.attributes].map((attr) => `${attr.name}="${attr.value}"`)
    const node = element.nodeName.toLowerCase()
    return {
      frameSrc: getFrameSrc(),
      html: `<${node} ${attributes.join(' ')}>${texts.join(' ').trim()}</${node}>`,
      xpath: getElementXPath(element) as string
    }
  }

  /**
   * Retrieves the XPath for a given element.
   *
   * @param element The target element.
   */
  const getElementXPath = (element: Element) => {
    const nodes: string[] = []

    for (; element && element.nodeType == 1; element = element.parentNode as Element) {
      let position = 1

      for (let sib = element.previousSibling; sib; sib = sib.previousSibling) {
        if (sib.nodeType === 1 && sib.nodeName === element.nodeName) position++
      }

      nodes.unshift(`${element.nodeName.toLowerCase()}[${position}]`)
    }

    return '//' + nodes.join('/')
  }

  /**
   * Retrieves the source URL for the current frame.
   */
  const getFrameSrc = () => {
    if (window.self === window.top) return

    const { origin, pathname, search, hash } = new URL(document.location.href)

    return origin + decodeURIComponent(pathname) + search + hash
  }

  /**
   * Emits a `click` event for a given element.
   *
   * @param element The target element.
   */
  const performClick = async (element: HTMLElement) => {
    return window.emit({ name: 'click', params: { ...getElementMap(element) } })
  }

  /**
   * For elements that can be typed into, emits an `input` event.
   *
   * For other elements that has no input, emits a `click` event.
   *
   * @param element The target input element.
   */
  const performInput = async (element: HTMLInputElement) => {
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

    if (!element.value) return

    if (inputTypes.includes(element.type) || element.nodeName === 'TEXTAREA') {
      return window.emit({ name: 'input', params: { ...getElementMap(element), text: element.value } })
    }

    return window.emit({ name: 'click', params: { ...getElementMap(element) } })
  }

  document.addEventListener('change', (event) => {
    clearTimeout(hoverTimeout)

    const element = event.target as HTMLSelectElement

    if (element.nodeName === 'SELECT') {
      return window.emit({ name: 'select', params: { ...getElementMap(element), option: element.value } })
    }

    if (element.className === 'plwd-input') {
      return window.updateInput(element.value)
    }
  })

  document.addEventListener('click', (event) => {
    const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement

    clearTimeout(hoverTimeout)

    if (element.className.startsWith('plwd') && element.nodeName !== 'INPUT') {
      blockEvent(event)
    }
  })

  document.addEventListener('keydown', (event) => {
    const closedPanel = document.querySelector('.plwd-panel:not(.open)')
    const { activeElement } = document

    clearTimeout(hoverTimeout)

    if (event.key === 'Escape') {
      return window.stopDryRun()
    }

    if (activeElement?.className === 'plwd-input' || closedPanel) {
      return
    }

    blockEvent(event)

    if (['A', 'a'].includes(event.key)) {
      return window.accept()
    }

    if (['C', 'c'].includes(event.key)) {
      return window.cancel()
    }
  })

  document.addEventListener('mousedown', (event) => {
    const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement

    clearTimeout(hoverTimeout)

    if (element.className.startsWith('plwd') && element.className !== 'plwd-input') {
      blockEvent(event)
    }
  })

  document.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimeout)
  })

  document.addEventListener('mouseout', () => {
    clearTimeout(hoverTimeout)
  })

  document.addEventListener('mouseover', (event) => {
    clearTimeout(hoverTimeout)

    const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement
    if (element.nodeName === 'IFRAME') return

    hoverTimeout = setTimeout(async () => {
      const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement
      if (!element.className.startsWith('plwd')) {
        return window.emit({ name: 'hover', params: { ...getElementMap(element), duration: 1000 } })
      }
    }, 3000)
  })

  document.addEventListener('mouseup', (event) => {
    const actived = document.activeElement as HTMLElement
    const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement

    clearTimeout(hoverTimeout)

    if (element.className.startsWith('plwd') && element.nodeName !== 'INPUT') {
      blockEvent(event)
    }

    if (['SELECT', 'OPTION'].includes(element.nodeName) || !actived) {
      return
    }

    if (['INPUT', 'TEXTAREA'].includes(actived.nodeName) && !['INPUT', 'TEXTAREA'].includes(element.nodeName)) {
      actived.blur()
    }

    if (element.classList.contains('plwd-accept-btn')) {
      return window.accept()
    }

    if (element.classList.contains('plwd-cancel-btn')) {
      return window.cancel()
    }

    if (element.classList.contains('plwd-clear-btn')) {
      return window.clearAll()
    }

    if (element.classList.contains('plwd-delete-btn')) {
      return window.deleteStep(parseInt(element.getAttribute('data-index') as string))
    }

    if (element.classList.contains('plwd-dry-run-btn')) {
      return window.dryRun()
    }

    if (['INPUT', 'TEXTAREA'].includes(element.nodeName)) {
      return performInput(element as HTMLInputElement)
    }

    return performClick(element)
  })
}

/**
 * Sets up the PlayWord panel.
 *
 * @param css The style sheet to apply to the PlayWord panel.
 */
export const setPanel = (css: string) => {
  window.addEventListener('load', () => {
    const style = document.createElement('style')
    style.textContent = css
    document.body.appendChild(style)

    const banner = document.createElement('div')
    banner.classList.add('plwd-banner')
    banner.innerText = 'PlayWord'

    const loaderBox = document.createElement('div')
    loaderBox.classList.add('plwd-loader-box')

    const input = document.createElement('input')
    input.classList.add('plwd-input')
    input.placeholder = 'Step Description'

    const acceptBtn = document.createElement('button')
    acceptBtn.classList.add('plwd-accept-btn')
    acceptBtn.innerText = '✓ Accept (a)'
    acceptBtn.setAttribute('title', 'Add the step to the test case')

    const cancelBtn = document.createElement('button')
    cancelBtn.classList.add('plwd-cancel-btn')
    cancelBtn.innerText = '✕ Cancel (c)'
    cancelBtn.setAttribute('title', 'Undo the step')

    const inputBox = document.createElement('div')
    inputBox.classList.add('plwd-input-box')
    inputBox.appendChild(input)
    inputBox.appendChild(loaderBox)
    inputBox.appendChild(cancelBtn)
    inputBox.appendChild(acceptBtn)

    const timeline = document.createElement('ul')
    timeline.classList.add('plwd-timeline')

    const dryRunBtn = document.createElement('button')
    dryRunBtn.classList.add('plwd-dry-run-btn')
    dryRunBtn.innerText = 'Dry Run'

    const clearBtn = document.createElement('button')
    clearBtn.classList.add('plwd-clear-btn')
    clearBtn.innerText = 'Clear All'

    const previewTitle = document.createElement('p')
    previewTitle.classList.add('plwd-preview-title')
    previewTitle.innerText = 'Test Case Preview'

    const preview = document.createElement('div')
    preview.classList.add('plwd-preview')
    preview.appendChild(previewTitle)
    preview.appendChild(dryRunBtn)
    preview.appendChild(clearBtn)
    preview.appendChild(timeline)

    const toastIcon = document.createElement('div')
    toastIcon.classList.add('plwd-toast-icon')

    const toastContent = document.createElement('div')
    toastContent.classList.add('plwd-toast-content')

    const panel = document.createElement('div')
    panel.classList.add('plwd-panel')
    panel.appendChild(banner)
    panel.appendChild(inputBox)
    panel.appendChild(preview)
    document.body.appendChild(panel)

    const toast = document.createElement('div')
    toast.classList.add('plwd-toast')
    toast.appendChild(toastIcon)
    toast.appendChild(toastContent)
    document.body.appendChild(toast)
  })
}

/**
 * Previews the recorded test steps in the PlayWord panel.
 *
 * @param element The target element to display the test case preview.
 * @param recordings The list of recording to display. See {@link Recording} for details.
 */
export const setTestCasePreview = (element: HTMLElement, recordings: Recording[]) => {
  const createDeleteButton = (index: number) => {
    const trashLid = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    trashLid.classList.add('plwd-trash-lid')
    trashLid.setAttribute('d', 'M6 15l4 0 0-3 8 0 0 3 4 0 0 2 -16 0zM12 14l4 0 0 1 -4 0z')
    trashLid.setAttribute('fill-rule', 'evenodd')

    const trashCan = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    trashCan.classList.add('plwd-trash-can')
    trashCan.setAttribute('d', 'M8 17h2v9h8v-9h2v9a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z')

    const trashIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    trashIcon.classList.add('plwd-trash-icon')
    trashIcon.setAttribute('viewBox', '3 6 24 28')
    trashIcon.appendChild(trashLid)
    trashIcon.appendChild(trashCan)

    const deleteBtn = document.createElement('button')
    deleteBtn.classList.add('plwd-delete-btn')
    deleteBtn.setAttribute('data-index', index.toString())
    deleteBtn.appendChild(trashIcon)

    return deleteBtn
  }

  element.replaceChildren(...[])

  for (const [index, step] of recordings.entries()) {
    const deleteBtn = createDeleteButton(index)
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
    item.appendChild(deleteBtn)
    element.appendChild(item)
  }
}

/**
 * Displays a toast message.
 *
 * @param message The message to display. It should contain the following properties:
 * - content: The content to display in the notification.
 * - icon: The icon to display in the notification.
 * - color: The color of the notification.
 */
export const showMessage = (message: { content: string; icon: string; color: string }) => {
  const content = document.querySelector('.plwd-toast-content') as HTMLElement
  const icon = document.querySelector('.plwd-toast-icon') as HTMLElement
  const toast = document.querySelector('.plwd-toast:not(.open)') as HTMLElement

  if (content && icon && toast) {
    content.innerText = message.content
    icon.innerText = message.icon
    toast.style.color = message.color
    toast.classList.add('open')
    setTimeout(() => toast.classList.remove('open'), 1900)
  }
}

/**
 * Enables or disables the loader in the PlayWord panel.
 *
 * @param element The target element to display the loader.
 * @param on A boolean indicating whether to display the loader.
 */
export const toggleLoader = (element: HTMLElement, on: boolean) => {
  element.replaceChildren(...[])
  if (!on) return

  const loader = document.createElement('div')
  loader.classList.add('plwd-loader')

  element.appendChild(loader)
}
