import { Document } from '@langchain/core/documents'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import * as tools from '../../../packages/core/src/tools'

const {
  mockAssertElementContains,
  mockAssertElementNotContain,
  mockAssertElementContentEquals,
  mockAssertElementContentNotEqual,
  mockAssertElementVisible,
  mockAssertElementNotVisible,
  mockAssertPageContains,
  mockAssertPageNotContain,
  mockAssertPageTitleEquals,
  mockAssertPageUrlMatches,
  mockGetSnapshot,
  mockSearchDocuments
} = vi.hoisted(() => ({
  mockAssertElementContains: vi.fn(),
  mockAssertElementNotContain: vi.fn(),
  mockAssertElementContentEquals: vi.fn(),
  mockAssertElementContentNotEqual: vi.fn(),
  mockAssertElementVisible: vi.fn(),
  mockAssertElementNotVisible: vi.fn(),
  mockAssertPageContains: vi.fn(),
  mockAssertPageNotContain: vi.fn(),
  mockAssertPageTitleEquals: vi.fn(),
  mockAssertPageUrlMatches: vi.fn(),
  mockGetSnapshot: vi.fn(),
  mockSearchDocuments: vi.fn()
}))

vi.mock('../../../packages/core/src/actions', () => ({
  assertElementContains: mockAssertElementContains,
  assertElementNotContain: mockAssertElementNotContain,
  assertElementContentEquals: mockAssertElementContentEquals,
  assertElementContentNotEqual: mockAssertElementContentNotEqual,
  assertElementVisible: mockAssertElementVisible,
  assertElementNotVisible: mockAssertElementNotVisible,
  assertPageContains: mockAssertPageContains,
  assertPageNotContain: mockAssertPageNotContain,
  assertPageTitleEquals: mockAssertPageTitleEquals,
  assertPageUrlMatches: mockAssertPageUrlMatches,
  getSnapshot: mockGetSnapshot
}))

