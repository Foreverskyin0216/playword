import { Document } from '@langchain/core/documents'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import assertTools from '../src/assertTools'

const {
  mockAssertElementContentEquals,
  mockAssertElementContentNotEquals,
  mockAssertElementVisible,
  mockAssertElementNotVisible,
  mockAssertPageContains,
  mockAssertPageDoesNotContain,
  mockAssertPageTitleEquals,
  mockAssertPageUrlMatches,
  mockGetSnapshot,
  mockInvoke
} = vi.hoisted(() => ({
  mockAssertElementContentEquals: vi.fn(),
  mockAssertElementContentNotEquals: vi.fn(),
  mockAssertElementVisible: vi.fn(),
  mockAssertElementNotVisible: vi.fn(),
  mockAssertPageContains: vi.fn(),
  mockAssertPageDoesNotContain: vi.fn(),
  mockAssertPageTitleEquals: vi.fn(),
  mockAssertPageUrlMatches: vi.fn(),
  mockConsoleLog: vi.spyOn(console, 'log').mockImplementation(() => {}),
  mockGetSnapshot: vi.fn(),
  mockInvoke: vi.fn()
}))

vi.mock('../src/actions', () => ({
  assertElementContentEquals: mockAssertElementContentEquals,
  assertElementContentNotEquals: mockAssertElementContentNotEquals,
  assertElementVisible: mockAssertElementVisible,
  assertElementNotVisible: mockAssertElementNotVisible,
  assertPageContains: mockAssertPageContains,
  assertPageDoesNotContain: mockAssertPageDoesNotContain,
  assertPageTitleEquals: mockAssertPageTitleEquals,
  assertPageUrlMatches: mockAssertPageUrlMatches,
  getScreenshot: vi.fn(),
  getSnapshot: mockGetSnapshot,
  mark: vi.fn(),
  unmark: vi.fn()
}))

vi.mock('../src/ai', () => ({
  AI: vi.fn(() => ({
    embedDocuments: vi.fn(() => ({ asRetriever: vi.fn(() => ({ invoke: mockInvoke })) })),
    getBestCandidate: vi.fn().mockResolvedValue(0)
  }))
}))

