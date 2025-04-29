import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { tool } from '@langchain/core/tools'
import { afterEach, describe, test, expect, vi } from 'vitest'
import { playwordGraph } from '../../packages/core/src/graph'

const { mockUseTools } = vi.hoisted(() => ({
  mockConsoleLog: vi.spyOn(console, 'log').mockImplementation(() => {}),
  mockUseTools: vi.fn()
}))

vi.mock('../../packages/core/src/tools/assertion', () => ({
  assertion: [tool(async () => 'Tool call result', { name: 'tool-call-name' })]
}))

vi.mock('../../packages/core/src/tools/operation', () => ({
  operation: [tool(async () => 'Tool call result', { name: 'tool-call-name' })]
}))

vi.mock('../../packages/core/src/tools/query', () => ({
  query: [tool(async () => 'Tool call result', { name: 'tool-call-name' })]
}))

describe('Spec: PlayWord Graph', () => {
  describe('Given the PlayWord graph', () => {
    describe('When the operation agent is invoked', () => {
      afterEach(() => mockUseTools.mockReset())

      test('Then the graph returns the expected result', async () => {
        const aiResponse = new AIMessage('response')
        aiResponse.tool_calls = [{ id: 'tool-call-id', name: 'tool-call-name', args: { arg: 'tool-call-args' } }]
        mockUseTools.mockResolvedValue(aiResponse)

        const { messages } = await playwordGraph().invoke(
          {
            messages: [new HumanMessage('Page Action')]
          },
          {
            configurable: {
              ref: {
                ai: { useTools: mockUseTools, classifyAction: vi.fn().mockResolvedValue('operation') }
              }
            }
          }
        )
        expect(messages[0].content).toBe('Page Action')
        expect(messages.map(({ content }) => content)).toEqual(['Page Action', 'response', 'Tool call result'])
      })

      test('Then the graph returns empty result without tool calls', async () => {
        const aiResponse = new AIMessage('response')
        aiResponse.tool_calls = []
        mockUseTools.mockResolvedValue(aiResponse)

        const { messages } = await playwordGraph().invoke(
          {
            messages: [new HumanMessage('Page Action')]
          },
          {
            configurable: {
              ref: {
                ai: { useTools: mockUseTools, classifyAction: vi.fn().mockResolvedValue('operation') }
              }
            }
          }
        )
        expect(messages[0].content).toBe('Page Action')
        expect(messages.map(({ content }) => content)).toEqual(['Page Action', 'response'])
      })
    })

    describe('When the assertion agent is invoked', () => {
      afterEach(() => mockUseTools.mockReset())

      test('Then the graph returns the expected result', async () => {
        const aiResponse = new AIMessage('response')
        aiResponse.tool_calls = [{ id: 'tool-call-id', name: 'tool-call-name', args: { arg: 'tool-call-args' } }]
        mockUseTools.mockResolvedValue(aiResponse)

        const state = await playwordGraph().invoke(
          {
            messages: [new HumanMessage('Test something...')]
          },
          {
            configurable: {
              ref: {
                ai: { useTools: mockUseTools, classifyAction: vi.fn().mockResolvedValue('assertion') }
              }
            }
          }
        )
        expect(state.messages[0].content).toBe('Test something...')
        expect(state.messages.map(({ content }) => content.toString())).toEqual([
          'Test something...',
          'response',
          'Tool call result'
        ])
      })

      test('Then the graph returns empty result without tool calls', async () => {
        const aiResponse = new AIMessage('response')
        aiResponse.tool_calls = []
        mockUseTools.mockResolvedValue(aiResponse)

        const { messages } = await playwordGraph().invoke(
          {
            messages: [new HumanMessage('Test something...')]
          },
          {
            configurable: {
              ref: {
                ai: { useTools: mockUseTools, classifyAction: vi.fn().mockResolvedValue('assertion') }
              }
            }
          }
        )
        expect(messages[0].content).toBe('Test something...')
        expect(messages.map(({ content }) => content.toString())).toEqual(['Test something...', 'response'])
      })
    })

    describe('When the query agent is invoked', () => {
      afterEach(() => mockUseTools.mockReset())

      test('Then the graph returns the expected result', async () => {
        const aiResponse = new AIMessage('response')
        aiResponse.tool_calls = [{ id: 'tool-call-id', name: 'tool-call-name', args: { arg: 'tool-call-args' } }]
        mockUseTools.mockResolvedValue(aiResponse)

        const state = await playwordGraph().invoke(
          {
            messages: [new HumanMessage('Test something...')]
          },
          {
            configurable: {
              ref: {
                ai: { useTools: mockUseTools, classifyAction: vi.fn().mockResolvedValue('query') }
              }
            }
          }
        )
        expect(state.messages[0].content).toBe('Test something...')
        expect(state.messages.map(({ content }) => content.toString())).toEqual([
          'Test something...',
          'response',
          'Tool call result'
        ])
      })

      test('Then the graph returns empty result without tool calls', async () => {
        const aiResponse = new AIMessage('response')
        aiResponse.tool_calls = []
        mockUseTools.mockResolvedValue(aiResponse)

        const state = await playwordGraph().invoke(
          {
            messages: [new HumanMessage('Test something...')]
          },
          {
            configurable: {
              ref: {
                ai: { useTools: mockUseTools, classifyAction: vi.fn().mockResolvedValue('query') }
              }
            }
          }
        )
        expect(state.messages[0].content).toBe('Test something...')
        expect(state.messages.map(({ content }) => content.toString())).toEqual(['Test something...', 'response'])
      })
    })
  })
})
