import type { BaseMessage } from '@langchain/core/messages'
import type { BaseCheckpointSaver, LangGraphRunnableConfig } from '@langchain/langgraph'
import { AIMessage } from '@langchain/core/messages'
import { Annotation, MemorySaver, StateGraph } from '@langchain/langgraph'

import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'

import { v4 as uuidV4 } from 'uuid'

import { structuredInput } from '../models'
import { PROMPT_STRUCTURE_INPUT } from '../prompts'

interface PlannerState {
  messages: BaseMessage[]
}

const structureInput = async ({ messages }: PlannerState, { configurable }: LangGraphRunnableConfig) => {
  const modelName = (configurable?.model_name as string) || 'gpt-4o-mini'
  const input = messages[messages.length - 1].content.toString()

  const openAI = new OpenAI()
  const completion = await openAI.beta.chat.completions.parse({
    model: modelName,
    temperature: 0,
    messages: [
      { role: 'system', content: PROMPT_STRUCTURE_INPUT },
      { role: 'user', content: input }
    ],
    response_format: zodResponseFormat(structuredInput, 'inputSchema')
  })
  const response = JSON.stringify(completion.choices[0].message.parsed, null, 2)

  return { messages: [new AIMessage(response)] }
}

export const createPlanner = (params: { checkpointer?: BaseCheckpointSaver } = {}) => {
  const annotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({ reducer: (x, y) => x.concat(y) })
  })

  const graph = new StateGraph(annotation)
    .addNode('structureInput', structureInput)
    .addEdge('__start__', 'structureInput')
    .addEdge('structureInput', '__end__')

  return graph.compile({ checkpointer: params.checkpointer ?? new MemorySaver() })
}
;(async () => {
  const planner = createPlanner()
  const input =
    '登入https://www.trendmicro.com，然後輸入帳號密碼，再點擊登入按鈕。進入主頁後驗證標題是否為「Trend Micro」。'
  const { messages } = await planner.invoke(
    { messages: [new AIMessage(input)] },
    { configurable: { thread_id: uuidV4(), model_name: 'gpt-4o-mini' } }
  )

  console.log(messages[messages.length - 1].content)
})()
