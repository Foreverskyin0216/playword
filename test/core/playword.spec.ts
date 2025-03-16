import type { BrowserContext } from 'playwright-core'

import { AIMessage } from '@langchain/core/messages'
import { join } from 'path'
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { PlayWord } from '../../packages/core/src'

const {
  mockAll,
  mockEvaluate,
  mockFrames,
  mockGoTo,
  mockInvoke,
  mockIsVisible,
  mockPages,
  mockPress,
  mockTitle,
  mockUrl,
  mockWaitForLoadState,
  mockWaitForTimeout
} = vi.hoisted(() => ({
  mockAll: vi.fn(),
  mockEvaluate: vi.fn(),
  mockFrames: vi.fn(),
  mockGoTo: vi.fn(),
  mockInvoke: vi.fn(),
  mockIsVisible: vi.fn(),
  mockPages: vi.fn(),
  mockPress: vi.fn(),
  mockTitle: vi.fn(),
  mockUrl: vi.fn(),
  mockWaitForLoadState: vi.fn(),
  mockWaitForTimeout: vi.fn()
}))

vi.mock('fs/promises', async () => ({
  access: (await vi.importActual('fs/promises')).access,
  readFile: (await vi.importActual('fs/promises')).readFile,
  mkdir: vi.fn(),
  writeFile: vi.fn()
}))

vi.mock('timers/promises', () => ({ setTimeout: vi.fn() }))

vi.mock('../../packages/core/src/graph', () => ({ sayGraph: { invoke: mockInvoke } }))

vi.mock('../../packages/core/src/utils', async () => {
  const { aiPattern, variablePattern } = await vi.importActual('../../packages/core/src/utils')
  return { aiPattern, info: vi.fn(), variablePattern }
})

