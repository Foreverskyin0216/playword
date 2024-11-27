import { Document } from '@langchain/core/documents'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import pageTools from '../src/pageTools'

const {
  mockClick,
  mockGetAttribute,
  mockGetSnapshot,
  mockGoTo,
  mockHover,
  mockInput,
  mockInvoke,
  mockPressKeys,
  mockScroll,
  mockSelect,
  mockSleep,
  mockSwitchFrame,
  mockWaitForText
} = vi.hoisted(() => ({
  mockClick: vi.fn(),
  mockConsoleLog: vi.spyOn(console, 'log').mockImplementation(() => {}),
  mockGetAttribute: vi.fn(),
  mockGetSnapshot: vi.fn(),
  mockGoTo: vi.fn(),
  mockHover: vi.fn(),
  mockInput: vi.fn(),
  mockInvoke: vi.fn(),
  mockPressKeys: vi.fn(),
  mockScroll: vi.fn(),
  mockSelect: vi.fn(),
  mockSleep: vi.fn(),
  mockSwitchFrame: vi.fn(),
  mockWaitForText: vi.fn()
}))

vi.mock('../src/actions', () => ({
  click: mockClick,
  getAttribute: mockGetAttribute,
  getFrames: vi.fn(),
  getSnapshot: mockGetSnapshot,
  getScreenshot: vi.fn(),
  goto: mockGoTo,
  hover: mockHover,
  input: mockInput,
  mark: vi.fn(),
  pressKeys: mockPressKeys,
  scroll: mockScroll,
  select: mockSelect,
  sleep: mockSleep,
  switchFrame: mockSwitchFrame,
  unmark: vi.fn(),
  waitForText: mockWaitForText
}))

vi.mock('../src/ai', () => ({
  AI: vi.fn(() => ({
    embedDocuments: vi.fn(() => ({ asRetriever: vi.fn(() => ({ invoke: mockInvoke })) })),
    getBestCandidate: vi.fn().mockResolvedValue(0)
  }))
}))

