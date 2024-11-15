import type { MemoryVectorStore } from 'langchain/vectorstores/memory'
import type { Page } from 'playwright'

import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { v4 as uuidv4 } from 'uuid'

import { actionGraph } from './actionGraph'

/**
 * PlayWord is a class that allows you to perform actions on a page with natural language.
 */
export class PlayWord {
  private thread_id: string = uuidv4()
  public page: Page
  public snapshot: string = ''
  public store: MemoryVectorStore | null = null

  constructor(page: Page) {
    this.page = page
  }

  public async say(input: string) {
    const { messages } = await actionGraph.invoke(
      {
        messages: [new HumanMessage(input)]
      },
      {
        configurable: { ref: this, thread_id: this.thread_id }
      }
    )

    const message = messages[messages.length - 1] as AIMessage
    return message.content.toString()
  }
}
