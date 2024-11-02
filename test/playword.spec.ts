import type { Page } from 'playwright'

import { AIMessage } from '@langchain/core/messages'
import { join } from 'path'
import { chromium } from 'playwright'
import { beforeAll, describe, expect, test, vi } from 'vitest'

import { PlayWord } from '../src/playword'

const { mockInvoke } = vi.hoisted(() => ({ mockInvoke: vi.fn() }))

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
        title: vi.fn().mockResolvedValue('mock-title'),
        url: vi.fn().mockReturnValue('mock-url'),
        evaluate: vi.fn(),
        goto: vi.fn(),
        waitForLoadState: vi.fn(),
        waitForSelector: vi.fn(),
        locator: vi.fn(() => ({
          getAttribute: vi.fn().mockResolvedValue('mock-link'),
          textContent: vi.fn().mockResolvedValue('mock-text'),
          click: vi.fn(),
          fill: vi.fn(),
          hover: vi.fn(),
          isVisible: vi.fn().mockResolvedValue(true),
          isHidden: vi.fn().mockResolvedValue(true),
          selectOption: vi.fn(),
          first: vi.fn().mockReturnThis()
        })),
        keyboard: {
          press: vi.fn()
        }
      }))
    }))
  }
}))

vi.mock('../src/actionGraph', () => ({ actionGraph: { invoke: mockInvoke } }))

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
        let result: string | boolean | void | null

        beforeAll(async () => {
          mockInvoke.mockResolvedValue({ messages: [new AIMessage('true')] })
          result = await playword.say('Test Message')
        })

        test('Then it should return the result', () => {
          expect(result).toBe(true)
        })
      })
    })

    describe('And the record option is set to file path', () => {
      describe('When the recordings file exists', () => {
        let result: string | boolean | void | null

        beforeAll(async () => {
          playword = new PlayWord(page, { record: join(__dirname, 'mocks/recordings.json') })
        })

        test('Then it should return the results for all of actions', async () => {
          result = await playword.say('assertElementContentEquals')
          expect(result).toEqual(true)

          result = await playword.say('assertElementInvisible')
          expect(result).toEqual(true)

          result = await playword.say('assertElementVisible')
          expect(result).toEqual(true)

          result = await playword.say('assertPageContains')
          expect(result).toEqual(true)

          result = await playword.say('assertPageDoesNotContain')
          expect(result).toEqual(true)

          result = await playword.say('assertPageTitleEquals')
          expect(result).toEqual(true)

          result = await playword.say('assertPageUrlMatches')
          expect(result).toEqual(true)

          result = await playword.say('click')
          expect(result).toBeUndefined()

          result = await playword.say('getLink')
          expect(result).toBe('mock-link')

          result = await playword.say('getSnapshot')
          expect(result).toBe('mock-snapshot')

          result = await playword.say('hover')
          expect(result).toBeUndefined()

          result = await playword.say('input')
          expect(result).toBeUndefined()

          result = await playword.say('navigate')
          expect(result).toBeUndefined()

          result = await playword.say('pressKeys')
          expect(result).toBeUndefined()

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
          expect(result).toBeUndefined()

          result = await playword.say('waitForText')
          expect(result).toBeUndefined()
        }, 15000)
      })

      describe('When the recordings file does not exist', () => {
        let result: string | boolean | void | null

        beforeAll(async () => {
          mockInvoke.mockResolvedValue({ messages: [new AIMessage('result')] })
          playword = new PlayWord(page, { record: join(__dirname, 'mocks/nonexistence.json') })
          result = await playword.say('assertElementContentEquals')
        })

        test('Then it should return the result', () => {
          expect(result).toBe('result')
        })
      })
    })

    describe('And the record option is set to true', () => {
      beforeAll(() => {
        process.chdir(join(__dirname, 'mocks'))
      })

      describe('When the recordings file exists', () => {
        let first: string | boolean | void | null
        let second: string | boolean | void | null

        beforeAll(async () => {
          playword = new PlayWord(page, { record: true })
          first = await playword.say('Check if the element with xpath "mock-xpath" contains the text "mock-text"')

          second = await playword.say('Check if the functionality works when performing multiple actions')
        })

        test('Then it should return the correct result for the first call', () => {
          expect(first).toBe(false)
        })

        test('Then it should return the correct result for the second call', () => {
          expect(second).toBeUndefined()
        })
      })
    })
  })
})