describe('Spec: Assert Tools', () => {
  describe('Given the assert tools', () => {
    const mockConfig = {
      ref: { debug: true, frame: undefined, input: 'test', openAIOptions: {}, snapshot: '', store: undefined },
      use_screenshot: true
    }

    beforeAll(async () => {
      const html = await readFile(join(__dirname, 'mocks/mockPageContent.html'), 'utf-8')
      mockGetSnapshot.mockResolvedValue(html)
    })

    afterAll(() => mockGetSnapshot.mockRestore())

    describe('When the AssertElementContentEquals tool is used', () => {
      const assertElementContentEqualsTool = assertTools[0]
      let successWithScreenshot: string
      let failureWithoutScreenshot: string

      beforeAll(async () => {
        mockAssertElementContentEquals.mockResolvedValue(true)
        mockInvoke.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
        mockConfig.use_screenshot = true
        successWithScreenshot = await assertElementContentEqualsTool.invoke(
          { keywords: 'test', text: 'ID' },
          { configurable: mockConfig }
        )

        mockAssertElementContentEquals.mockResolvedValue(false)
        mockConfig.use_screenshot = false
        failureWithoutScreenshot = await assertElementContentEqualsTool.invoke(
          { keywords: 'test', text: 'ID' },
          { configurable: mockConfig }
        )
      })

      afterAll(() => {
        mockAssertElementContentEquals.mockRestore()
        mockInvoke.mockRestore()
        mockConfig.ref = {
          debug: true,
          frame: undefined,
          input: 'test',
          openAIOptions: {},
          snapshot: '',
          store: undefined
        }
        mockConfig.use_screenshot = true
      })

      test('Then the result is as expected', () => {
        expect(successWithScreenshot).toBe('Element content is equal to: ID')
        expect(failureWithoutScreenshot).toBe('Element content is not equal to: ID')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertElementContentEquals).toHaveBeenCalledWith(mockConfig.ref, {
          text: 'ID',
          xpath: '//*[@id="targetDiv"]'
        })
      })
    })

    describe('When the AssertElementContentNotEquals tool is used', () => {
      const assertElementContentNotEqualsTool = assertTools[1]
      let successWithScreenshot: string
      let failureWithoutScreenshot: string

      beforeAll(async () => {
        mockAssertElementContentNotEquals.mockResolvedValue(true)
        mockInvoke.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
        mockConfig.use_screenshot = true
        successWithScreenshot = await assertElementContentNotEqualsTool.invoke(
          { keywords: 'test', text: 'ID' },
          { configurable: mockConfig }
        )

        mockAssertElementContentNotEquals.mockResolvedValue(false)
        mockConfig.use_screenshot = false
        failureWithoutScreenshot = await assertElementContentNotEqualsTool.invoke(
          { keywords: 'test', text: 'ID' },
          { configurable: mockConfig }
        )
      })

      afterAll(() => {
        mockAssertElementContentNotEquals.mockRestore()
        mockInvoke.mockRestore()
        mockConfig.ref = {
          debug: true,
          frame: undefined,
          input: 'test',
          openAIOptions: {},
          snapshot: '',
          store: undefined
        }
        mockConfig.use_screenshot = true
      })

      test('Then the result is as expected', () => {
        expect(successWithScreenshot).toBe('Element content is not equal to: ID')
        expect(failureWithoutScreenshot).toBe('Element content is equal to: ID')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertElementContentNotEquals).toHaveBeenCalledWith(mockConfig.ref, {
          text: 'ID',
          xpath: '//*[@id="targetDiv"]'
        })
      })
    })

    describe('When the AssertElementVisible tool is used', () => {
      const assertElementVisibleTool = assertTools[2]
      let successWithScreenshot: string
      let failureWithoutScreenshot: string

      beforeAll(async () => {
        mockAssertElementVisible.mockResolvedValue(true)
        mockInvoke.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
        mockConfig.use_screenshot = true
        successWithScreenshot = await assertElementVisibleTool.invoke(
          { keywords: 'test' },
          { configurable: mockConfig }
        )

        mockAssertElementVisible.mockResolvedValue(false)
        mockConfig.use_screenshot = false
        failureWithoutScreenshot = await assertElementVisibleTool.invoke(
          { keywords: 'test' },
          { configurable: mockConfig }
        )
      })

      afterAll(() => {
        mockAssertElementVisible.mockRestore()
        mockInvoke.mockRestore()
        mockConfig.ref = {
          debug: true,
          frame: undefined,
          input: 'test',
          openAIOptions: {},
          snapshot: '',
          store: undefined
        }
        mockConfig.use_screenshot = true
      })

      test('Then the result is as expected', () => {
        expect(successWithScreenshot).toBe('Element is visible')
        expect(failureWithoutScreenshot).toBe('Element is invisible')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertElementVisible).toHaveBeenCalledWith(mockConfig.ref, { xpath: '//*[@id="targetDiv"]' })
      })
    })

    describe('When the AssertElementNotVisible tool is used', () => {
      const assertElementNotVisibleTool = assertTools[3]
      let successWithScreenshot: string
      let failureWithoutScreenshot: string

      beforeAll(async () => {
        mockAssertElementNotVisible.mockResolvedValue(true)
        mockInvoke.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
        mockConfig.use_screenshot = true
        successWithScreenshot = await assertElementNotVisibleTool.invoke(
          { keywords: 'test' },
          { configurable: mockConfig }
        )

        mockAssertElementNotVisible.mockResolvedValue(false)
        mockConfig.use_screenshot = false
        failureWithoutScreenshot = await assertElementNotVisibleTool.invoke(
          { keywords: 'test' },
          { configurable: mockConfig }
        )
      })

      afterAll(() => {
        mockAssertElementNotVisible.mockRestore()
        mockInvoke.mockRestore()
        mockConfig.ref = {
          debug: true,
          frame: undefined,
          input: 'test',
          openAIOptions: {},
          snapshot: '',
          store: undefined
        }
        mockConfig.use_screenshot = true
      })

      test('Then the result is as expected', () => {
        expect(successWithScreenshot).toBe('Element is invisible')
        expect(failureWithoutScreenshot).toBe('Element is visible')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertElementNotVisible).toHaveBeenCalledWith(mockConfig.ref, { xpath: '//*[@id="targetDiv"]' })
      })
    })

    describe('When the AssertPageContains tool is used', () => {
      const assertPageContainsTool = assertTools[4]
      let success: string
      let failure: string

      beforeAll(async () => {
        mockAssertPageContains.mockResolvedValue(true)
        success = await assertPageContainsTool.invoke({ text: 'ID' }, { configurable: mockConfig })

        mockAssertPageContains.mockResolvedValue(false)
        failure = await assertPageContainsTool.invoke({ text: 'ID' }, { configurable: mockConfig })
      })

      afterAll(() => mockAssertPageContains.mockRestore())

      test('Then the result is as expected', () => {
        expect(success).toBe('Page contains text: ID')
        expect(failure).toBe('Page does not contain text: ID')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertPageContains).toHaveBeenCalledWith(mockConfig.ref, { text: 'ID' })
      })
    })

    describe('When the AssertPageDoesNotContain tool is used', () => {
      const assertPageDoesNotContainTool = assertTools[5]
      let success: string
      let failure: string

      beforeAll(async () => {
        mockAssertPageDoesNotContain.mockResolvedValue(true)
        success = await assertPageDoesNotContainTool.invoke({ text: 'ID' }, { configurable: mockConfig })

        mockAssertPageDoesNotContain.mockResolvedValue(false)
        failure = await assertPageDoesNotContainTool.invoke({ text: 'ID' }, { configurable: mockConfig })
      })

      afterAll(() => mockAssertPageDoesNotContain.mockRestore())

      test('Then the result is as expected', () => {
        expect(success).toBe('Page does not contain text: ID')
        expect(failure).toBe('Page contains text: ID')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertPageDoesNotContain).toHaveBeenCalledWith(mockConfig.ref, { text: 'ID' })
      })
    })

    describe('When the AssertPageTitleEquals tool is used', () => {
      const assertPageTitleEqualsTool = assertTools[6]
      let success: string
      let failure: string

      beforeAll(async () => {
        mockAssertPageTitleEquals.mockResolvedValue(true)
        success = await assertPageTitleEqualsTool.invoke({ text: 'Title' }, { configurable: mockConfig })

        mockAssertPageTitleEquals.mockResolvedValue(false)
        failure = await assertPageTitleEqualsTool.invoke({ text: 'Title' }, { configurable: mockConfig })
      })

      afterAll(() => mockAssertPageTitleEquals.mockRestore())

      test('Then the result is as expected', () => {
        expect(success).toBe('Page title is equal to: Title')
        expect(failure).toBe('Page title is not equal to: Title')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertPageTitleEquals).toHaveBeenCalledWith(mockConfig.ref, { text: 'Title' })
      })
    })

    describe('When the AssertPageUrlMatches tool is used', () => {
      const assertPageUrlMatchesTool = assertTools[7]
      let success: string
      let failure: string

      beforeAll(async () => {
        mockAssertPageUrlMatches.mockResolvedValue(true)
        success = await assertPageUrlMatchesTool.invoke(
          { pattern: 'https://example.com' },
          { configurable: mockConfig }
        )

        mockAssertPageUrlMatches.mockResolvedValue(false)
        failure = await assertPageUrlMatchesTool.invoke(
          { pattern: 'https://example.com' },
          { configurable: mockConfig }
        )
      })

      afterAll(() => mockAssertPageUrlMatches.mockRestore())

      test('Then the result is as expected', () => {
        expect(success).toBe('Page URL matches the pattern: https://example.com')
        expect(failure).toBe('Page URL does not match the pattern: https://example.com')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertPageUrlMatches).toHaveBeenCalledWith(mockConfig.ref, { pattern: 'https://example.com' })
      })
    })
  })
})
