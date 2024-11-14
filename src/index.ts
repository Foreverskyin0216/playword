import type { MemoryVectorStore } from 'langchain/vectorstores/memory'
import type { Page } from 'playwright'
import type { ActionState } from './types'

import { AIMessage, HumanMessage, RemoveMessage } from '@langchain/core/messages'
import { Annotation, MemorySaver, StateGraph, messagesStateReducer } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { ChatOpenAI } from '@langchain/openai'

import { v4 as uuidv4 } from 'uuid'

import { toolkit as pageToolkit } from './pageToolkit'

export class PlayWord {
  private checkpointer: MemorySaver = new MemorySaver()
  private store: MemoryVectorStore | null = null
  private thread_id: string = uuidv4()
  private snapshot: string = ''

  constructor(private page: Page) {}

  private async invokePageAgent({ messages }: ActionState) {
    const chatOpenAI = new ChatOpenAI({ modelName: 'gpt-4o-mini' }).bindTools(pageToolkit)
    const response = await chatOpenAI.invoke(messages)
    return { messages: [response] }
  }

  private async shouldUsePageTools({ messages }: ActionState) {
    const { tool_calls } = messages[messages.length - 1] as AIMessage
    return tool_calls && tool_calls.length > 0 ? 'pageToolkit' : 'invokeCleanup'
  }

  private invokeCleanup({ messages }: ActionState) {
    return { messages: messages.map(({ id }) => new RemoveMessage({ id: id! })) }
  }

  public getPage() {
    return this.page
  }

  public getSnapshot() {
    return this.snapshot
  }

  public getStore() {
    return this.store!
  }

  public setSnapshot(snapshot: string) {
    this.snapshot = snapshot
  }

  public setStore(store: MemoryVectorStore) {
    this.store = store
  }

  public async say(message: string) {
    const annotation = Annotation.Root({ messages: Annotation({ reducer: messagesStateReducer }) })
    const graph = new StateGraph(annotation)
      .addNode('page', this.invokePageAgent)
      .addNode('invokeCleanup', this.invokeCleanup)
      .addNode('pageToolkit', new ToolNode(pageToolkit))
      .addConditionalEdges('page', this.shouldUsePageTools, ['pageToolkit', 'invokeCleanup'])
      .addEdge('__start__', 'page')
      .addEdge('invokeCleanup', '__end__')

    const app = graph.compile({ checkpointer: this.checkpointer })
    await app.invoke(
      {
        messages: [new HumanMessage(message)]
      },
      {
        configurable: { ref: this, thread_id: this.thread_id }
      }
    )
  }
}