describe('Spec: PlayWord', () => {
  describe('Given a PlayWord instance', () => {
    const workdir = process.cwd()

    const mockFrame = {
      locator: vi.fn(() => ({
        first: vi.fn().mockReturnThis(),
        selectOption: vi.fn(),
        waitFor: vi.fn(),
        click: vi.fn(),
        hover: vi.fn(),
        fill: vi.fn(),
        evaluate: mockEvaluate,
        isVisible: mockIsVisible,
        textContent: vi.fn().mockResolvedValue('mock-text')
      })),
      content: vi.fn().mockResolvedValue('mock-snapshot'),
      name: vi.fn().mockReturnValue('mock-frame'),
      waitForSelector: vi.fn(),
      waitForLoadState: mockWaitForLoadState,
      evaluate: mockEvaluate,
      url: mockUrl,
      getByText: vi.fn(() => ({ all: mockAll }))
    }

    const mockPage = {
      locator: vi.fn(() => ({
        first: vi.fn().mockReturnThis(),
        selectOption: vi.fn(),
        waitFor: vi.fn(),
        click: vi.fn(),
        hover: vi.fn(),
        fill: vi.fn(),
        evaluate: mockEvaluate,
        isVisible: mockIsVisible,
        textContent: vi.fn().mockResolvedValue('mock-text')
      })),
      content: vi.fn().mockResolvedValue('mock-snapshot'),
      on: vi.fn(),
      waitForSelector: vi.fn(),
      waitForLoadState: mockWaitForLoadState,
      waitForTimeout: mockWaitForTimeout,
      evaluate: mockEvaluate,
      frames: mockFrames,
      title: mockTitle,
      goto: mockGoTo,
      url: mockUrl,
      keyboard: { press: mockPress },
      getByText: vi.fn(() => ({ all: mockAll }))
    }

    const mockContext = { newPage: vi.fn(() => mockPage), on: vi.fn((_, fn) => fn(mockPage)), pages: mockPages }

    let playword: PlayWord

    beforeAll(() => {
      process.chdir(join(__dirname, 'mocks'))
      process.env.OPENAI_API_KEY = 'test-api-key'
    })

    afterAll(() => {
      delete process.env.OPENAI_API_KEY
      process.chdir(workdir)
    })

    describe('And the PlayWord instance is created with the default options', () => {
      beforeAll(() => {
        mockPages.mockReturnValue([mockPage])
        playword = new PlayWord(mockContext as unknown as BrowserContext)
      })

      afterAll(() => mockPages.mockReset())

      describe('When the say method is called', () => {
        afterEach(() => mockInvoke.mockReset())

        test('Then it should return true if the last message is true', async () => {
          mockInvoke.mockResolvedValue({ messages: [new AIMessage('true')] })
          const result = await playword.say('[AI] Test Message')
          expect(result).toBe(true)
        })

        test('Then it should return false if the last message is false', async () => {
          mockInvoke.mockResolvedValue({ messages: [new AIMessage('false')] })
          const result = await playword.say('[AI] Test Message')
          expect(result).toBe(false)
        })
      })
    })

    describe('And the record option is set to true', () => {
      describe('When the recordings file exists', () => {
        beforeAll(() => {
          mockAll.mockResolvedValue([{ isVisible: mockIsVisible }])
          mockIsVisible.mockResolvedValue(true)

          mockPages.mockReturnValue([mockPage])

          playword = new PlayWord(mockContext as unknown as BrowserContext, { record: true })
        })

        afterAll(() => {
          mockAll.mockReset()
          mockIsVisible.mockReset()
          mockPages.mockReset()
        })

        test('Then it should return the correct result for the first call', async () => {
          const result = await playword.say('Check if the element with xpath "mock-xpath" contains text "mock-text"')
          expect(result).toBe(false)
        })

        test('Then it should return the correct result for the second call', async () => {
          const result = await playword.say('Check if PlayWord works when performing multiple actions')
          expect(result).toBe('Performed the click action')
        })
      })
    })

    describe('And the record option is set to a file path', () => {
      describe('When the recordings file exists', () => {
        beforeAll(() => {
          process.env.VARIABLE = 'mock-variable'

          mockAll.mockResolvedValue([{ isVisible: mockIsVisible }])
          mockEvaluate.mockResolvedValue('mock-result')
          mockIsVisible.mockResolvedValue(true)
          mockTitle.mockResolvedValue('mock-title')

          mockFrames.mockReturnValue([mockFrame])
          mockPages.mockReturnValue([mockPage])
          mockUrl.mockReturnValue('mock-url')

          playword = new PlayWord(mockContext as unknown as BrowserContext, {
            record: join(__dirname, 'mocks/mockActions.json')
          })
        })

        afterAll(() => {
          delete process.env.VARIABLE
          mockAll.mockReset()
          mockEvaluate.mockReset()
          mockFrames.mockReset()
          mockIsVisible.mockReset()
          mockPages.mockReset()
          mockTitle.mockReset()
          mockUrl.mockReset()
        })

        test('Then it should return the results for all of actions', async () => {
          let result: boolean | string

          result = await playword.say('assertElementContains')
          expect(result).toEqual(true)

          result = await playword.say('assertElementNotContain')
          expect(result).toEqual(false)

          result = await playword.say('assertElementContentEquals')
          expect(result).toEqual(true)

          result = await playword.say('assertElementContentNotEqual')
          expect(result).toEqual(false)

          result = await playword.say('assertElementVisible')
          expect(result).toEqual(true)

          result = await playword.say('assertElementNotVisible')
          expect(result).toEqual(true)

          result = await playword.say('assertPageContains')
          expect(result).toEqual(true)

          result = await playword.say('assertPageNotContain')
          expect(result).toEqual(false)

          result = await playword.say('assertPageTitleEquals')
          expect(result).toEqual(true)

          result = await playword.say('assertPageUrlMatches')
          expect(result).toEqual(true)

          result = await playword.say('click')
          expect(result).toBe('Performed the click action')

          result = await playword.say('goto')
          expect(result).toBe('Navigated to mock-url')

          result = await playword.say('hover')
          expect(result).toBe('Performed the hover action')

          result = await playword.say('input')
          expect(result).toBe('Performed the input action')

          result = await playword.say('input with existing variables')
          expect(result).toBe('Performed the input action')

          result = await playword.say('input with non-existing variables')
          expect(result).toBe('Performed the input action')

          result = await playword.say('pressKeys')
          expect(result).toBe('Pressed keys mock-keys')

          result = await playword.say('scroll up')
          expect(result).toBe('scrolled up')

          result = await playword.say('scroll down')
          expect(result).toBe('scrolled down')

          result = await playword.say('scroll to top')
          expect(result).toBe('scrolled to top')

          result = await playword.say('scroll to bottom')
          expect(result).toBe('scrolled to bottom')

          result = await playword.say('scroll to left')
          expect(result).toBe('Unsupported scroll target left')

          result = await playword.say('select')
          expect(result).toBe('Performed the select action')

          result = await playword.say('sleep')
          expect(result).toBe('Slept for 1000 milliseconds')

          result = await playword.say('switchFrame')
          expect(result).toBe('Switched to frame')

          result = await playword.say('switchPage')
          expect(result).toBe('Switched to page')

          result = await playword.say('waitForText')
          expect(result).toBe('Waited for text: mock-text')
        })
      })

      describe('When the recordings file does not exist', () => {
        beforeAll(() => {
          mockInvoke.mockResolvedValue({ messages: [new AIMessage('result')] })
          mockPages.mockReturnValue([mockPage])
          playword = new PlayWord(mockContext as unknown as BrowserContext, {
            record: join(__dirname, 'mocks/nonexistence.json')
          })
        })

        afterAll(() => {
          mockInvoke.mockReset()
          mockPages.mockReset()
        })

        test('Then it should return the result', async () => {
          const result = await playword.say('assertElementContentEquals')
          expect(result).toBe('result')
        })
      })
    })

    describe('And the action is failed to perform', () => {
      describe('When the action returns "Failed to perform action"', () => {
        beforeAll(() => {
          mockGoTo.mockRejectedValue(new Error('mock-error'))
          mockPress.mockRejectedValue(new Error('mock-error'))
          mockTitle.mockRejectedValue(new Error('mock-error'))
          mockWaitForLoadState.mockRejectedValue(new Error('mock-error'))
          mockWaitForTimeout.mockRejectedValue(new Error('mock-error'))

          mockUrl.mockImplementation(() => {
            throw new Error('mock-error')
          })

          mockInvoke.mockResolvedValue({ messages: [new AIMessage('Failed to perform action')] })

          mockPages.mockReturnValue([mockPage])

          playword = new PlayWord(mockContext as unknown as BrowserContext, {
            record: join(__dirname, 'mocks/mockActions.json')
          })
        })

        afterAll(() => {
          mockFrames.mockReset()
          mockGoTo.mockReset()
          mockInvoke.mockReset()
          mockPages.mockReset()
          mockPress.mockReset()
          mockTitle.mockReset()
          mockUrl.mockReset()
          mockWaitForLoadState.mockReset()
          mockWaitForTimeout.mockReset()
        })

        test('Then it should retry the action and return the result', async () => {
          let result: boolean | string

          result = await playword.say('assertElementContains')
          expect(result).toEqual(false)

          result = await playword.say('assertElementNotContain')
          expect(result).toEqual(false)

          result = await playword.say('assertElementContentEquals')
          expect(result).toEqual(false)

          result = await playword.say('assertElementContentNotEqual')
          expect(result).toEqual(false)

          result = await playword.say('assertElementVisible')
          expect(result).toEqual(false)

          result = await playword.say('assertElementNotVisible')
          expect(result).toEqual(false)

          result = await playword.say('assertPageContains')
          expect(result).toEqual(false)

          result = await playword.say('assertPageNotContain')
          expect(result).toEqual(false)

          result = await playword.say('assertPageTitleEquals')
          expect(result).toEqual(false)

          result = await playword.say('assertPageUrlMatches')
          expect(result).toEqual(false)

          result = await playword.say('click')
          expect(result).toBe('Failed to perform action')

          result = await playword.say('goto')
          expect(result).toBe('Failed to perform action')

          result = await playword.say('hover')
          expect(result).toBe('Failed to perform action')

          result = await playword.say('input')
          expect(result).toBe('Failed to perform action')

          result = await playword.say('input with existing variables')
          expect(result).toBe('Failed to perform action')

          result = await playword.say('input with non-existing variables')
          expect(result).toBe('Failed to perform action')

          result = await playword.say('pressKeys')
          expect(result).toBe('Failed to perform action')

          result = await playword.say('scroll up')
          expect(result).toBe('Failed to perform action')

          result = await playword.say('scroll down')
          expect(result).toBe('Failed to perform action')

          result = await playword.say('scroll to top')
          expect(result).toBe('Failed to perform action')

          result = await playword.say('scroll to bottom')
          expect(result).toBe('Failed to perform action')

          result = await playword.say('scroll to left')
          expect(result).toBe('Failed to perform action')

          result = await playword.say('select')
          expect(result).toBe('Failed to perform action')

          result = await playword.say('sleep')
          expect(result).toBe('Failed to perform action')

          mockFrames.mockReturnValue(null)
          result = await playword.say('switchFrame')
          expect(result).toBe('Failed to perform action')

          mockPages.mockReturnValue(null)
          result = await playword.say('switchPage')
          expect(result).toBe('Failed to perform action')

          result = await playword.say('waitForText')
          expect(result).toBe('Failed to perform action')
        })
      })
    })
  })
})
