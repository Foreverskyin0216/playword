import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { tool } from '@langchain/core/tools'
import { afterAll, beforeAll, describe, test, expect, vi } from 'vitest'
import { actionGraph } from '../../packages/core/src/graph'

const { mockUseTools } = vi.hoisted(() => ({
  mockConsoleLog: vi.spyOn(console, 'log').mockImplementation(() => {}),
  mockUseTools: vi.fn()
}))

vi.mock('../../packages/core/src/tools/assertion', () => ({
  assertion: [tool(async () => 'Tool call result', { name: 'tool-call-name' })]
}))

vi.mock('../../packages/core/src/tools/page', () => ({
  page: [tool(async () => 'Tool call result', { name: 'tool-call-name' })]
}))

describe('Spec: Action Graph', () => {
  describe('Given the action graph', () => {
    describe('When the page agent is invoked', () => {
      beforeAll(() => {
        const aiResponse = new AIMessage('response')
        aiResponse.tool_calls = [{ id: 'tool-call-id', name: 'tool-call-name', args: { arg: 'tool-call-args' } }]
        mockUseTools.mockResolvedValue(aiResponse)
      })

      afterAll(() => mockUseTools.mockReset())

      test('Then the graph returns the expected result', async () => {
        const state = await actionGraph.invoke(
          {
            messages: [new HumanMessage('Page Action')]
          },
          {
            configurable: {
              ref: { ai: { useTools: mockUseTools, parseResult: vi.fn().mockResolvedValue('true') } },
              thread_id: 'page-test-id'
            }
          }
        )
        expect(state.messages[0].content).toBe('Page Action')
        expect(state.messages.map(({ content }) => content)).toEqual(['Page Action', 'response', 'Tool call result'])
      })
    })

    describe('When the assertion agent is invoked', () => {
      beforeAll(() => {
        const aiResponse = new AIMessage('response')
        aiResponse.tool_calls = [{ id: 'tool-call-id', name: 'tool-call-name', args: { arg: 'tool-call-args' } }]
        mockUseTools.mockResolvedValue(aiResponse)
      })

      test('Then the graph returns the expected result', async () => {
        const state = await actionGraph.invoke(
          {
            messages: [new HumanMessage('Test something...')]
          },
          {
            configurable: {
              ref: { ai: { useTools: mockUseTools, parseResult: vi.fn().mockResolvedValue('true') } },
              thread_id: 'assertion-test-id'
            }
          }
        )
        expect(state.messages[0].content).toBe('Test something...')
        expect(state.messages.map(({ content }) => content.toString())).toEqual([
          'Test something...',
          'response',
          'Tool call result',
          'true'
        ])
      })
    })
  })
})
