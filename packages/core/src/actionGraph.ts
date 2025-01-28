import type { LangGraphRunnableConfig } from '@langchain/langgraph'
import type { ActionState, PlayWordInterface } from './types'

import { AIMessage } from '@langchain/core/messages'
import { Annotation, MemorySaver, StateGraph, messagesStateReducer } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import * as tools from './tools'
import * as utils from './utils'

/**
 * The action graph annotation.
 */
const annotation = Annotation.Root({ messages: Annotation({ reducer: messagesStateReducer }) })

/**
 * Node for the assertion agent.
 *
 * This agent performs assertions with the AI model binding with assertion tools.
 */
const invokeAssertAgent = async ({ messages }: ActionState, { configurable }: LangGraphRunnableConfig) => {
  const { ai } = configurable?.ref as PlayWordInterface
  const response = await ai.useTools(tools.assertion, messages)
  return { messages: [response] }
}

/**
 * Node for the page agent.
 *
 * This agent performs page actions with the AI model binding with page tools.
 */
const invokePageAgent = async ({ messages }: ActionState, { configurable }: LangGraphRunnableConfig) => {
  const { ai } = configurable?.ref as PlayWordInterface
  const response = await ai.useTools(tools.page, messages)
  return { messages: [response] }
}

/**
 * This agent is used to parse the result from the assertion agent.
 */
const invokeResultAgent = async ({ messages }: ActionState, { configurable }: LangGraphRunnableConfig) => {
  const { ai } = configurable?.ref as PlayWordInterface
  const response = await ai.parseResult(messages)
  return { messages: [new AIMessage(response.toString())] }
}

/**
 * Determine if the assertion agent should be invoked.
 */
const shouldInvoke = async ({ messages }: ActionState) => {
  const message = messages[messages.length - 1] as AIMessage
  const shouldInvoke = utils.assertionPattern.test(message.content.toString())
  return shouldInvoke ? 'assert' : 'page'
}

/**
 * Determine if the assertion tools should be invoked.
 */
const shouldInvokeAssertTools = ({ messages }: ActionState) => {
  const { tool_calls } = messages[messages.length - 1] as AIMessage
  return tool_calls && tool_calls.length > 0 ? 'assertionTools' : 'result'
}

/**
 * Determine if the page tools should be invoked.
 */
const shouldInvokePageTools = ({ messages }: ActionState) => {
  const { tool_calls } = messages[messages.length - 1] as AIMessage
  return tool_calls && tool_calls.length > 0 ? 'pageTools' : '__end__'
}

/**
 * The action graph includes the following nodes:
 * - assert: The agent node for assertions.
 * - assertionTools: The tool node for assertion tools.
 * - page: The agent node for page actions.
 * - pageTools: The tool node for page tools.
 * - result: The agent node for confirming the response from the assertion agent.
 */
export const actionGraph = new StateGraph(annotation)
  .addNode('assert', invokeAssertAgent)
  .addNode('page', invokePageAgent)
  .addNode('result', invokeResultAgent)
  .addNode('assertionTools', new ToolNode(tools.assertion))
  .addNode('pageTools', new ToolNode(tools.page))
  .addConditionalEdges('__start__', shouldInvoke, ['page', 'assert'])
  .addConditionalEdges('assert', shouldInvokeAssertTools, ['assertionTools', 'result'])
  .addConditionalEdges('page', shouldInvokePageTools, ['pageTools', '__end__'])
  .addEdge('assertionTools', 'assert')
  .addEdge('pageTools', 'page')
  .addEdge('result', '__end__')
  .compile({ checkpointer: new MemorySaver() })
