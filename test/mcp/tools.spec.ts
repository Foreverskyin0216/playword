import type { ToolResponse } from '../../packages/mcp/src/types'

import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { Context } from '../../packages/mcp/src/context'
import { callPlayWord, closePlayWord } from '../../packages/mcp/src/tools'

const { mockBrowserClose, mockContextClose, mockPageClose, mockSay } = vi.hoisted(() => ({
  mockBrowserClose: vi.fn(),
  mockContextClose: vi.fn(),
  mockPageClose: vi.fn(),
  mockSay: vi.fn()
}))

vi.mock('@playword/core', () => ({
  PlayWord: vi.fn(() => ({ context: { close: mockContextClose }, page: { close: mockPageClose }, say: mockSay }))
}))

vi.mock('playwright-core', () => ({
  chromium: { launch: vi.fn(() => ({ close: mockBrowserClose, newContext: vi.fn() })) },
  firefox: { launch: vi.fn(() => ({ close: mockBrowserClose, newContext: vi.fn() })) },
  webkit: { launch: vi.fn(() => ({ close: mockBrowserClose, newContext: vi.fn() })) }
}))

describe('Spec: Tools', () => {
  describe('Given the closePlayWord tool', () => {
    describe('When the tool is called', () => {
      let response: ToolResponse

      beforeAll(async () => {
        const context = new Context()
        await context.createPlayWord()
        response = await closePlayWord.handle(context)
      })

      afterAll(() => {
        mockBrowserClose.mockClear()
        mockContextClose.mockClear()
        mockPageClose.mockClear()
      })

      test('Then it should return the correct response', () => {
        expect(response).toEqual({ content: [{ type: 'text', text: 'PlayWord instance closed.' }] })
      })

      test('Then it should call the close method of the Browser instance', () => {
        expect(mockBrowserClose).toBeCalled()
      })

      test('Then it should call the close method of the Context instance', () => {
        expect(mockContextClose).toBeCalled()
      })

      test('Then it should call the close method of the Page instance', () => {
        expect(mockPageClose).toBeCalled()
      })
    })
  })

  describe('Given the CallPlayWord tool', () => {
    describe('When the tool is called', () => {
      beforeAll(() => mockSay.mockResolvedValue('CallPlayWord result'))

      afterAll(() => mockSay.mockClear())

      for (const browserType of ['chrome', 'chromium', 'firefox', 'msedge', 'webkit']) {
        test('Then it should return the correct response', async () => {
          const context = new Context({ browserType })
          const response = await callPlayWord.handle(context, { input: 'CallPlayWord input' })
          expect(response).toEqual({ content: [{ type: 'text', text: 'CallPlayWord result' }] })
        })
      }

      test('Then it should throw an error if the passed browser is invalid', async () => {
        const context = new Context({ browserType: 'Opera' })
        await expect(callPlayWord.handle(context, { input: '' })).rejects.toThrow('Invalid browser type: Opera')
      })
    })
  })
})
