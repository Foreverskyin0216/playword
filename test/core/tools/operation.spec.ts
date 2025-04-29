import { Document } from '@langchain/core/documents'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import * as tools from '../../../packages/core/src/tools'

const {
  mockClick,
  mockGoTo,
  mockHover,
  mockInput,
  mockPageEvaluate,
  mockPressKeys,
  mockScroll,
  mockSearchDocuments,
  mockSelect,
  mockSleep,
  mockSwitchFrame,
  mockSwitchPage,
  mockWaitForText
} = vi.hoisted(() => ({
  mockClick: vi.fn(),
  mockGoTo: vi.fn(),
  mockHover: vi.fn(),
  mockInput: vi.fn(),
  mockPageEvaluate: vi.fn(),
  mockPressKeys: vi.fn(),
  mockScroll: vi.fn(),
  mockSearchDocuments: vi.fn(),
  mockSelect: vi.fn(),
  mockSleep: vi.fn(),
  mockSwitchFrame: vi.fn(),
  mockSwitchPage: vi.fn(),
  mockWaitForText: vi.fn()
}))

vi.mock('../../../packages/core/src/actions', () => ({
  click: mockClick,
  getFrames: vi.fn().mockResolvedValue([]),
  goto: mockGoTo,
  hover: mockHover,
  input: mockInput,
  pressKeys: mockPressKeys,
  scroll: mockScroll,
  select: mockSelect,
  sleep: mockSleep,
  switchFrame: mockSwitchFrame,
  switchPage: mockSwitchPage,
  waitForText: mockWaitForText
}))

