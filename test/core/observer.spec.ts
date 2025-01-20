import type { BrowserContext } from 'playwright-core'
import type { Action, ObserverEvent, ObserverState } from '../../packages/core/src/types'

import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { Observer, PlayWord } from '../../packages/core/src'

const {
  mockAddInitScript,
  mockClearCookies,
  mockClick,
  mockClose,
  mockEvaluate,
  mockFrameUrl,
  mockGoTo,
  mockHover,
  mockInvoke,
  mockMainFrame,
  mockSetTimeout,
  mockSummarizeHTML,
  mockUseTools
} = vi.hoisted(() => ({
  mockAddInitScript: vi.fn(),
  mockClearCookies: vi.fn(),
  mockClick: vi.fn(),
  mockClose: vi.fn(),
  mockEvaluate: vi.fn(),
  mockFrameUrl: vi.fn(),
  mockGoTo: vi.fn(),
  mockHover: vi.fn(),
  mockInvoke: vi.fn(),
  mockMainFrame: vi.fn(),
  mockSetTimeout: vi.fn(),
  mockSummarizeHTML: vi.fn(),
  mockUseTools: vi.fn()
}))

vi.mock('@langchain/core/tools', () => ({
  tool: vi.fn(() => ({ name: 'tool', invoke: mockInvoke }))
}))

vi.mock('fs/promises', async () => ({
  access: (await vi.importActual('fs/promises')).access,
  readFile: (await vi.importActual('fs/promises')).readFile,
  mkdir: vi.fn(),
  writeFile: vi.fn()
}))

vi.mock('timers/promises', async () => ({ setTimeout: mockSetTimeout }))

vi.mock('../../packages/core/src/ai', async () => ({
  AI: vi.fn(() => ({ summarizeHTML: mockSummarizeHTML, useTools: mockUseTools }))
}))

