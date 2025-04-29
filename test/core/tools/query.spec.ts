import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import * as tools from '../../../packages/core/src/tools'

const { mockGetText } = vi.hoisted(() => ({ mockGetText: vi.fn() }))

vi.mock('../../../packages/core/src/actions', () => ({ getText: mockGetText }))

describe('Spec: Query Tools', () => {
  describe('Given the query tools', () => {
    const input = 'mock-input'
    const configurable = { ref: { input, recorder: { addAction: vi.fn() } } }

    describe('When the GetText tool is used', () => {
      const getTextTool = tools.query[0]

      beforeAll(() => mockGetText.mockResolvedValue('get-text-result'))

      afterAll(() => mockGetText.mockReset())

      test('Then the result is as expected', async () => {
        const result = await getTextTool.invoke({}, { configurable })
        expect(result).toBe('get-text-result')
      })

      test('Then the actions are called as expected', () => {
        expect(mockGetText).toBeCalledWith(configurable.ref, { input })
      })
    })
  })
})
