import type { RunnableConfig } from '@langchain/core/runnables'
import type { DynamicStructuredTool } from '@langchain/core/tools'
import type { GraphState, PlayWordInterface } from './types'

import { AIMessage, ToolMessage } from '@langchain/core/messages'
import { Annotation, END, StateGraph, START, messagesStateReducer } from '@langchain/langgraph'
import * as tools from './tools'

/**
 * Custom tool node for sequentially invoking tools.
 *
 * @param toolkit The toolkit containing the tools to be invoked.
 * @param state The current state of the graph.
 * @param config The configuration for the runnable.
 */
const toolNode = async (toolkit: DynamicStructuredTool[], state: GraphState, config: RunnableConfig) => {
  const { tool_calls } = state.messages[state.messages.length - 1] as AIMessage
  const messages: ToolMessage[] = []

  for (const toolCall of tool_calls!) {
    const tool = toolkit.find((tool) => tool.name === toolCall.name)!
    const response = await tool.invoke(toolCall, config)
    messages.push(response)
  }

  return { messages }
}

/** The agent node for performing assertions. */
const assertionAgent = async ({ messages }: GraphState, { configurable }: RunnableConfig) => {
  const { ai } = configurable?.ref as PlayWordInterface
  const response = await ai.useTools(tools.assertion, messages)
  return { messages: [response] }
}

/** The tool node for invoking the assertion tools. */
const assertionTools = async ({ messages }: GraphState, config: RunnableConfig) => {
  return toolNode(tools.assertion, { messages }, config)
}

/** The agent node for performing page operations. */
const operationAgent = async ({ messages }: GraphState, { configurable }: RunnableConfig) => {
  const { ai } = configurable?.ref as PlayWordInterface
  const response = await ai.useTools(tools.operation, messages)
  return { messages: [response] }
}

/** The tool node for invoking the operation tools. */
const operationTools = async ({ messages }: GraphState, config: RunnableConfig) => {
  return toolNode(tools.operation, { messages }, config)
}

/** The agent node for querying data from the page. */
const queryAgent = async ({ messages }: GraphState, { configurable }: RunnableConfig) => {
  const { ai } = configurable?.ref as PlayWordInterface
  const response = await ai.useTools(tools.query, messages)
  return { messages: [response] }
}

/** The tool node for invoking the query tools. */
const queryTools = ({ messages }: GraphState, config: RunnableConfig) => {
  return toolNode(tools.query, { messages }, config)
}

/** Determine which agent to invoke based on the user's input. */
const classifyAction = async ({ messages }: GraphState, { configurable }: RunnableConfig) => {
  const { ai } = configurable?.ref as PlayWordInterface
  const action = await ai.classifyAction(messages[messages.length - 1])
  return action
}

/** Determine if the assertion tools are used. */
const useAssertionTools = async ({ messages }: GraphState) => {
  const { tool_calls } = messages[messages.length - 1] as AIMessage
  return tool_calls && tool_calls.length ? 'assertionTools' : END
}

/** Determine if the operation tools are used. */
const useOperationTools = async ({ messages }: GraphState) => {
  const { tool_calls } = messages[messages.length - 1] as AIMessage
  return tool_calls && tool_calls.length ? 'operationTools' : END
}

/** Determine if the query tools are used. */
const useQueryTools = async ({ messages }: GraphState) => {
  const { tool_calls } = messages[messages.length - 1] as AIMessage
  return tool_calls && tool_calls.length ? 'queryTools' : END
}

/** Compile the PlayWord graph. */
export const playwordGraph = () => {
  const annotation = Annotation.Root({ messages: Annotation({ reducer: messagesStateReducer }) })

  const graph = new StateGraph(annotation)
    .addNode('assertion', assertionAgent)
    .addNode('assertionTools', assertionTools)
    .addNode('operation', operationAgent)
    .addNode('operationTools', operationTools)
    .addNode('query', queryAgent)
    .addNode('queryTools', queryTools)
    .addConditionalEdges(START, classifyAction, ['assertion', 'operation', 'query'])
    .addConditionalEdges('assertion', useAssertionTools, ['assertionTools', END])
    .addConditionalEdges('operation', useOperationTools, ['operationTools', END])
    .addConditionalEdges('query', useQueryTools, ['queryTools', END])
    .addEdge('assertionTools', END)
    .addEdge('operationTools', END)
    .addEdge('queryTools', END)

  return graph.compile()
}
