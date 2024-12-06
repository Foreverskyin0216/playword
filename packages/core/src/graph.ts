import type { LangGraphRunnableConfig } from '@langchain/langgraph'
import type { ActionState, PlayWordInterface } from './types'

import { AIMessage } from '@langchain/core/messages'
import { Annotation, MemorySaver, StateGraph, messagesStateReducer } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'

import assertTools from './assertTools'
import pageTools from './pageTools'
import { assertionPattern } from './resources'

/**
 * State annotation for the action graph.
 */
const annotation = Annotation.Root({ messages: Annotation({ reducer: messagesStateReducer }) })

/**
 * Node for the assertion agent.
 *
 * @returns The result from the assertion agent.
 */
const invokeAssertAgent = async ({ messages }: ActionState, { configurable }: LangGraphRunnableConfig) => {
  const { ai, debug, logger } = configurable?.ref as PlayWordInterface
  const response = await ai.useTools(assertTools, messages)
  if (debug && logger && response.content) logger.text = response.content.toString()
  return { messages: [response] }
}

/**
 * Node for the page agent.
 *
 * @returns The result from the page agent.
 */
const invokePageAgent = async ({ messages }: ActionState, { configurable }: LangGraphRunnableConfig) => {
  const { ai, debug, logger } = configurable?.ref as PlayWordInterface
  const response = await ai.useTools(pageTools, messages)
  if (debug && logger && response.content) logger.text = response.content.toString()
  return { messages: [response] }
}

/**
 * This agent is used to parse the result from the assertion agent.
 *
 * @returns The assertion result.
 */
const invokeResultAgent = async ({ messages }: ActionState, { configurable }: LangGraphRunnableConfig) => {
  const { ai } = configurable?.ref as PlayWordInterface
  const response = await ai.parseResult(messages)
  return { messages: [new AIMessage(response.toString())] }
}

/**
 * Determine if the assertion agent should be invoked.
 *
 * @returns The name of the agent to invoke.
 */
const shouldInvoke = async ({ messages }: ActionState) => {
  const message = messages[messages.length - 1] as AIMessage
  const shouldInvoke = assertionPattern.test(message.content.toString())
  return shouldInvoke ? 'assert' : 'page'
}

/**
 * Determine if the assertion tools should be invoked.
 *
 * @returns The name of the agent to invoke.
 */
const shouldInvokeAssertTools = ({ messages }: ActionState) => {
  const { tool_calls } = messages[messages.length - 1] as AIMessage
  return tool_calls && tool_calls.length > 0 ? 'assertTools' : 'result'
}

/**
 * Determine if the page tools should be invoked.
 *
 * @returns The name of the agent to invoke.
 */
const shouldInvokePageTools = ({ messages }: ActionState) => {
  const { tool_calls } = messages[messages.length - 1] as AIMessage
  return tool_calls && tool_calls.length > 0 ? 'pageTools' : '__end__'
}

/**
 * The action graph includes the following nodes:
 * - **assert**: Invoke the assertion agent.
 * - **page**: Invoke the page agent.
 * - **result**: Invoke the result agent.
 * - **assertTools**: Invoke the assertion tools.
 * - **pageTools**: Invoke the page tools.
 */
export const actionGraph = new StateGraph(annotation)
  .addNode('assert', invokeAssertAgent)
  .addNode('page', invokePageAgent)
  .addNode('result', invokeResultAgent)
  .addNode('assertTools', new ToolNode(assertTools))
  .addNode('pageTools', new ToolNode(pageTools))
  .addConditionalEdges('__start__', shouldInvoke, ['page', 'assert'])
  .addConditionalEdges('assert', shouldInvokeAssertTools, ['assertTools', 'result'])
  .addConditionalEdges('page', shouldInvokePageTools, ['pageTools', '__end__'])
  .addEdge('assertTools', 'assert')
  .addEdge('pageTools', 'page')
  .addEdge('result', '__end__')
  .compile({ checkpointer: new MemorySaver() })
