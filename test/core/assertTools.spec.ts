import { Document } from '@langchain/core/documents'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import assertTools from '../../packages/core/src/assertTools'

const {
  mockAssertElementContentEquals,
  mockAssertElementContentNotEquals,
  mockAssertElementVisible,
  mockAssertElementNotVisible,
  mockAssertImageContains,
  mockAssertPageContains,
  mockAssertPageDoesNotContain,
  mockAssertPageTitleEquals,
  mockAssertPageUrlMatches,
  mockGetSnapshot,
  mockSearchDocuments
} = vi.hoisted(() => ({
  mockAssertElementContentEquals: vi.fn(),
  mockAssertElementContentNotEquals: vi.fn(),
  mockAssertElementVisible: vi.fn(),
  mockAssertElementNotVisible: vi.fn(),
  mockAssertImageContains: vi.fn(),
  mockAssertPageContains: vi.fn(),
  mockAssertPageDoesNotContain: vi.fn(),
  mockAssertPageTitleEquals: vi.fn(),
  mockAssertPageUrlMatches: vi.fn(),
  mockConsoleLog: vi.spyOn(console, 'log').mockImplementation(() => {}),
  mockGetSnapshot: vi.fn(),
  mockSearchDocuments: vi.fn()
}))

vi.mock('../../packages/core/src/actions', () => ({
  assertElementContentEquals: mockAssertElementContentEquals,
  assertElementContentNotEquals: mockAssertElementContentNotEquals,
  assertElementVisible: mockAssertElementVisible,
  assertElementNotVisible: mockAssertElementNotVisible,
  assertImageContains: mockAssertImageContains,
  assertPageContains: mockAssertPageContains,
  assertPageDoesNotContain: mockAssertPageDoesNotContain,
  assertPageTitleEquals: mockAssertPageTitleEquals,
  assertPageUrlMatches: mockAssertPageUrlMatches,
  getScreenshot: vi.fn(),
  getSnapshot: mockGetSnapshot,
  mark: vi.fn(),
  unmark: vi.fn()
}))

