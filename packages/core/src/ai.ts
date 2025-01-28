import type { Document } from '@langchain/core/documents'
import type { AIMessage, HumanMessage, ToolMessage } from '@langchain/core/messages'
import type { DynamicStructuredTool } from '@langchain/core/tools'
import type { AIOptions } from './types'

import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { z } from 'zod'
import { MemoryVectorStore } from './memoryStore'

export const CANDIDATE_LIST_REFERENCE = `I will provide you with some HTML elements.
Your goal is to find the most relevant element that user mentioned in the input and want to interact with.
When you find the element you believe to be the best match, return the index of that element.`

export const DETERMINE_ASSERTION_RESULT = `Determine if the AI response is passed on the user's input.
Return true if the AI believes the assertion passes, false otherwise.`

export const SUMMARIZE_ACTION = `I will provide a JSON string that contains an action's name and its associated params.
Each JSON string represents a single test step within a test case.

Your tasks are as follows:

1. Action Summary:
- Objective: Create a concise summary of the action described in the JSON.
- Guidelines:
  - The summary should be brief, clear, and accurately reflect the intent of the action.
  - If the input action is performed on a password field, avoid including the actual password in the summary.

2. HTML Element Simplification:
- Objective: When the params include details about an HTML element, present the element's information without using attributes that are random, dynamic, or difficult to interpret.
- Guidelines:
  - Exclude: Attributes that are likely to change frequently (e.g., dynamically generated IDs, timestamps or session-specific data).
  - Include: Static and meaningful attributes that clearly identify or describe the element (e.g., class, id with meaningful names, data-* attributes relevant to the test).`

/**
 * The AI is a class to interact with the OpenAI API. It provides the following functionalities:
 * - Use the chat model binding with custom tools to perform actions.
 * - Embed documents into a new vector store.
 * - Search for the most similar documents from the vector store.
 * - Determine if the assertion passes based on the user's input and the AI response.
 * - Get the best candidate from the embedded documents based on the user's input.
 * - Summarize the Observer action.
 *
 * @param options The options for the OpenAI API. See {@link ModelOptions} and {@link ClientOptions} for details.
 */
export class AI {
  /**
   * The chat model to use for the general tasks.
   */
  private model: ChatOpenAI

  /**
   * The vector store to store the embedded documents.
   */
  private store: MemoryVectorStore

  constructor({ chat = 'gpt-4o-mini', embeddings = 'text-embedding-3-small', ...opts }: AIOptions = {}) {
    this.model = new ChatOpenAI({ ...opts, configuration: opts, model: chat })
    this.store = new MemoryVectorStore(new OpenAIEmbeddings({ ...opts, configuration: opts, model: embeddings }))
  }

  /**
   * Use custom tools to perform actions.
   *
   * @param tools The custom tools to use.
   * @param messages The messages to send to the AI.
   */
  public async useTools(tools: DynamicStructuredTool[], messages: (AIMessage | HumanMessage | ToolMessage)[]) {
    return this.model.bindTools(tools).invoke(messages)
  }

  /**
   * Embed texts into a new vector store.
   *
   * @param texts The texts to embed.
   */
  public async embedTexts(texts: string[]) {
    this.store = await MemoryVectorStore.fromTexts(texts, this.store.embeddings)
  }

  /**
   * Get the most similar documents from the vector store.
   *
   * @param query The query to search for the most similar documents.
   * @param topN The number of top results to return.
   */
  public async searchDocuments(query: string, topN: number = 10) {
    return this.store.asRetriever(topN).invoke(query)
  }

  /**
   * Determine if the assertion passes based on the messages.
   *
   * @param messages The messages stored the user's input and the AI response.
   */
  public async parseResult(messages: (AIMessage | HumanMessage | ToolMessage)[]) {
    const question = messages.findLast((message) => message.getType() === 'human')!
    const response = messages[messages.length - 1]

    const { result } = await this.model
      .withStructuredOutput(
        z.object({
          result: z.boolean().describe('Return true if the AI believes the assertion passes, false otherwise.')
        })
      )
      .invoke([
        { role: 'system', content: DETERMINE_ASSERTION_RESULT },
        { role: 'user', content: 'User: ' + question.content },
        { role: 'assistant', content: 'AI: ' + response.content }
      ])

    return result
  }

  /**
   * Get the best candidate from the candidate documents.
   *
   * @param input The user's input to find the best candidate.
   * @param docs The candidate documents.
   */
  public async getBestCandidate(input: string, docs: Document[]) {
    const schema = z.object({ index: z.enum(docs.map((_, index) => index.toString()) as [string, ...string[]]) })
    const { index } = await this.model.withStructuredOutput(schema).invoke([
      {
        role: 'user',
        content: [
          { type: 'text', text: CANDIDATE_LIST_REFERENCE },
          { type: 'text', text: 'User input: ' + input },
          {
            type: 'text',
            text: 'Elements: ' + docs.map((doc, index) => `Index ${index}: ${doc.pageContent}`).join('\n')
          }
        ]
      }
    ])

    return parseInt(index)
  }

  /**
   * Summarize the Observer action
   *
   * @param action The action to summarize.
   */
  public async summarizeAction(action: string) {
    const { summary } = await this.model
      .withStructuredOutput(
        z.object({
          summary: z.string().describe('A concise summary of the action described in the JSON.')
        })
      )
      .invoke([
        {
          role: 'user',
          content: [
            { type: 'text', text: SUMMARIZE_ACTION },
            { type: 'text', text: action }
          ]
        }
      ])
    return summary
  }
}