describe('Spec: Observer', () => {
  describe('Given an Observer instance', () => {
    const functions = [] as { name: string; fn: () => Promise<ObserverState & void> }[]

    const mockPage = {
      locator: vi.fn(() => ({
        first: vi.fn().mockReturnThis(),
        waitFor: vi.fn(),
        evaluate: mockEvaluate,
        click: mockClick,
        hover: mockHover
      })),
      exposeFunction: vi.fn((name, fn) => functions.push({ name, fn })),
      on: vi.fn(async (_, fn) => await fn({ url: mockFrameUrl })),
      waitForLoadState: vi.fn(),
      addInitScript: mockAddInitScript,
      mainFrame: mockMainFrame,
      evaluate: mockEvaluate,
      close: mockClose,
      goto: mockGoTo
    }

    const mockContext = {
      clearCookies: mockClearCookies,
      newPage: vi.fn(() => mockPage),
      on: vi.fn((_, fn) => fn(mockPage)),
      pages: vi.fn().mockReturnValue([mockPage])
    }

    let observer: Observer
    let playword: PlayWord

    beforeAll(() => {
      playword = new PlayWord(mockContext as unknown as BrowserContext)
      observer = new Observer(playword, { recordPath: 'mock-path' })
    })

    describe('And the `observe` method is called', () => {
      afterEach(() => mockAddInitScript.mockClear())

      describe('When the frameNavigated event is triggered', () => {
        afterEach(() => {
          functions.length = 0
          mockEvaluate.mockReset()
          mockFrameUrl.mockReset()
          mockMainFrame.mockReset()
          mockSetTimeout.mockReset()
        })

        test('Then it should not call the emit() if the frame url is blank', async () => {
          mockFrameUrl.mockReturnValue('about:blank')
          mockMainFrame.mockReturnValue({ url: vi.fn().mockReturnValue('about:blank') })

          await observer.observe()

          expect(mockFrameUrl).toBeCalled()
          expect(mockEvaluate).not.toBeCalled()
        })

        test('Then it should not call the emit() if the frame is not the main frame', async () => {
          mockMainFrame.mockReturnValue({ url: vi.fn().mockReturnValue('https://mainframe.url') })
          mockFrameUrl.mockReturnValue('https://frame.url')

          await observer.observe()

          expect(mockFrameUrl).toBeCalled()
          expect(mockMainFrame).toBeCalled()
          expect(mockEvaluate).not.toBeCalled()
        })

        test('Then it should call the emit() if it is in the main frame and the url is not blank', async () => {
          /**
           * This test invokes the observe() method twice.
           *
           * The purpose of the first invocation is to retrieve the dropEvent() function,
           * which is used to stop the emit handler.
           *
           * The second invocation calls the emit() function and expects the evaluate() function to be called.
           * If the evaluate() function is called, it means that the emit() function is working as expected.
           */

          let counter = 0

          await observer.observe()

          // Wait for the next tick
          await new Promise(process.nextTick)

          const dropEvent = functions.find(({ name }) => name === 'dropEvent')!.fn

          mockEvaluate.mockResolvedValue(true)
          mockFrameUrl.mockReturnValue('https://frame.url')
          mockMainFrame.mockReturnValue({ url: vi.fn().mockReturnValue('https://frame.url') })
          mockSetTimeout.mockImplementation(() => {
            if (counter++ === 1) {
              dropEvent()
              counter = 0
            }
          })
          await observer.observe()

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockEvaluate).toBeCalled()
        })
      })

      describe('When the init scripts are added', () => {
        afterEach(() => (functions.length = 0))

        test('Then the `addInitScript` method should be called', async () => {
          await observer.observe()
          expect(mockAddInitScript).toBeCalledTimes(2)
        })
      })

      describe('When the exposed functions are called', () => {
        let acceptEvent: () => Promise<void>
        let clearAll: () => Promise<void>
        let dropEvent: () => Promise<void>
        let dryRun: () => Promise<void>
        let emit: (action: Action | ObserverEvent) => Promise<void>
        let state: () => Promise<ObserverState>

        beforeEach(async () => {
          await observer.observe()

          // Wait for the next tick
          await new Promise(process.nextTick)

          acceptEvent = functions.find(({ name }) => name === 'acceptEvent')!.fn
          clearAll = functions.find(({ name }) => name === 'clearAll')!.fn
          dropEvent = functions.find(({ name }) => name === 'dropEvent')!.fn
          dryRun = functions.find(({ name }) => name === 'dryRun')!.fn
          emit = functions.find(({ name }) => name === 'emit')!.fn
          state = functions.find(({ name }) => name === 'state')!.fn
        })

        afterEach(() => {
          functions.length = 0
          mockClick.mockReset()
          mockEvaluate.mockReset()
          mockGoTo.mockReset()
          mockHover.mockReset()
          mockSetTimeout.mockReset()
          mockUseTools.mockReset()
        })

        test('The all exposed functions should be defined', () => {
          expect(acceptEvent).toBeDefined()
          expect(dropEvent).toBeDefined()
          expect(emit).toBeDefined()
        })

        test('Then the acceptEvent(), dropEvent(), dryRun(), emit() and state() should work as expected', async () => {
          let counter = 0

          // Accept event
          mockEvaluate.mockResolvedValue(false)
          mockSetTimeout.mockImplementation(async () => {
            if (counter++ === 1) {
              await acceptEvent()
              counter = 0
            }
          })
          mockUseTools.mockResolvedValue({ tool_calls: [] })
          await emit({ name: 'goto', params: { url: 'https://mock.url' } })

          mockUseTools.mockResolvedValue({ tool_calls: [{ name: 'invalid-tool', type: 'tool_call', args: {} }] })
          await emit({ name: 'click', params: { html: 'mock-html', xpath: 'mock-xpath' } })

          mockUseTools.mockResolvedValue({ tool_calls: [{ name: 'tool', type: 'tool_call', args: {} }] })
          mockInvoke.mockResolvedValue({ content: '' })
          await emit({ name: 'input', params: { text: 'moxk-text', xpath: 'mock-xpath' } })

          mockInvoke.mockResolvedValue({ content: '{"name":"hover","params":{"xpath":"mock-xpath"}}' })
          await emit({ name: 'hover', params: { xpath: 'mock-xpath' } })

          // // Dry run
          mockSetTimeout.mockImplementation(() => {})
          mockGoTo.mockRejectedValue(new Error('mock-error'))
          await dryRun()

          expect(mockGoTo).toBeCalled()
          expect(mockClick).toBeCalled()
          expect(mockHover).toBeCalled()

          // Drop event
          mockEvaluate.mockResolvedValue(true)
          mockSetTimeout.mockImplementation(async () => {
            if (counter++ === 1) {
              await dropEvent()
              counter = 0
            }
          })
          await emit({ name: 'select', params: { option: 'mock-option', xpath: 'mock-xpath' } })

          // Clear all
          await clearAll()

          // Get state
          const stateValue = await state()
          stateValue.isDryRunning = true

          await emit({ name: 'goto', params: { url: 'https://mock.url' } })

          stateValue.isDryRunning = false

          expect(stateValue).toEqual({ isDryRunning: false, isWaitingForAI: false, isWaitingForUserAction: false })
        })
      })
    })
  })
})
