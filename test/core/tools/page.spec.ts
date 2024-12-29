import { Document } from '@langchain/core/documents'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import * as tools from '../../../packages/core/src/tools'

const {
  mockClick,
  mockGetAttribute,
  mockGetImageInformation,
  mockGetSnapshot,
  mockGetText,
  mockGoBack,
  mockGoTo,
  mockHover,
  mockInput,
  mockPressKeys,
  mockScroll,
  mockSearchDocuments,
  mockSelect,
  mockSleep,
  mockSwitchFrame,
  mockWaitForText
} = vi.hoisted(() => ({
  mockClick: vi.fn(),
  mockConsoleLog: vi.spyOn(console, 'log').mockImplementation(() => {}),
  mockGetAttribute: vi.fn(),
  mockGetImageInformation: vi.fn(),
  mockGetSnapshot: vi.fn(),
  mockGetText: vi.fn(),
  mockGoBack: vi.fn(),
  mockGoTo: vi.fn(),
  mockHover: vi.fn(),
  mockInput: vi.fn(),
  mockPressKeys: vi.fn(),
  mockScroll: vi.fn(),
  mockSearchDocuments: vi.fn(),
  mockSelect: vi.fn(),
  mockSleep: vi.fn(),
  mockSwitchFrame: vi.fn(),
  mockWaitForText: vi.fn()
}))