describe('Spec: Page Tools', () => {
  describe('Given the page tools', () => {
    const mockConfig = {
      ref: { debug: true, frame: undefined, input: 'test', openAIOptions: {}, snapshot: '', store: undefined },
      use_screenshot: true
    }

    beforeAll(async () => {
      const mockHtml = await readFile(join(__dirname, 'mocks/mockPageContent.html'), 'utf-8')
      mockGetSnapshot.mockResolvedValue(mockHtml)
    })

    afterAll(() => mockGetSnapshot.mockRestore())

    describe('When the Click tool is used', () => {
      const clickTool = pageTools[0]
      let resultWithScreenshot: string
      let resultWithoutScreenshot: string

      beforeAll(async () => {
        mockClick.mockResolvedValue('click-result')
        mockInvoke.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
        mockConfig.use_screenshot = true
        resultWithScreenshot = await clickTool.invoke({ keywords: 'test' }, { configurable: mockConfig })
        mockConfig.use_screenshot = false
        resultWithoutScreenshot = await clickTool.invoke({ keywords: 'test' }, { configurable: mockConfig })
      })

      afterAll(() => {
        mockClick.mockRestore()
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
        expect(resultWithScreenshot).toBe('click-result')
        expect(resultWithoutScreenshot).toBe('click-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockClick).toHaveBeenCalledWith(mockConfig.ref, { xpath: '//*[@id="targetDiv"]' })
      })
    })

    describe('When the GetAttribute tool is used', () => {
      const getAttributeTool = pageTools[1]
      let resultWithScreenshot: string
      let resultWithoutScreenshot: string

      beforeAll(async () => {
        mockGetAttribute.mockResolvedValue('getAttribute-result')
        mockInvoke.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
        mockConfig.use_screenshot = true
        resultWithScreenshot = await getAttributeTool.invoke(
          { attribute: 'id', keywords: 'test' },
          { configurable: mockConfig }
        )
        mockConfig.use_screenshot = false
        resultWithoutScreenshot = await getAttributeTool.invoke(
          { attribute: 'id', keywords: 'test' },
          { configurable: mockConfig }
        )
      })

      afterAll(() => {
        mockGetAttribute.mockRestore()
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
        expect(resultWithScreenshot).toBe('getAttribute-result')
        expect(resultWithoutScreenshot).toBe('getAttribute-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockGetAttribute).toHaveBeenCalledWith(mockConfig.ref, {
          attribute: 'id',
          xpath: '//*[@id="targetDiv"]'
        })
      })
    })

    describe('When the GoTo tool is used', () => {
      const gotoTool = pageTools[2]
      let result: string

      beforeAll(async () => {
        mockGoTo.mockResolvedValue('goto-result')
        result = await gotoTool.invoke({ url: 'https://test.url' }, { configurable: mockConfig })
      })

      afterAll(() => mockGoTo.mockRestore())

      test('Then the result is as expected', () => {
        expect(result).toBe('goto-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockGoTo).toHaveBeenCalledWith(mockConfig.ref, { url: 'https://test.url' })
      })
    })

    describe('When the Hover tool is used', () => {
      const hoverTool = pageTools[3]
      let resultWithScreenshot: string
      let resultWithoutScreenshot: string

      beforeAll(async () => {
        mockHover.mockResolvedValue('hover-result')
        mockInvoke.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
        mockConfig.use_screenshot = true
        resultWithScreenshot = await hoverTool.invoke({ keywords: 'test' }, { configurable: mockConfig })
        mockConfig.use_screenshot = false
        resultWithoutScreenshot = await hoverTool.invoke({ keywords: 'test' }, { configurable: mockConfig })
      })

      afterAll(() => {
        mockHover.mockRestore()
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
        expect(resultWithScreenshot).toBe('hover-result')
        expect(resultWithoutScreenshot).toBe('hover-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockHover).toHaveBeenCalledWith(mockConfig.ref, { xpath: '//*[@id="targetDiv"]' })
      })
    })

    describe('When the Input tool is used', () => {
      const inputTool = pageTools[4]
      let resultWithScreenshot: string
      let resultWithoutScreenshot: string

      beforeAll(async () => {
        mockInput.mockResolvedValue('input-result')
        mockInvoke.mockResolvedValue([new Document({ pageContent: '<input type="text">' })])
        mockConfig.use_screenshot = true
        resultWithScreenshot = await inputTool.invoke({ keywords: 'test', text: 'test' }, { configurable: mockConfig })
        mockConfig.use_screenshot = false
        resultWithoutScreenshot = await inputTool.invoke(
          { keywords: 'test', text: 'test' },
          { configurable: mockConfig }
        )
      })

      afterAll(() => {
        mockInput.mockRestore()
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
        expect(resultWithScreenshot).toBe('input-result')
        expect(resultWithoutScreenshot).toBe('input-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockInput).toHaveBeenCalledWith(mockConfig.ref, { xpath: '//html/body/div/input', text: 'test' })
      })
    })

    describe('When the PressKeys tool is used', () => {
      const pressKeysTool = pageTools[5]
      let result: string

      beforeAll(async () => {
        mockPressKeys.mockResolvedValue('pressKeys-result')
        result = await pressKeysTool.invoke({ keys: 'test' }, { configurable: mockConfig })
      })

      afterAll(() => mockPressKeys.mockRestore())

      test('Then the result is as expected', () => {
        expect(result).toBe('pressKeys-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockPressKeys).toHaveBeenCalledWith(mockConfig.ref, { keys: 'test' })
      })
    })

    describe('When the Scroll tool is used', () => {
      const scrollTool = pageTools[6]
      let result: string

      beforeAll(async () => {
        mockScroll.mockResolvedValue('scroll-result')
        result = await scrollTool.invoke({ direction: 'top' }, { configurable: mockConfig })
      })

      afterAll(() => mockScroll.mockRestore())

      test('Then the result is as expected', () => {
        expect(result).toBe('scroll-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockScroll).toHaveBeenCalledWith(mockConfig.ref, { direction: 'top' })
      })
    })

    describe('When the Select tool is used', () => {
      const selectTool = pageTools[7]
      let resultWithScreenshot: string
      let resultWithoutScreenshot: string

      beforeAll(async () => {
        mockInvoke.mockResolvedValue([new Document({ pageContent: '<select></select>' })])
        mockSelect.mockResolvedValue('select-result')
        mockConfig.use_screenshot = true
        resultWithScreenshot = await selectTool.invoke(
          { keywords: 'test', option: 'Option 1' },
          { configurable: mockConfig }
        )

        mockConfig.use_screenshot = false
        resultWithoutScreenshot = await selectTool.invoke(
          { keywords: 'test', option: 'Option 1' },
          { configurable: mockConfig }
        )
      })

      afterAll(() => {
        mockInvoke.mockRestore()
        mockSelect.mockRestore()
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
        expect(resultWithScreenshot).toBe('select-result')
        expect(resultWithoutScreenshot).toBe('select-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockSelect).toHaveBeenCalledWith(mockConfig.ref, { xpath: '//html/body/div/select', option: 'Option 1' })
      })
    })

    describe('When the Sleep tool is used', () => {
      const sleepTool = pageTools[8]
      let result: string

      beforeAll(async () => {
        mockSleep.mockResolvedValue('sleep-result')
        result = await sleepTool.invoke({ duration: 1 }, { configurable: mockConfig })
      })

      afterAll(() => mockSleep.mockRestore())

      test('Then the result is as expected', () => {
        expect(result).toBe('sleep-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockSleep).toHaveBeenCalledWith(mockConfig.ref, { duration: 1 })
      })
    })

    describe('When the SwitchFrame tool is used', () => {
      const switchFrameTool = pageTools[9]
      let enterFrameResult: string
      let returnToMainPageResult: string

      beforeAll(async () => {
        mockSwitchFrame.mockResolvedValue('switchFrame-result')
        enterFrameResult = await switchFrameTool.invoke({ enterFrame: true }, { configurable: mockConfig })
        returnToMainPageResult = await switchFrameTool.invoke({ enterFrame: false }, { configurable: mockConfig })
      })

      afterAll(() => mockSwitchFrame.mockRestore())

      test('Then the result is as expected', () => {
        expect(enterFrameResult).toBe('switchFrame-result')
        expect(returnToMainPageResult).toBe('Switched to main page')
      })

      test('Then the actions are called as expected', () => {
        expect(mockSwitchFrame).toHaveBeenCalledWith(mockConfig.ref, { frameNumber: 0 })
      })
    })

    describe('When the WaitForText tool is used', () => {
      const waitForTextTool = pageTools[10]
      let result: string

      beforeAll(async () => {
        mockWaitForText.mockResolvedValue('waitForText-result')
        result = await waitForTextTool.invoke({ text: 'test' }, { configurable: mockConfig })
      })

      afterAll(() => mockWaitForText.mockRestore())

      test('Then the result is as expected', () => {
        expect(result).toBe('waitForText-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockWaitForText).toHaveBeenCalledWith(mockConfig.ref, { text: 'test' })
      })
    })
  })
})
