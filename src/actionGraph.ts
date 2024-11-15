import type { ActionState } from './types'

import { AIMessage } from '@langchain/core/messages'
import { Annotation, MemorySaver, StateGraph, messagesStateReducer } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { ChatOpenAI } from '@langchain/openai'

import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

import { toolkit as assertTools } from './assertToolkit'
import { toolkit as pageTools } from './pageToolkit'
import { assertionPattern } from './resources'

const invokeAssertAgent = async ({ messages }: ActionState) => {
  const chatOpenAI = new ChatOpenAI({ modelName: 'gpt-4o-mini' }).bindTools(assertTools)
  const response = await chatOpenAI.invoke(messages)
  return { messages: [response] }
}

const invokePageAgent = async ({ messages }: ActionState) => {
  const chatOpenAI = new ChatOpenAI({ modelName: 'gpt-4o-mini' }).bindTools(pageTools)
  const response = await chatOpenAI.invoke(messages)
  return { messages: [response] }
}

const invokeResultAgent = async ({ messages }: ActionState) => {
  const question = messages.findLast((message) => message.getType() === 'human')
  const response = messages[messages.length - 1] as AIMessage
  const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const { choices } = await openAI.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [
      { role: 'system', content: "Determines if the response is passed on the user's input." },
      { role: 'user', content: question!.content.toString() },
      { role: 'assistant', content: response.content.toString() }
    ],
    response_format: zodResponseFormat(
      z.object({ result: z.enum(['PASS', 'FAIL']).describe('The result of the assertion.') }),
      'result'
    )
  })

  return { messages: [new AIMessage(JSON.stringify(choices[0].message.parsed))] }
}

const shouldInvoke = async ({ messages }: ActionState) => {
  const message = messages[messages.length - 1] as AIMessage
  return assertionPattern.test(message.content.toString()) ? 'assert' : 'page'
}

const shouldInvokeAssertTools = ({ messages }: ActionState) => {
  const { tool_calls } = messages[messages.length - 1] as AIMessage
  return tool_calls && tool_calls.length > 0 ? 'assertTools' : 'result'
}

const shouldInvokePageTools = ({ messages }: ActionState) => {
  const { tool_calls } = messages[messages.length - 1] as AIMessage
  return tool_calls && tool_calls.length > 0 ? 'pageTools' : '__end__'
}

const annotation = Annotation.Root({ messages: Annotation({ reducer: messagesStateReducer }) })
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