describe('Spec: Assert Tools', () => {
  describe('Given the assert tools', () => {
    const configurable = {
      ref: {
        ai: {
          embedTexts: vi.fn(),
          getBestCandidate: vi.fn().mockResolvedValue(0),
          searchDocuments: mockSearchDocuments
        },
        input: 'test',
        recorder: { addAction: vi.fn() }
      }
    }
    const keywords = 'mock-keywords'
    const pattern = 'mock-pattern'
    const text = 'mock-text'
    const xpath = '//html[1]/body[1]/div[1]/div[1]'

    beforeAll(async () => {
      const mockHTML = await readFile(join(__dirname, '../mocks/mockPageContent.html'), 'utf-8')
      mockGetSnapshot.mockResolvedValue(mockHTML)
      mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
    })

    afterAll(() => {
      mockGetSnapshot.mockReset()
      mockSearchDocuments.mockReset()
    })

    describe('When the AssertElementContains tool is used', () => {
      const assertElementContainsTool = tools.assertion[0]

      afterAll(() => mockAssertElementContains.mockReset())

      test('Then the result is as expected', async () => {
        mockAssertElementContains.mockResolvedValue(true)
        const success = await assertElementContainsTool.invoke({ keywords, text }, { configurable })
        expect(success).toBe('PASS: Element contains text: ' + text)

        mockAssertElementContains.mockResolvedValue(false)
        const failure = await assertElementContainsTool.invoke({ keywords, text }, { configurable })
        expect(failure).toBe('FAIL: Element does not contain text: ' + text)
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertElementContains).toBeCalledWith(configurable.ref, { text, xpath })
      })
    })

    describe('When the AssertElementNotContain tool is used', () => {
      const assertElementNotContainTool = tools.assertion[1]

      afterAll(() => mockAssertElementNotContain.mockReset())

      test('Then the result is as expected', async () => {
        mockAssertElementNotContain.mockResolvedValue(true)
        const success = await assertElementNotContainTool.invoke({ keywords, text }, { configurable })
        expect(success).toBe('PASS: Element does not contain text: ' + text)

        mockAssertElementNotContain.mockResolvedValue(false)
        const failure = await assertElementNotContainTool.invoke({ keywords, text }, { configurable })
        expect(failure).toBe('FAIL: Element contains text: ' + text)
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertElementNotContain).toBeCalledWith(configurable.ref, { text, xpath })
      })
    })

    describe('When the AssertElementContentEquals tool is used', () => {
      const assertElementContentEqualsTool = tools.assertion[2]

      afterAll(() => mockAssertElementContentEquals.mockReset())

      test('Then the result is as expected', async () => {
        mockAssertElementContentEquals.mockResolvedValue(true)
        const success = await assertElementContentEqualsTool.invoke({ keywords, text }, { configurable })
        expect(success).toBe('PASS: Element content is equal to: ' + text)

        mockAssertElementContentEquals.mockResolvedValue(false)
        const failure = await assertElementContentEqualsTool.invoke({ keywords, text }, { configurable })
        expect(failure).toBe('FAIL: Element content is not equal to: ' + text)
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertElementContentEquals).toBeCalledWith(configurable.ref, { text, xpath })
      })
    })

    describe('When the AssertElementContentNotEqual tool is used', () => {
      const assertElementContentNotEqualTool = tools.assertion[3]

      afterAll(() => mockAssertElementContentNotEqual.mockReset())

      test('Then the result is as expected', async () => {
        mockAssertElementContentNotEqual.mockResolvedValue(true)
        const success = await assertElementContentNotEqualTool.invoke({ keywords, text }, { configurable })
        expect(success).toBe('PASS: Element content is not equal to: ' + text)

        mockAssertElementContentNotEqual.mockResolvedValue(false)
        const failure = await assertElementContentNotEqualTool.invoke({ keywords, text }, { configurable })
        expect(failure).toBe('FAIL: Element content is equal to: ' + text)
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertElementContentNotEqual).toBeCalledWith(configurable.ref, { text, xpath })
      })
    })

    describe('When the AssertElementVisible tool is used', () => {
      const assertElementVisibleTool = tools.assertion[4]

      beforeAll(() => {
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
      })

      afterAll(() => mockAssertElementVisible.mockReset())

      test('Then the result is as expected', async () => {
        mockAssertElementVisible.mockResolvedValue(true)
        const success = await assertElementVisibleTool.invoke({ keywords }, { configurable })
        expect(success).toBe('PASS: Element is visible')

        mockAssertElementVisible.mockResolvedValue(false)
        const failure = await assertElementVisibleTool.invoke({ keywords }, { configurable })
        expect(failure).toBe('FAIL: Element is invisible')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertElementVisible).toBeCalledWith(configurable.ref, { xpath })
      })
    })

    describe('When the AssertElementNotVisible tool is used', () => {
      const assertElementNotVisibleTool = tools.assertion[5]

      beforeAll(() => {
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
      })

      afterAll(() => mockAssertElementNotVisible.mockReset())

      test('Then the result is as expected', async () => {
        mockAssertElementNotVisible.mockResolvedValue(true)
        const success = await assertElementNotVisibleTool.invoke({ keywords }, { configurable })
        expect(success).toBe('PASS: Element is invisible')

        mockAssertElementNotVisible.mockResolvedValue(false)
        const failure = await assertElementNotVisibleTool.invoke({ keywords }, { configurable })
        expect(failure).toBe('FAIL: Element is visible')
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertElementNotVisible).toBeCalledWith(configurable.ref, { xpath })
      })
    })

    describe('When the AssertPageContains tool is used', () => {
      const assertPageContainsTool = tools.assertion[6]

      afterAll(() => mockAssertPageContains.mockReset())

      test('Then the result is as expected', async () => {
        mockAssertPageContains.mockResolvedValue(true)
        const success = await assertPageContainsTool.invoke({ text }, { configurable })
        expect(success).toBe('PASS: Page contains text: ' + text)

        mockAssertPageContains.mockResolvedValue(false)
        const failure = await assertPageContainsTool.invoke({ text }, { configurable })
        expect(failure).toBe('FAIL: Page does not contain text: ' + text)
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertPageContains).toBeCalledWith(configurable.ref, { text })
      })
    })

    describe('When the AssertPageNotContain tool is used', () => {
      const assertPageNotContainTool = tools.assertion[7]

      afterAll(() => mockAssertPageNotContain.mockReset())

      test('Then the result is as expected', async () => {
        mockAssertPageNotContain.mockResolvedValue(true)
        const success = await assertPageNotContainTool.invoke({ text }, { configurable })
        expect(success).toBe('PASS: Page does not contain text: ' + text)

        mockAssertPageNotContain.mockResolvedValue(false)
        const failure = await assertPageNotContainTool.invoke({ text }, { configurable })
        expect(failure).toBe('FAIL: Page contains text: ' + text)
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertPageNotContain).toBeCalledWith(configurable.ref, { text })
      })
    })

    describe('When the AssertPageTitleEquals tool is used', () => {
      const assertPageTitleEqualsTool = tools.assertion[8]

      afterAll(() => mockAssertPageTitleEquals.mockReset())

      test('Then the result is as expected', async () => {
        mockAssertPageTitleEquals.mockResolvedValue(true)
        const success = await assertPageTitleEqualsTool.invoke({ text }, { configurable })
        expect(success).toBe('PASS: Page title is equal to: ' + text)

        mockAssertPageTitleEquals.mockResolvedValue(false)
        const failure = await assertPageTitleEqualsTool.invoke({ text }, { configurable })
        expect(failure).toBe('FAIL: Page title is not equal to: ' + text)
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertPageTitleEquals).toBeCalledWith(configurable.ref, { text })
      })
    })

    describe('When the AssertPageUrlMatches tool is used', () => {
      const assertPageUrlMatchesTool = tools.assertion[9]

      afterAll(() => mockAssertPageUrlMatches.mockReset())

      test('Then the result is as expected', async () => {
        mockAssertPageUrlMatches.mockResolvedValue(true)
        const success = await assertPageUrlMatchesTool.invoke({ pattern }, { configurable })
        expect(success).toBe('PASS: Page URL matches the pattern: ' + pattern)

        mockAssertPageUrlMatches.mockResolvedValue(false)
        const failure = await assertPageUrlMatchesTool.invoke({ pattern }, { configurable })
        expect(failure).toBe('FAIL: Page URL does not match the pattern: ' + pattern)
      })

      test('Then the actions are called as expected', () => {
        expect(mockAssertPageUrlMatches).toBeCalledWith(configurable.ref, { pattern })
      })
    })
  })
})