describe('Spec: Operation Tools', () => {
  describe('Given the operation tools', () => {
    const configurable = {
      ref: {
        ai: {
          embedTexts: vi.fn(),
          getBestCandidate: vi.fn().mockResolvedValue(0),
          searchDocuments: mockSearchDocuments
        },
        page: {
          evaluate: mockPageEvaluate,
          frames: vi.fn(() => [
            {
              name: vi.fn().mockReturnValue('frame'),
              url: vi.fn().mockReturnValue('https://mock.url')
            }
          ])
        },
        recorder: { addAction: vi.fn() }
      }
    }
    const direction = 'top'
    const duration = 1000
    const keys = 'mock-keys'
    const option = 'mock-option'
    const text = 'mock-text'
    const thoughts = 'mock-thoughts'
    const url = 'https://mock.url'
    const xpath = '//html[1]/body[1]/div[1]/div[1]'

    beforeAll(async () => {
      mockPageEvaluate.mockResolvedValue([{ html: '<div id="targetDiv">ID</div>', xpath }])
      mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<div id="targetDiv">ID</div>' })])
    })

    afterAll(() => {
      mockPageEvaluate.mockReset()
      mockSearchDocuments.mockReset()
    })

    describe('When the Click tool is used', () => {
      const clickTool = tools.operation[0]

      beforeAll(() => mockClick.mockResolvedValue('click-result'))

      afterAll(() => mockClick.mockReset())

      test('Then the result is as expected', async () => {
        const result = await clickTool.invoke({ thoughts }, { configurable })
        expect(result).toBe('click-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockClick).toBeCalledWith(configurable.ref, { xpath })
      })
    })

    describe('When the GoTo tool is used', () => {
      const gotoTool = tools.operation[1]

      beforeAll(() => mockGoTo.mockResolvedValue('goto-result'))

      afterAll(() => mockGoTo.mockReset())

      test('Then the result is as expected', async () => {
        const result = await gotoTool.invoke({ url }, { configurable })
        expect(result).toBe('goto-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockGoTo).toBeCalledWith(configurable.ref, { url })
      })
    })

    describe('When the Hover tool is used', () => {
      const hoverTool = tools.operation[2]

      beforeAll(() => mockHover.mockResolvedValue('hover-result'))

      afterAll(() => mockHover.mockReset())

      test('Then the result is as expected', async () => {
        const result = await hoverTool.invoke({ duration, thoughts }, { configurable })
        expect(result).toBe('hover-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockHover).toBeCalledWith(configurable.ref, { duration, xpath })
      })
    })

    describe('When the Input tool is used', () => {
      const inputTool = tools.operation[3]
      const xpath = '//html[1]/body[1]/div[1]/input[1]'

      beforeAll(() => {
        mockInput.mockResolvedValue('input-result')
        mockPageEvaluate.mockResolvedValue([{ html: '<input type="text" />', xpath }])
        mockSearchDocuments.mockReset()
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<input type="text" />' })])
      })

      afterAll(() => {
        mockInput.mockReset()
        mockPageEvaluate.mockReset()
      })

      test('Then the result is as expected', async () => {
        const result = await inputTool.invoke({ text, thoughts }, { configurable })
        expect(result).toBe('input-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockInput).toBeCalledWith(configurable.ref, { text, xpath })
      })
    })

    describe('When the PressKeys tool is used', () => {
      const pressKeysTool = tools.operation[4]

      beforeAll(() => mockPressKeys.mockResolvedValue('pressKeys-result'))

      afterAll(() => mockPressKeys.mockReset())

      test('Then the result is as expected', async () => {
        const result = await pressKeysTool.invoke({ keys }, { configurable })
        expect(result).toBe('pressKeys-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockPressKeys).toBeCalledWith(configurable.ref, { keys })
      })
    })

    describe('When the Scroll tool is used', () => {
      const scrollTool = tools.operation[5]

      beforeAll(() => mockScroll.mockResolvedValue('scroll-result'))

      afterAll(() => mockScroll.mockReset())

      test('Then the result is as expected', async () => {
        const result = await scrollTool.invoke({ direction }, { configurable })
        expect(result).toBe('scroll-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockScroll).toBeCalledWith(configurable.ref, { direction })
      })
    })

    describe('When the Select tool is used', () => {
      const selectTool = tools.operation[6]
      const xpath = '//html[1]/body[1]/div[1]/select[1]'

      beforeAll(async () => {
        mockPageEvaluate.mockResolvedValue([{ html: '<select></select>', xpath }])
        mockSearchDocuments.mockReset()
        mockSearchDocuments.mockResolvedValue([new Document({ pageContent: '<select></select>' })])
        mockSelect.mockResolvedValue('select-result')
      })

      afterAll(() => {
        mockPageEvaluate.mockReset()
        mockSelect.mockReset()
      })

      test('Then the result is as expected', async () => {
        const result = await selectTool.invoke({ option, thoughts }, { configurable })
        expect(result).toBe('select-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockSelect).toBeCalledWith(configurable.ref, { option, xpath })
      })
    })

    describe('When the Sleep tool is used', () => {
      const sleepTool = tools.operation[7]

      beforeAll(() => mockSleep.mockResolvedValue('sleep-result'))

      afterAll(() => mockSleep.mockReset())

      test('Then the result is as expected', async () => {
        const result = await sleepTool.invoke({ duration }, { configurable })
        expect(result).toBe('sleep-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockSleep).toBeCalledWith(configurable.ref, { duration })
      })
    })

    describe('When the SwitchFrame tool is used', () => {
      const switchFrameTool = tools.operation[8]

      beforeAll(() => mockSwitchFrame.mockResolvedValue('switchFrame-result'))

      afterAll(() => mockSwitchFrame.mockReset())

      test('Then the result is as expected', async () => {
        const results = await Promise.all([
          switchFrameTool.invoke({ enterFrame: true, thoughts }, { configurable }),
          switchFrameTool.invoke({ enterFrame: false, thoughts }, { configurable })
        ])
        expect(results).toEqual(['switchFrame-result', 'switchFrame-result'])
      })

      test('Then the actions are called as expected', () => {
        expect(mockSwitchFrame).toBeCalledWith(configurable.ref, { frameNumber: 0 })
      })
    })

    describe('When the SwitchPage tool is used', () => {
      const switchPageTool = tools.operation[9]

      beforeAll(() => mockSwitchPage.mockResolvedValue('switchPage-result'))

      afterAll(() => mockSwitchPage.mockReset())

      test('Then the result is as expected', async () => {
        const result = await switchPageTool.invoke({ pageNumber: 0 }, { configurable })
        expect(result).toBe('switchPage-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockSwitchPage).toBeCalledWith(configurable.ref, { pageNumber: 0 })
      })
    })

    describe('When the WaitForText tool is used', () => {
      const waitForTextTool = tools.operation[10]

      beforeAll(() => mockWaitForText.mockResolvedValue('waitForText-result'))

      afterAll(() => mockWaitForText.mockReset())

      test('Then the result is as expected', async () => {
        const result = await waitForTextTool.invoke({ text }, { configurable })
        expect(result).toBe('waitForText-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockWaitForText).toBeCalledWith(configurable.ref, { text })
      })
    })
  })
})
