import type { ActionState } from '../src/types'

import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { tool } from '@langchain/core/tools'
import { afterAll, beforeAll, describe, test, expect, vi } from 'vitest'
import { actionGraph } from '../src/actionGraph'

const { mockUseTools } = vi.hoisted(() => ({ mockUseTools: vi.fn() }))

vi.mock('../src/ai', () => ({
  AI: vi.fn(() => ({
    useTools: mockUseTools,
    getAssertionResult: vi.fn().mockResolvedValue(new AIMessage('true'))
  }))
}))

vi.mock('../src/assertTools', () => ({
  default: [tool(async () => 'Tool call result', { name: 'tool-call-name' })]
}))

vi.mock('../src/pageTools', () => ({
  default: [tool(async () => 'Tool call result', { name: 'tool-call-name' })]
}))

describe('Spec: Action Graph', () => {
  describe('Given the action graph', () => {
    describe('When the page agent is invoked', () => {
      const aiMessage = new AIMessage('response')
      let state: ActionState

      beforeAll(async () => {
        aiMessage.tool_calls = [{ id: 'tool-call-id', name: 'tool-call-name', args: { arg: 'tool-call-args' } }]
        mockUseTools.mockResolvedValue(aiMessage)
        state = await actionGraph.invoke(
          {
            messages: [new HumanMessage('Page Action')]
          },
          { configurable: { ref: { openAIOptions: {} }, thread_id: 'page-test-id' } }
        )
      })

      afterAll(() => mockUseTools.mockRestore())

      test('Then the graph returns the expected result', async () => {
        expect(state.messages[0].content).toBe('Page Action')
        expect(state.messages[state.messages.length - 1].content).toBe('Tool call result')
      })
    })

    describe('When the assertion agent is invoked', () => {
      const aiMessage = new AIMessage('response')
      let state: ActionState

      beforeAll(async () => {
        aiMessage.tool_calls = [{ id: 'tool-call-id', name: 'tool-call-name', args: { arg: 'tool-call-args' } }]
        mockUseTools.mockResolvedValue(aiMessage)
        state = await actionGraph.invoke(
          { messages: [new HumanMessage('Test something...')] },
          { configurable: { ref: { openAIOptions: {} }, thread_id: 'assertion-test-id' } }
        )
      })

      test('Then the graph returns the expected result', async () => {
        expect(state.messages[0].content).toBe('Test something...')
        expect(state.messages[state.messages.length - 1].content).toBe('true')
      })
    })
  })
})
