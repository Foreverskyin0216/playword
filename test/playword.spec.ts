import type { Page } from 'playwright'
import type { ActionResult } from '../src/types'

import { AIMessage } from '@langchain/core/messages'
import { join } from 'path'
import { chromium } from 'playwright'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import PlayWord from '../src'

const { mockAll, mockConsoleLog, mockGetAttribute, mockInvoke, mockIsVisible, mockWaitForLoadState } = vi.hoisted(
  () => ({
    mockAll: vi.fn(),
    mockConsoleLog: vi.spyOn(console, 'log').mockImplementation(() => {}),
    mockGetAttribute: vi.fn(),
    mockInvoke: vi.fn(),
    mockIsVisible: vi.fn(),
    mockWaitForLoadState: vi.fn()
  })
)

vi.mock('fs/promises', async () => ({
  access: (await vi.importActual('fs/promises')).access,
  mkdir: vi.fn(),
  readFile: (await vi.importActual('fs/promises')).readFile,
  writeFile: vi.fn()
}))

vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn(() => ({
      newPage: vi.fn(() => ({
        content: vi.fn().mockResolvedValue('mock-snapshot'),
        frames: vi.fn().mockReturnValue([
          {
            content: vi.fn().mockResolvedValue('mock-snapshot'),
            evaluate: vi.fn(),
            getByText: vi.fn(() => ({ all: mockAll, isVisible: mockIsVisible })),
            locator: vi.fn(() => ({
              all: mockAll,
              click: vi.fn(),
              evaluate: vi.fn(),
              fill: vi.fn(),
              first: vi.fn().mockReturnThis(),
              getAttribute: mockGetAttribute,
              getByText: vi.fn().mockReturnThis(),
              hover: vi.fn(),
              isVisible: mockIsVisible,
              selectOption: vi.fn(),
              textContent: vi.fn().mockResolvedValue('mock-text')
            })),
            name: vi.fn().mockReturnValue('mock-frame'),
            url: vi.fn().mockReturnValue('mock-url'),
            waitForLoadState: mockWaitForLoadState,
            waitForSelector: vi.fn()
          }
        ]),
        evaluate: vi.fn(),
        getByText: vi.fn(() => ({ all: mockAll, isVisible: mockIsVisible })),
        goto: vi.fn(),
        keyboard: { press: vi.fn() },
        locator: vi.fn(() => ({
          all: mockAll,
          click: vi.fn(),
          evaluate: vi.fn(),
          fill: vi.fn(),
          first: vi.fn().mockReturnThis(),
          getAttribute: mockGetAttribute,
          getByText: vi.fn().mockReturnThis(),
          hover: vi.fn(),
          isVisible: mockIsVisible,
          selectOption: vi.fn(),
          textContent: vi.fn().mockResolvedValue('mock-text')
        })),
        screenshot: vi.fn().mockResolvedValue(Buffer.from('mock-screenshot')),
        title: vi.fn().mockResolvedValue('mock-title'),
        url: vi.fn().mockReturnValue('mock-url'),
        waitForLoadState: mockWaitForLoadState,
        waitForSelector: vi.fn(),
        waitForTimeout: vi.fn()
      }))
    }))
  }
}))

vi.mock('../src/actionGraph', () => ({ actionGraph: { invoke: mockInvoke } }))
vi.mock('../src/actionUtils', () => ({ markElement: vi.fn(), unmarkElement: vi.fn() }))

