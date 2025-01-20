import { readFileSync } from 'fs'
import { join } from 'path'
import { type MockInstance, afterAll, afterEach, beforeAll, describe, test, expect, vi } from 'vitest'
import * as utils from '../../../packages/core/src/utils'

/**
 * @vitest-environment jsdom
 */

describe('Spec: DOM Utils', () => {
  const html = readFileSync(join(__dirname, '../mocks/mockObserverUI.html'), 'utf-8')
  document.documentElement.innerHTML = html

  const mockAcceptEvent = vi.fn()
  const mockClearAll = vi.fn()
  const mockDropEvent = vi.fn()
  const mockDryRun = vi.fn()
  const mockElementFromPoint = vi.fn()
  const mockEmit = vi.fn()
  const mockNotify = vi.fn()
  const mockState = vi.fn()
  const mockUpdateInput = vi.fn()

  document.elementFromPoint = mockElementFromPoint

  window.acceptEvent = mockAcceptEvent
  window.clearAll = mockClearAll
  window.dropEvent = mockDropEvent
  window.dryRun = mockDryRun
  window.emit = mockEmit
  window.notify = mockNotify
  window.state = mockState
  window.updateInput = mockUpdateInput

  describe('Given the addClass function', () => {
    describe('When it is called with an element and a class name', () => {
      const div = document.createElement('div')

      beforeAll(() => utils.addClass(div, 'test'))

      test('Then it should add the class name to the element', () => {
        expect(div.classList.contains('test')).toBe(true)
      })
    })
  })

  describe('Given the hasClass function', () => {
    describe('When it is called with an element and a class name', () => {
      const div = document.createElement('div')

      beforeAll(() => div.classList.add('test'))

      test('Then it should return true if the element has the class name', () => {
        expect(utils.hasClass(div, 'test')).toBe(true)
      })
    })
  })

  describe('Given the removeClass function', () => {
    describe('When it is called with an element and a class name', () => {
      const div = document.createElement('div')

      beforeAll(() => {
        div.classList.add('test')
        utils.removeClass(div, 'test')
      })

      test('Then it should remove the class name from the element', () => {
        expect(div.classList.contains('test')).toBe(false)
      })
    })
  })

  describe('Given the setAttribute function', () => {
    describe('When it is called with an element, an attribute name, and a value', () => {
      const div = document.createElement('div')

      beforeAll(() => utils.setAttribute(div, { name: 'data-test', value: 'test' }))

      test('Then it should set the attribute value to the element', () => {
        expect(div.getAttribute('data-test')).toBe('test')
      })
    })

    describe('When it is called with an element, an attribute name, and a value that is false', () => {
      const div = document.createElement('div')

      beforeAll(() => utils.setAttribute(div, { name: 'data-test', value: false }))

      test('Then it should remove the attribute from the element', () => {
        expect(div.getAttribute('data-test')).toBeNull()
      })
    })

    describe('When it is called with an element, an attribute named "value" and a value', () => {
      const input = document.createElement('input')

      beforeAll(() => utils.setAttribute(input, { name: 'value', value: 'input-value' }))

      test('Then it should set the attribute value to the element', () => {
        expect(input.value).toBe('input-value')
      })
    })
  })

  describe('Given the setEventListeners function', () => {
    beforeAll(() => {
      utils.setEventListeners()
      window.__name(() => {})
    })

    describe('And a change event is triggered', () => {
      const event = new Event('change', { bubbles: true })

      describe('When the target is a select element', () => {
        const select = document.createElement('select')

        afterAll(() => select.remove())

        afterEach(() => mockEmit.mockReset())

        test('Then it should emit a select event', async () => {
          document.body.appendChild(select)

          select.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockEmit).toBeCalledWith({
            name: 'select',
            params: {
              frameSrc: undefined,
              html: '<select ></select>',
              option: '',
              xpath: '//html[1]/body[1]/select[1]'
            }
          })
        })
      })

      describe('When the target is the PlayWord input element', () => {
        const input = document.getElementById('plwd-input') as HTMLInputElement

        afterEach(() => mockUpdateInput.mockReset())

        test('Then it should call the updateInput()', async () => {
          input.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockUpdateInput).toBeCalledWith(input.value)
        })
      })
    })

    describe('And a keydown event is triggered', () => {
      describe('When the PlayWord panel is closed', () => {
        const event = new KeyboardEvent('keydown', { key: 'Escape' })

        afterEach(() => {
          mockAcceptEvent.mockReset()
          mockDropEvent.mockReset()
          mockNotify.mockReset()
        })

        test('Then it should not call any method', async () => {
          document.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockAcceptEvent).not.toBeCalled()
          expect(mockDropEvent).not.toBeCalled()
          expect(mockNotify).not.toBeCalled()
        })
      })

      describe('When the key is "a"', () => {
        const event = new KeyboardEvent('keydown', { key: 'a' })
        const panel = document.getElementById('plwd-panel') as HTMLDivElement

        beforeAll(() => utils.addClass(panel, 'open'))

        afterAll(() => utils.removeClass(panel, 'open'))

        afterEach(() => {
          mockAcceptEvent.mockReset()
          mockNotify.mockReset()
        })

        test('Then it should call the acceptEvent() and notify() with the correct parameters', async () => {
          document.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockAcceptEvent).toBeCalled()
          expect(mockNotify).toBeCalledWith('Accepted', '✓', '#4db6ac')
        })
      })

      describe('When the key is "c"', () => {
        const event = new KeyboardEvent('keydown', { key: 'c' })
        const panel = document.getElementById('plwd-panel') as HTMLDivElement

        beforeAll(() => utils.addClass(panel, 'open'))

        afterAll(() => utils.removeClass(panel, 'open'))

        afterEach(() => mockDropEvent.mockReset())

        test('Then it should call the dropEvent()', async () => {
          document.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockDropEvent).toBeCalled()
        })
      })
    })

    describe('And a mousedown event is triggered', () => {
      const event = new MouseEvent('mousedown', { bubbles: true })

      describe('When the target is a select element or its option', () => {
        const select = document.createElement('select')
        const option = document.createElement('option')

        beforeAll(() => {
          select.appendChild(option)
          document.body.appendChild(select)
        })

        afterAll(() => select.remove())

        afterEach(() => {
          mockElementFromPoint.mockReset()
          mockEmit.mockReset()
        })

        test('Then it should not call the emit()', async () => {
          mockElementFromPoint.mockReturnValue(select)
          select.dispatchEvent(event)

          mockElementFromPoint.mockReturnValue(option)
          option.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockEmit).not.toBeCalled()
        })
      })

      describe('When the target is a input or textarea element', () => {
        const input = document.createElement('input')
        const textarea = document.createElement('textarea')

        beforeAll(() => {
          document.body.appendChild(input)
          document.body.appendChild(textarea)
        })

        afterAll(() => {
          input.remove()
          textarea.remove()
        })

        afterEach(() => {
          mockElementFromPoint.mockReset()
          mockEmit.mockReset()
          mockState.mockReset()
        })

        test('Then it should call the emit() if the input has a value', async () => {
          input.type = 'text'
          input.value = 'input-value'

          mockElementFromPoint.mockReturnValue(input)
          mockState.mockResolvedValue({ isWaitingForAI: false })

          input.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockEmit).toBeCalledWith({
            name: 'input',
            params: {
              frameSrc: undefined,
              html: '<input type="text"></input>',
              text: 'input-value',
              xpath: '//html[1]/body[1]/input[1]'
            }
          })
        })

        test('Then it should call the emit() if the textarea has a value', async () => {
          textarea.value = 'textarea-value'

          mockElementFromPoint.mockReturnValue(textarea)
          mockState.mockResolvedValue({ isWaitingForAI: false })

          textarea.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockEmit).toBeCalledWith({
            name: 'input',
            params: {
              frameSrc: undefined,
              html: '<textarea ></textarea>',
              text: 'textarea-value',
              xpath: '//html[1]/body[1]/textarea[1]'
            }
          })
        })

        test('Then it shoulld call the click-type emit() if the input cannot be typed', async () => {
          input.type = 'submit'
          input.value = 'submit-value'

          mockElementFromPoint.mockReturnValue(input)
          mockState.mockResolvedValue({ isWaitingForAI: false })

          input.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockEmit).toBeCalledWith({
            name: 'click',
            params: {
              frameSrc: undefined,
              html: '<input type="submit" value="submit-value"></input>',
              xpath: '//html[1]/body[1]/input[1]'
            }
          })
        })

        test('Then it should not call the emit() if the input has no value', async () => {
          input.value = ''

          mockElementFromPoint.mockReturnValue(input)
          mockState.mockResolvedValue({ isWaitingForAI: false })

          input.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockEmit).not.toBeCalled()
        })
      })

      describe('When the target is a p element', () => {
        const input = document.createElement('input')
        const p = document.createElement('p')

        const mockBlur = vi.fn()

        beforeAll(() => {
          document.body.appendChild(input)
          document.body.appendChild(p)
        })

        afterAll(() => {
          input.remove()
          p.remove()
        })

        afterEach(() => {
          mockBlur.mockReset()
          mockElementFromPoint.mockReset()
          mockEmit.mockReset()
          mockState.mockReset()
        })

        test('Then it should call the blur() and emit() if the input is focused', async () => {
          input.blur = mockBlur
          input.focus()

          mockElementFromPoint.mockReturnValue(p)
          mockState.mockResolvedValue({ isWaitingForAI: false })

          document.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockBlur).toBeCalled()
          expect(mockEmit).toBeCalledWith({
            name: 'click',
            params: {
              frameSrc: undefined,
              html: '<p ></p>',
              xpath: '//html[1]/body[1]/p[1]'
            }
          })
        })
      })

      describe('When the target is in the PlayWord panel', () => {
        const acceptButton = document.getElementById('plwd-accept-btn') as HTMLButtonElement
        const clearButton = document.getElementById('plwd-clear-btn') as HTMLButtonElement
        const dropButton = document.getElementById('plwd-drop-btn') as HTMLButtonElement
        const dryRunButton = document.getElementById('plwd-dry-run-btn') as HTMLButtonElement
        const panel = document.getElementById('plwd-panel') as HTMLDivElement

        afterEach(() => {
          mockAcceptEvent.mockReset()
          mockClearAll.mockReset()
          mockDropEvent.mockReset()
          mockDryRun.mockReset()
          mockElementFromPoint.mockReset()
          mockNotify.mockReset()
          mockState.mockReset()
        })

        test('Then it should call the acceptEvent() and notify() if the accept button is clicked', async () => {
          mockElementFromPoint.mockReturnValue(acceptButton)
          mockState.mockResolvedValue({ isWaitingForAI: false })

          document.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockAcceptEvent).toBeCalled()
          expect(mockNotify).toBeCalledWith('Accepted', '✓', '#4db6ac')
        })

        test('Then it should call the clearAll() if the clear button is clicked', async () => {
          mockElementFromPoint.mockReturnValue(clearButton)
          mockState.mockResolvedValue({ isWaitingForAI: false })

          document.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockClearAll).toBeCalled()
        })

        test('Then it should call the dropEvent() if the drop button is clicked', async () => {
          mockElementFromPoint.mockReturnValue(dropButton)
          mockState.mockResolvedValue({ isWaitingForAI: false })

          document.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockDropEvent).toBeCalled()
        })

        test('Then it should call the dryRun() and notify() if the dry run button is clicked', async () => {
          mockElementFromPoint.mockReturnValue(dryRunButton)
          mockState.mockResolvedValue({ isWaitingForAI: false })

          document.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockDryRun).toBeCalled()
          expect(mockNotify).toBeCalledWith('Dry Run', '🚀', '#e5c07b')
        })

        test('Then it should not call any action if the AI is waiting for a response', async () => {
          mockElementFromPoint.mockReturnValue(acceptButton)
          mockState.mockResolvedValue({ isWaitingForAI: true })

          document.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockAcceptEvent).not.toBeCalled()
          expect(mockNotify).not.toBeCalled()
        })

        test('Then it should not call any action if the target is not a button', async () => {
          mockElementFromPoint.mockReturnValue(panel)
          mockState.mockResolvedValue({ isWaitingForAI: false })

          document.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockAcceptEvent).not.toBeCalled()
          expect(mockClearAll).not.toBeCalled()
          expect(mockDropEvent).not.toBeCalled()
          expect(mockDryRun).not.toBeCalled()
        })
      })

      describe('When the target is in an iframe', () => {
        const span = document.createElement('span')
        let windowSpy: MockInstance<() => Window>

        beforeAll(() => {
          document.body.appendChild(span)
          windowSpy = vi.spyOn(window, 'top', 'get').mockReturnValue('' as unknown as Window)
        })

        afterAll(() => {
          span.remove()
          windowSpy.mockRestore()
        })

        afterEach(() => {
          mockElementFromPoint.mockReset()
          mockEmit.mockReset()
        })

        test('Then it should call the emit() with the frameSrc parameter', async () => {
          mockElementFromPoint.mockReturnValue(span)
          mockState.mockResolvedValue({ isWaitingForAI: false })

          document.dispatchEvent(event)

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockEmit).toBeCalledWith({
            name: 'click',
            params: {
              frameSrc: 'http://localhost:3000/',
              html: '<span ></span>',
              xpath: '//html[1]/body[1]/span[1]'
            }
          })
        })
      })
    })

    describe('And a mouseleave event is triggered', () => {
      const event = new MouseEvent('mouseleave', { bubbles: true })
      let clearTimeoutSpy: MockInstance<typeof clearTimeout>

      beforeAll(() => (clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')))

      afterAll(() => clearTimeoutSpy.mockRestore())

      test('Then it should call the clearTimeout()', async () => {
        document.dispatchEvent(event)

        // Wait for the next tick
        await new Promise(process.nextTick)

        expect(clearTimeoutSpy).toBeCalled()
      })
    })

    describe('And a mouseout event is triggered', () => {
      const event = new MouseEvent('mouseout', { bubbles: true })
      let clearTimeoutSpy: MockInstance<typeof clearTimeout>

      beforeAll(() => (clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')))

      afterAll(() => clearTimeoutSpy.mockRestore())

      test('Then it should call the clearTimeout()', async () => {
        document.dispatchEvent(event)

        // Wait for the next tick
        await new Promise(process.nextTick)

        expect(clearTimeoutSpy).toBeCalled()
      })
    })

    describe('And a mouseover event is triggered', () => {
      const event = new MouseEvent('mouseover', { bubbles: true })
      const heading = document.createElement('h1')
      const iframe = document.createElement('iframe')

      let setTimeoutSpy: MockInstance<typeof setTimeout>

      beforeAll(() => {
        document.body.appendChild(heading)
        document.body.appendChild(iframe)
        setTimeoutSpy = vi.spyOn(window, 'setTimeout')
        vi.useFakeTimers()
      })

      afterAll(() => {
        heading.remove()
        iframe.remove()
        setTimeoutSpy.mockRestore()
        vi.useRealTimers()
      })

      afterEach(() => {
        mockElementFromPoint.mockReset()
        mockEmit.mockReset()
      })

      test('Then it should call the setTimeout() and the emit() with the correct parameters', async () => {
        mockElementFromPoint.mockReturnValue(heading)

        heading.dispatchEvent(event)

        vi.advanceTimersByTime(3000)

        // Wait for the next tick
        await new Promise(process.nextTick)

        expect(setTimeoutSpy).toBeCalled()
        expect(mockEmit).toBeCalledWith({
          name: 'hover',
          params: {
            duration: 1000,
            frameSrc: undefined,
            html: '<h1 ></h1>',
            xpath: '//html[1]/body[1]/h1[1]'
          }
        })
      })

      test('Then it should not call the emit() if the target is an iframe', async () => {
        mockElementFromPoint.mockReturnValue(iframe)

        iframe.dispatchEvent(event)

        vi.advanceTimersByTime(3000)

        // Wait for the next tick
        await new Promise(process.nextTick)

        expect(mockEmit).not.toBeCalled()
      })
    })
  })

  describe('Given the setPanel function', () => {
    const originalBody = document.body.innerHTML

    beforeAll(() => {
      document.body.innerHTML = ''
      utils.setPanel('')
    })

    afterAll(() => (document.body.innerHTML = originalBody))

    describe('When the DOMContentLoaded event is triggered', () => {
      const event = new Event('DOMContentLoaded', { bubbles: true })

      test('Then it should set the panel content', async () => {
        document.dispatchEvent(event)

        // Wait for the next tick
        await new Promise(process.nextTick)

        const html = document.body.innerHTML

        expect(html).contains('plwd-accept-btn')
        expect(html).contains('plwd-banner')
        expect(html).contains('plwd-clear-btn')
        expect(html).contains('plwd-drop-btn')
        expect(html).contains('plwd-dry-run-btn')
        expect(html).contains('plwd-input')
        expect(html).contains('plwd-input-box')
        expect(html).contains('plwd-loader-box')
        expect(html).contains('plwd-panel')
        expect(html).contains('plwd-preview')
        expect(html).contains('plwd-preview-title')
        expect(html).contains('plwd-timeline')
        expect(html).contains('plwd-toast')
        expect(html).contains('plwd-toast-content')
        expect(html).contains('plwd-toast-icon')
      })
    })
  })

  describe('Given the setTestCasePreview function', () => {
    const timeline = document.getElementById('plwd-timeline') as HTMLDivElement
    const mockRecordings = [
      {
        input: 'input-value',
        actions: [
          {
            name: 'click',
            params: { xpath: '//html[1]/body[1]/button[1]' },
            success: true
          }
        ]
      },
      {
        input: 'input-value',
        actions: [
          {
            name: 'hover',
            params: { xpath: '//html[1]/body[1]/span[1]' },
            success: false
          }
        ]
      }
    ]

    beforeAll(() => utils.setTestCasePreview(timeline, mockRecordings))

    describe('When the recordings are set', () => {
      test('Then it should display the recordings in the timeline', () => {
        const timelineItems = timeline.querySelectorAll('.plwd-timeline-item') as NodeListOf<HTMLLIElement>
        expect(timelineItems.length).toBe(2)

        const markers = timeline.querySelectorAll('.plwd-marker') as NodeListOf<HTMLDivElement>
        expect(markers.length).toBe(2)

        expect(markers[0].innerText).toBe('✓')
        expect(markers[1].innerText).toBe('✕')

        expect(markers[0].style.color).toBe('rgb(38, 166, 154)')
        expect(markers[1].style.color).toBe('rgb(244, 67, 54)')
      })
    })
  })

  describe('Given the showMessage function', () => {
    beforeAll(() => vi.useFakeTimers())

    afterAll(() => vi.useRealTimers())

    describe('When the notification is displayed', () => {
      beforeAll(() => utils.showMessage({ content: 'Test Message', icon: '✓', color: '#4db6ac' }))

      test('Then it should display the message in the toast notification', () => {
        const content = document.getElementById('plwd-toast-content') as HTMLDivElement
        expect(content.innerText).toBe('Test Message')

        const icon = document.getElementById('plwd-toast-icon') as HTMLDivElement
        expect(icon.innerText).toBe('✓')

        const toast = document.getElementById('plwd-toast') as HTMLDivElement
        expect(toast.style.color).toBe('rgb(77, 182, 172)')
        expect(toast.classList.contains('open')).toBe(true)

        vi.advanceTimersByTime(2000)

        expect(toast.classList.contains('open')).toBe(false)
      })
    })
  })

  describe('Given the toggleLoader function', () => {
    let loaderBox: HTMLDivElement

    describe('When the loader is toggled on', () => {
      beforeAll(() => {
        loaderBox = document.getElementById('plwd-loader-box') as HTMLDivElement
        utils.toggleLoader(loaderBox, true)
      })

      afterAll(() => loaderBox.replaceChildren(...[]))

      test('Then it should display the loader', () => {
        const loader = document.getElementById('plwd-loader') as HTMLDivElement
        expect(loader).not.toBeNull()
      })
    })

    describe('When the loader is toggled off', () => {
      beforeAll(() => {
        loaderBox = document.getElementById('plwd-loader-box') as HTMLDivElement
        utils.toggleLoader(loaderBox, false)
      })

      afterAll(() => {
        loaderBox.replaceChildren(...[])
      })

      test('Then it should hide the loader', () => {
        const loader = document.getElementById('plwd-loader') as HTMLDivElement
        expect(loader).toBeNull()
      })
    })
  })
})
