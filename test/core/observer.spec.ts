import type { BrowserContext } from 'playwright-core'
import type { Action, ObserverAction } from '../../packages/core/src/types'

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
  mockSummarizeAction,
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
  mockSummarizeAction: vi.fn(),
  mockUseTools: vi.fn()
}))

vi.mock('@langchain/core/tools', () => ({ tool: vi.fn(() => ({ name: 'tool', invoke: mockInvoke })) }))

vi.mock('fs/promises', async () => {
  const { access, readFile } = await vi.importActual('fs/promises')
  return { access, readFile, mkdir: vi.fn(), writeFile: vi.fn() }
})

vi.mock('timers/promises', () => ({ setTimeout: mockSetTimeout }))

vi.mock('../../packages/core/src/ai', () => ({
  AI: vi.fn(() => ({ summarizeAction: mockSummarizeAction, useTools: mockUseTools }))
}))

describe('Spec: Observer', () => {
  describe('Given an Observer instance', () => {
    const functions = [] as { name: string; fn: () => Promise<void> }[]

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
      reload: vi.fn(),
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
           * The purpose of the first invocation is to retrieve the cancel() function,
           * which is used to stop the emit handler.
           *
           * The second invocation calls the emit() function and expects the evaluate() function to be called.
           * If the evaluate() function is called, it means that the emit() function is working as expected.
           */
          let counter = 0

          await observer.observe()

          // Wait for the next tick
          await new Promise(process.nextTick)

          const cancel = functions.find(({ name }) => name === 'cancel')!.fn

          mockSummarizeAction.mockResolvedValue({ summary: 'mock-summary' })
          mockEvaluate.mockResolvedValue(true)
          mockFrameUrl.mockReturnValue('https://frame.url')
          mockMainFrame.mockReturnValue({ url: vi.fn().mockReturnValue('https://frame.url') })
          mockSetTimeout.mockImplementation(() => {
            if (counter++ === 1) {
              cancel()
              counter = 0
            }
          })

          /**
           * If the state is waitingForAI is set to true, the emit() function should be ignored.
           */
          observer.state.waitingForAI = true
          await observer.observe()

          // Wait for the next tick
          await new Promise(process.nextTick)

          expect(mockEvaluate).not.toBeCalled()

          /**
           * If the waitingForAI state is set to false, the emit() function should be called.
           */
          observer.state.waitingForAI = false
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
        let accept: () => Promise<void>
        let cancel: () => Promise<void>
        let clearAll: () => Promise<void>
        let deleteStep: (index: number) => Promise<void>
        let dryRun: () => Promise<void>
        let emit: (action: Action | ObserverAction) => Promise<void>
        let stopDryRun: () => Promise<void>

        beforeEach(async () => {
          await observer.observe()

          // Wait for the next tick
          await new Promise(process.nextTick)

          accept = functions.find(({ name }) => name === 'accept')!.fn
          cancel = functions.find(({ name }) => name === 'cancel')!.fn
          clearAll = functions.find(({ name }) => name === 'clearAll')!.fn
          deleteStep = functions.find(({ name }) => name === 'deleteStep')!.fn
          dryRun = functions.find(({ name }) => name === 'dryRun')!.fn
          emit = functions.find(({ name }) => name === 'emit')!.fn
          stopDryRun = functions.find(({ name }) => name === 'stopDryRun')!.fn
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
          expect(accept).toBeDefined()
          expect(cancel).toBeDefined()
          expect(clearAll).toBeDefined()
          expect(deleteStep).toBeDefined()
          expect(dryRun).toBeDefined()
          expect(emit).toBeDefined()
          expect(stopDryRun).toBeDefined()
        })

        test('Then the accept(), cancel(), deleteStep(), dryRun(), emit() and stopDryRun() should work as expected', async () => {
          /**
           * The emit() function serves as the primary entry point for various related functionalities.
           *
           * This test suite comprehensively verifies all associated behaviors triggered by invoking emit().
           */
          let counter = 0

          /**
           * Test the accpet() function.
           */
          mockEvaluate.mockResolvedValue(false)
          mockSetTimeout.mockImplementation(async () => {
            if (counter++ === 1) {
              /**
               * When state.waitingForAI is true, accept() should be ignored.
               */
              observer.state.waitingForAI = true
              await accept()

              /**
               * Otherwise, the action should be added to the recording.
               */
              observer.state.waitingForAI = false
              await accept()
              counter = 0
            }
          })

          /**
           * Emit different types of actions.
           */
          mockUseTools.mockResolvedValue({ tool_calls: [] })
          await emit({ name: 'goto', params: { url: 'https://mock.url' } })

          mockUseTools.mockResolvedValue({ tool_calls: [{ name: 'invalid-tool', type: 'tool_call', args: {} }] })
          await emit({ name: 'click', params: { html: 'mock-html', xpath: 'mock-xpath' } })

          mockUseTools.mockResolvedValue({ tool_calls: [{ name: 'tool', type: 'tool_call', args: {} }] })
          mockInvoke.mockResolvedValue({ content: '' })
          await emit({ name: 'input', params: { text: 'moxk-text', xpath: 'mock-xpath' } })

          mockInvoke.mockResolvedValue({ content: '{"name":"hover","params":{"xpath":"mock-xpath"}}' })
          await emit({ name: 'hover', params: { xpath: 'mock-xpath' } })

          /**
           * Simulate a failure scenario where the GoTo action throws an error,
           * and verify the correct handling of a failed dryRun.
           */
          mockGoTo.mockRejectedValue(new Error('mock-error'))
          mockSetTimeout.mockImplementation(() => {})
          await dryRun()

          /**
           * Verify that stopDryRun operates correctly.
           */
          await stopDryRun()

          /**
           * Ensure that actions: GoTo, Click, and Hover are properly invoked during the dryRun
           */
          expect(mockGoTo).toBeCalled()
          expect(mockClick).toBeCalled()
          expect(mockHover).toBeCalled()

          /**
           * Test the cancel() function.
           */
          mockEvaluate.mockResolvedValue(true)
          mockSetTimeout.mockImplementation(async () => {
            if (counter++ === 1) {
              await cancel()
              counter = 0
            }
          })
          await emit({ name: 'select', params: { option: 'mock-option', xpath: 'mock-xpath' } })

          /**
           * Test clear()-related methods.
           */
          mockEvaluate.mockResolvedValue(false)
          mockSetTimeout.mockImplementation(async () => {
            if (counter++ === 1) {
              await accept()
              counter = 0
            }
          })

          /**
           * Test the clearAll() function.
           */
          await clearAll()

          /**
           * Test the deleteStep() function.
           *
           * First, add a new action to the recording.
           * Then, perform two separate deletion operations to cover different branches of the logic.
           */
          await emit({ name: 'select', params: { option: 'mock-option', xpath: 'mock-xpath' } })
          await deleteStep(0)
          await deleteStep(0)
        })
      })
    })
  })
})