describe('Spec: Assert Tools', () => {
  describe('Given the assert tools', () => {
    const mockConfig = {
      ref: {
        ai: {
          embedDocuments: vi.fn(),
          getBestCandidate: vi.fn().mockResolvedValue(0),
          searchDocuments: mockSearchDocuments
        },
        debug: true,
        elements: [],
        input: 'test',
        logger: { text: '' },
        record: true,
        recordings: [{ input: 'test', actions: [] }],
        snapshot: '',
        step: 0
      },
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
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
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
        mockSearchDocuments.mockRestore()
        mockConfig.ref = {
          ai: {
            embedDocuments: vi.fn(),
            getBestCandidate: vi.fn().mockResolvedValue(0),
            searchDocuments: mockSearchDocuments
          },
          debug: true,
          elements: [],
          input: 'test',
          logger: { text: '' },
          record: true,
          recordings: [{ input: 'test', actions: [] }],
          snapshot: '',
          step: 0
        }
        mockConfig.use_screenshot = true
      })

      test('Then the result is as expected', () => {
        expect(successWithScreenshot).toBe('PASS: Element content is equal to: ID')
        expect(failureWithoutScreenshot).toBe('FAIL: Element content is not equal to: ID')
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
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
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
        mockSearchDocuments.mockRestore()
        mockConfig.ref = {
          ai: {
            embedDocuments: vi.fn(),
            getBestCandidate: vi.fn().mockResolvedValue(0),
            searchDocuments: mockSearchDocuments
          },
          debug: true,
          elements: [],
          input: 'test',
          logger: { text: '' },
          record: true,
          recordings: [{ input: 'test', actions: [] }],
          snapshot: '',
          step: 0
        }
        mockConfig.use_screenshot = true
      })

      test('Then the result is as expected', () => {
        expect(successWithScreenshot).toBe('PASS: Element content is not equal to: ID')
        expect(failureWithoutScreenshot).toBe('FAIL: Element content is equal to: ID')
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
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
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
        mockSearchDocuments.mockRestore()
        mockConfig.ref = {
          ai: {
            embedDocuments: vi.fn(),
            getBestCandidate: vi.fn().mockResolvedValue(0),
            searchDocuments: mockSearchDocuments
          },
          debug: true,
          elements: [],
          input: 'test',
          logger: { text: '' },
          record: true,
          recordings: [{ input: 'test', actions: [] }],
          snapshot: '',
          step: 0
        }
        mockConfig.use_screenshot = true
      })

      test('Then the result is as expected', () => {
        expect(successWithScreenshot).toBe('PASS: Element is visible')
        expect(failureWithoutScreenshot).toBe('FAIL: Element is invisible')
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
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
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
        mockSearchDocuments.mockRestore()
        mockConfig.ref = {
          ai: {
            embedDocuments: vi.fn(),
            getBestCandidate: vi.fn().mockResolvedValue(0),
            searchDocuments: mockSearchDocuments
          },
          debug: true,
          elements: [],
          input: 'test',
          logger: { text: '' },
          record: true,
          recordings: [{ input: 'test', actions: [] }],
          snapshot: '',
          step: 0
        }
        mockConfig.use_screenshot = true
      })

      test('Then the result is as expected', () => {
        expect(successWithScreenshot).toBe('PASS: Element is invisible')
        expect(failureWithoutScreenshot).toBe('FAIL: Element is visible')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertElementNotVisible).toHaveBeenCalledWith(mockConfig.ref, { xpath: '//*[@id="targetDiv"]' })
      })
    })

    describe('When the AssertImageContains tool is used', () => {
      const assertImageContainsTool = assertTools[4]
      let successWithScreenshot: string
      let failureWithoutScreenshot: string

      beforeAll(async () => {
        mockAssertImageContains.mockResolvedValue(true)
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
        mockConfig.use_screenshot = true
        successWithScreenshot = await assertImageContainsTool.invoke({ keywords: 'test' }, { configurable: mockConfig })

        mockAssertImageContains.mockResolvedValue(false)
        mockConfig.use_screenshot = false
        failureWithoutScreenshot = await assertImageContainsTool.invoke(
          { keywords: 'test' },
          { configurable: mockConfig }
        )
      })

      afterAll(() => {
        mockAssertImageContains.mockRestore()
        mockSearchDocuments.mockRestore()
        mockConfig.ref = {
          ai: {
            embedDocuments: vi.fn(),
            getBestCandidate: vi.fn().mockResolvedValue(0),
            searchDocuments: mockSearchDocuments
          },
          debug: true,
          elements: [],
          input: 'test',
          logger: { text: '' },
          record: true,
          recordings: [{ input: 'test', actions: [] }],
          snapshot: '',
          step: 0
        }
        mockConfig.use_screenshot = true
      })

      test('Then the result is as expected', () => {
        expect(successWithScreenshot).toBe('PASS: Image contains the information')
        expect(failureWithoutScreenshot).toBe('FAIL: Image does not contain the information')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertImageContains).toHaveBeenCalledWith(mockConfig.ref, { xpath: '//*[@id="targetDiv"]' })
      })
    })

    describe('When the AssertPageContains tool is used', () => {
      const assertPageContainsTool = assertTools[5]
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
        expect(success).toBe('PASS: Page contains text: ID')
        expect(failure).toBe('FAIL: Page does not contain text: ID')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertPageContains).toHaveBeenCalledWith(mockConfig.ref, { text: 'ID' })
      })
    })

    describe('When the AssertPageDoesNotContain tool is used', () => {
      const assertPageDoesNotContainTool = assertTools[6]
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
        expect(success).toBe('PASS: Page does not contain text: ID')
        expect(failure).toBe('FAIL: Page contains text: ID')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertPageDoesNotContain).toHaveBeenCalledWith(mockConfig.ref, { text: 'ID' })
      })
    })

    describe('When the AssertPageTitleEquals tool is used', () => {
      const assertPageTitleEqualsTool = assertTools[7]
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
        expect(success).toBe('PASS: Page title is equal to: Title')
        expect(failure).toBe('FAIL: Page title is not equal to: Title')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertPageTitleEquals).toHaveBeenCalledWith(mockConfig.ref, { text: 'Title' })
      })
    })

    describe('When the AssertPageUrlMatches tool is used', () => {
      const assertPageUrlMatchesTool = assertTools[8]
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
        expect(success).toBe('PASS: Page URL matches the pattern: https://example.com')
        expect(failure).toBe('FAIL: Page URL does not match the pattern: https://example.com')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertPageUrlMatches).toHaveBeenCalledWith(mockConfig.ref, { pattern: 'https://example.com' })
      })
    })
  })
})