describe('Spec: PlayWord Class', () => {
  describe('Given a PlayWord instance', () => {
    let playword: PlayWord
    let page: Page

    beforeAll(async () => {
      const browser = await chromium.launch()
      page = await browser.newPage()
    })

    describe('And the record option is set to false', () => {
      beforeAll(async () => {
        playword = new PlayWord(page, { record: false })
      })

      describe('When the say method is called', () => {
        let result: ActionResult

        beforeAll(async () => {
          mockInvoke.mockResolvedValue({ messages: [new AIMessage('true')] })
          result = await playword.say('Test Message')
        })

        afterAll(() => mockInvoke.mockRestore())

        test('Then it should return the result', () => {
          expect(result).toBe(true)
        })
      })
    })

    describe('And the record option is set to file path', () => {
      describe('When the recordings file exists', () => {
        let result: ActionResult
        beforeAll(async () => {
          mockAll.mockResolvedValue([
            {
              click: vi.fn(),
              evaluate: vi.fn(),
              hover: vi.fn(),
              fill: vi.fn(),
              isVisible: mockIsVisible,
              selectOption: vi.fn()
            }
          ])
          mockGetAttribute.mockResolvedValue('mock-attribute')
          mockIsVisible.mockResolvedValue(true)
          playword = new PlayWord(page, { record: join(__dirname, 'mocks/mockActions.json') })
        })

        afterAll(() => {
          mockAll.mockRestore()
          mockGetAttribute.mockRestore()
          mockIsVisible.mockRestore()
        })

        test('Then it should return the results for all of actions', async () => {
          result = await playword.say('assertElementContentEquals')
          expect(result).toEqual(true)

          result = await playword.say('assertElementContentNotEquals')
          expect(result).toEqual(false)

          result = await playword.say('assertElementVisible')
          expect(result).toEqual(true)

          result = await playword.say('assertElementNotVisible')
          expect(result).toEqual(false)

          result = await playword.say('assertPageContains')
          expect(result).toEqual(true)

          result = await playword.say('assertPageDoesNotContain')
          expect(result).toEqual(false)

          result = await playword.say('assertPageTitleEquals')
          expect(result).toEqual(true)

          result = await playword.say('assertPageUrlMatches')
          expect(result).toEqual(true)

          result = await playword.say('click')
          expect(result).toBe('Clicked on mock-xpath')

          result = await playword.say('getAttribute')
          expect(result).toBe('Attribute value: mock-attribute')

          result = await playword.say('getScreenshot')
          expect(result).toBe('data:image/jpeg;base64,' + Buffer.from('mock-screenshot').toString('base64'))

          result = await playword.say('getSnapshot')
          expect(result).toBe('mock-snapshot')

          result = await playword.say('goto')
          expect(result).toBe('Navigated to mock-url')

          result = await playword.say('hover')
          expect(result).toBe('Hovered on mock-xpath')

          result = await playword.say('input')
          expect(result).toBe('Filled in mock-xpath')

          result = await playword.say('mark')
          expect(result).toBe('Marked mock-xpath with order 1')

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
          expect(result).toBe('Selected mock-option')

          result = await playword.say('sleep')
          expect(result).toBe('Slept for 1000 seconds')

          result = await playword.say('unmark')
          expect(result).toBe('Unmarked mock-xpath with order 1')

          result = await playword.say('waitForText')
          expect(result).toBe('Waited for text mock-text')
        }, 30000)
      })

      describe('When the recordings file does not exist', () => {
        let result: ActionResult

        beforeAll(async () => {
          mockInvoke.mockResolvedValue({ messages: [new AIMessage('result')] })
          playword = new PlayWord(page, { record: join(__dirname, 'mocks/nonexistence.json') })
          result = await playword.say('assertElementContentEquals')
        })

        afterAll(() => mockInvoke.mockRestore())

        test('Then it should return the result', () => {
          expect(result).toBe('result')
        })
      })

      describe('When the page is switched to a frame', () => {
        let result: ActionResult

        beforeAll(async () => {
          mockAll.mockResolvedValue([
            {
              click: vi.fn(),
              evaluate: vi.fn(),
              hover: vi.fn(),
              fill: vi.fn(),
              isVisible: mockIsVisible,
              selectOption: vi.fn()
            }
          ])
          mockGetAttribute.mockResolvedValue('mock-attribute')
          mockIsVisible.mockResolvedValue(true)
          playword = new PlayWord(page, { record: join(__dirname, 'mocks/mockFrameActions.json') })
        })

        afterAll(() => {
          mockAll.mockRestore()
          mockIsVisible.mockRestore()
          mockGetAttribute.mockRestore()
        })

        test('Then it should return the results for all of actions', async () => {
          result = await playword.say('switchFrame')
          expect(result).toBe('Switched to frame')

          result = await playword.say('assertElementContentEquals')
          expect(result).toBe(true)

          result = await playword.say('assertElementContentNotEquals')
          expect(result).toBe(false)

          result = await playword.say('assertElementVisible')
          expect(result).toBe(true)

          result = await playword.say('assertElementNotVisible')
          expect(result).toBe(false)

          result = await playword.say('assertPageContains')
          expect(result).toBe(true)

          result = await playword.say('assertPageDoesNotContain')
          expect(result).toBe(false)

          result = await playword.say('click')
          expect(result).toBe('Clicked on mock-xpath')

          result = await playword.say('getAttribute')
          expect(result).toBe('Attribute value: mock-attribute')

          result = await playword.say('getFrames')
          const pageContent = JSON.parse(result?.[0]?.pageContent)
          expect(pageContent).toHaveProperty('name', 'mock-frame')
          expect(pageContent).toHaveProperty('url', 'mock-url')

          result = await playword.say('getSnapshot')
          expect(result).toBe('mock-snapshot')

          result = await playword.say('hover')
          expect(result).toBe('Hovered on mock-xpath')

          result = await playword.say('input')
          expect(result).toBe('Filled in mock-xpath')

          result = await playword.say('mark')
          expect(result).toBe('Marked mock-xpath with order 1')

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
          expect(result).toBe('Selected mock-option')

          result = await playword.say('unmark')
          expect(result).toBe('Unmarked mock-xpath with order 1')

          result = await playword.say('waitForText')
          expect(result).toBe('Waited for text mock-text')
        }, 30000)
      })

      describe('When the element is not found', () => {
        let result: ActionResult

        beforeAll(async () => {
          mockAll.mockResolvedValue([])
          mockGetAttribute.mockResolvedValue(null)
          playword = new PlayWord(page, { record: join(__dirname, 'mocks/mockNotFoundActions.json') })
        })

        afterAll(() => {
          mockAll.mockRestore()
          mockGetAttribute.mockRestore()
        })

        test('Then it should return the results for all of actions', async () => {
          result = await playword.say('click')
          expect(result).toBe('No element found')

          result = await playword.say('getAttribute')
          expect(result).toBe('No element found')

          result = await playword.say('hover')
          expect(result).toBe('No element found')

          result = await playword.say('input')
          expect(result).toBe('No element found')

          result = await playword.say('mark')
          expect(result).toBe('No element found')

          result = await playword.say('select')
          expect(result).toBe('No element found')
        }, 15000)
      })
    })

    describe('And the record option is set to true', () => {
      beforeAll(() => process.chdir(join(__dirname, 'mocks')))

      afterAll(() => process.chdir(process.cwd()))

      describe('When the recordings file exists', () => {
        let first: ActionResult
        let second: ActionResult

        beforeAll(async () => {
          mockAll.mockResolvedValue([
            {
              click: vi.fn(),
              hover: vi.fn(),
              isVisible: mockIsVisible
            }
          ])
          mockIsVisible.mockResolvedValue(true)
          playword = new PlayWord(page, { record: true })
          first = await playword.say('Check if the element with xpath "mock-xpath" contains the text "mock-text"')
          second = await playword.say('Check if PlayWord works when performing multiple actions')
        })

        afterAll(() => {
          mockAll.mockRestore()
          mockIsVisible.mockRestore()
        })

        test('Then it should return the correct result for the first call', () => {
          expect(first).toBe(false)
        })

        test('Then it should return the correct result for the second call', () => {
          expect(second).toBe('Clicked on mock-xpath')
        })
      })
    })

    describe('And the useScreenshot option is set to true', () => {
      let result: ActionResult

      beforeAll(async () => {
        mockInvoke.mockResolvedValue({ messages: [new AIMessage('result')] })
        playword = new PlayWord(page, { useScreenshot: true })
        result = await playword.say('Test Message')
      })

      afterAll(() => mockInvoke.mockRestore())

      test('Then it should return the result with a screenshot', () => {
        expect(result).toBe('result')
      })
    })

    describe('And the debug option is set to true', () => {
      beforeAll(async () => {
        mockInvoke.mockResolvedValue({ messages: [new AIMessage('result')] })
        playword = new PlayWord(page, { debug: true, record: true })
        await playword.say('Check if the element with xpath "mock-xpath" contains the text "mock-text"')
      })

      afterAll(() => mockInvoke.mockRestore())

      test('Then it should log the result', () => {
        expect(mockConsoleLog).toHaveBeenCalledWith(
          '\x1b[35m [INFO] \x1b[0m',
          '\x1b[32m Step 1: Check if the element with xpath "mock-xpath" contains the text "mock-text" \x1b[0m'
        )
      })
    })

    describe('And the retryOnFailure option is set', () => {
      describe('When the retryOnFailure option is set to true', () => {
        describe('And the element is not found', () => {
          let result: ActionResult

          beforeAll(async () => {
            mockAll.mockResolvedValue([])
            mockInvoke.mockResolvedValue({ messages: [new AIMessage('No element found')] })
            playword = new PlayWord(page, {
              record: join(__dirname, 'mocks/mockNotFoundActions.json'),
              retryOnFailure: true
            })
            result = await playword.say('click')
          })

          afterAll(() => {
            mockAll.mockRestore()
            mockInvoke.mockRestore()
          })

          test('Then it should retry the action and return the result', () => {
            expect(result).toBe('No element found')
          })
        })

        describe('And an error occurs', () => {
          let result: ActionResult

          beforeAll(async () => {
            mockInvoke.mockResolvedValue({ messages: [new AIMessage('true')] })
            mockWaitForLoadState.mockRejectedValue(new Error('mock-error'))
            playword = new PlayWord(page, { retryOnFailure: true, record: true })
            result = await playword.say('Check if the element with xpath "mock-xpath" contains the text "mock-text"')
          })

          afterAll(() => {
            mockInvoke.mockRestore()
            mockWaitForLoadState.mockRestore()
          })

          test('Then it should retry the action and return the result', () => {
            expect(result).toBe(true)
          })
        })
      })

      describe('When the retryOnFailure option is set to false', () => {
        beforeAll(async () => {
          mockWaitForLoadState.mockRejectedValue(new Error('mock-error'))
          playword = new PlayWord(page, { record: true })
        })

        afterAll(() => mockWaitForLoadState.mockRestore())

        test('Then it should not retry the action and throw an error', async () => {
          await expect(
            playword.say('Check if the element with xpath "mock-xpath" contains the text "mock-text"')
          ).rejects.toThrow('mock-error')
        })
      })
    })
  })
})