vi.mock('../../../packages/core/src/actions', () => ({
  click: mockClick,
  getAttribute: mockGetAttribute,
  getFrames: vi.fn().mockResolvedValue([]),
  getImageInformation: mockGetImageInformation,
  getSnapshot: mockGetSnapshot,
  getScreenshot: vi.fn(),
  getText: mockGetText,
  goBack: mockGoBack,
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

describe('Spec: Page Tools', () => {
  describe('Given the page tools', () => {
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
      const mockHtml = await readFile(join(__dirname, '../mocks/mockPageContent.html'), 'utf-8')
      mockGetSnapshot.mockResolvedValue(mockHtml)
    })

    afterAll(() => mockGetSnapshot.mockRestore())

    describe('When the Click tool is used', () => {
      const clickTool = tools.page[0]
      let resultWithScreenshot: string
      let resultWithoutScreenshot: string

      beforeAll(async () => {
        mockClick.mockResolvedValue('click-result')
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
        mockConfig.use_screenshot = true
        resultWithScreenshot = await clickTool.invoke({ keywords: 'test' }, { configurable: mockConfig })
        mockConfig.use_screenshot = false
        resultWithoutScreenshot = await clickTool.invoke({ keywords: 'test' }, { configurable: mockConfig })
      })

      afterAll(() => {
        mockClick.mockRestore()
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
        expect(resultWithScreenshot).toBe('click-result')
        expect(resultWithoutScreenshot).toBe('click-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockClick).toHaveBeenCalledWith(mockConfig.ref, { xpath: '//*[@id="targetDiv"]' })
      })
    })

    describe('When the GetAttribute tool is used', () => {
      const getAttributeTool = tools.page[1]
      let resultWithScreenshot: string
      let resultWithoutScreenshot: string

      beforeAll(async () => {
        mockGetAttribute.mockResolvedValue('getAttribute-result')
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
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

    describe('When the GetImageInformation tool is used', () => {
      const getImageInformationTool = tools.page[2]
      let resultWithScreenshot: string
      let resultWithoutScreenshot: string

      beforeAll(async () => {
        mockGetImageInformation.mockResolvedValue('getImageInformation-result')
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
        mockConfig.use_screenshot = true
        resultWithScreenshot = await getImageInformationTool.invoke({ keywords: 'test' }, { configurable: mockConfig })

        mockConfig.use_screenshot = false
        resultWithoutScreenshot = await getImageInformationTool.invoke(
          { keywords: 'test' },
          { configurable: mockConfig }
        )
      })

      afterAll(() => {
        mockGetImageInformation.mockRestore()
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
      })

      test('Then the result is as expected', () => {
        expect(resultWithScreenshot).toBe('getImageInformation-result')
        expect(resultWithoutScreenshot).toBe('getImageInformation-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockGetImageInformation).toHaveBeenCalledWith(mockConfig.ref, { xpath: '//*[@id="targetDiv"]' })
      })
    })

    describe('When the GetText tool is used', () => {
      const getTextTool = tools.page[3]
      let resultWithScreenshot: string
      let resultWithoutScreenshot: string

      beforeAll(async () => {
        mockGetText.mockResolvedValue('getText-result')
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
        mockConfig.use_screenshot = true
        resultWithScreenshot = await getTextTool.invoke({ keywords: 'test' }, { configurable: mockConfig })
        mockConfig.use_screenshot = false
        resultWithoutScreenshot = await getTextTool.invoke({ keywords: 'test' }, { configurable: mockConfig })
      })

      afterAll(() => {
        mockGetText.mockRestore()
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
        expect(resultWithScreenshot).toBe('getText-result')
        expect(resultWithoutScreenshot).toBe('getText-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockGetText).toHaveBeenCalledWith(mockConfig.ref, { xpath: '//*[@id="targetDiv"]' })
      })
    })

    describe('When the GoBack tool is used', () => {
      const goBackTool = tools.page[4]
      let result: string

      beforeAll(async () => {
        mockGoBack.mockResolvedValue('goBack-result')
        result = await goBackTool.invoke({}, { configurable: mockConfig })
      })

      afterAll(() => mockGoBack.mockRestore())

      test('Then the result is as expected', () => {
        expect(result).toBe('goBack-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockGoBack).toHaveBeenCalledWith(mockConfig.ref)
      })
    })

    describe('When the GoTo tool is used', () => {
      const gotoTool = tools.page[5]
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
      const hoverTool = tools.page[6]
      let resultWithScreenshot: string
      let resultWithoutScreenshot: string

      beforeAll(async () => {
        mockHover.mockResolvedValue('hover-result')
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
        mockConfig.use_screenshot = true
        resultWithScreenshot = await hoverTool.invoke({ keywords: 'test' }, { configurable: mockConfig })
        mockConfig.use_screenshot = false
        resultWithoutScreenshot = await hoverTool.invoke({ keywords: 'test' }, { configurable: mockConfig })
      })

      afterAll(() => {
        mockHover.mockRestore()
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
        expect(resultWithScreenshot).toBe('hover-result')
        expect(resultWithoutScreenshot).toBe('hover-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockHover).toHaveBeenCalledWith(mockConfig.ref, { xpath: '//*[@id="targetDiv"]' })
      })
    })

    describe('When the Input tool is used', () => {
      const inputTool = tools.page[7]
      let resultWithScreenshot: string
      let resultWithoutScreenshot: string

      beforeAll(async () => {
        mockInput.mockResolvedValue('input-result')
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<input type="text">' })])
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
        expect(resultWithScreenshot).toBe('input-result')
        expect(resultWithoutScreenshot).toBe('input-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockInput).toHaveBeenCalledWith(mockConfig.ref, { xpath: '//html/body/div/input', text: 'test' })
      })
    })

    describe('When the PressKeys tool is used', () => {
      const pressKeysTool = tools.page[8]
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
      const scrollTool = tools.page[9]
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
      const selectTool = tools.page[10]
      let resultWithScreenshot: string
      let resultWithoutScreenshot: string

      beforeAll(async () => {
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<select></select>' })])
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
        mockSearchDocuments.mockRestore()
        mockSelect.mockRestore()
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
        expect(resultWithScreenshot).toBe('select-result')
        expect(resultWithoutScreenshot).toBe('select-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockSelect).toHaveBeenCalledWith(mockConfig.ref, { xpath: '//html/body/div/select', option: 'Option 1' })
      })
    })

    describe('When the Sleep tool is used', () => {
      const sleepTool = tools.page[11]
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
      const switchFrameTool = tools.page[12]
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
        expect(returnToMainPageResult).toBe('switchFrame-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockSwitchFrame).toHaveBeenCalledWith(mockConfig.ref, { frameNumber: 0 })
      })
    })

    describe('When the WaitForText tool is used', () => {
      const waitForTextTool = tools.page[13]
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
