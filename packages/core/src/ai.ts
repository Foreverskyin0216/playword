import type { Document } from '@langchain/core/documents'
import type { AIMessage, HumanMessage, ToolMessage } from '@langchain/core/messages'
import type { DynamicStructuredTool } from '@langchain/core/tools'

import { type ClientOptions, ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { z } from 'zod'
import { MemoryVectorStore } from './memory'

export const CANDIDATE_LIST_REFERENCE = `I will provide you with some candidates of elements.
Your goal is to find the most relevant candidate that user mentioned in the input and want to interact with.
Refer to the candidates list to find the index of the most relevant result that matches the requirements.
When you find the candidate you believe to be the best match, return the index of that candidate.`

export const DETERMINE_ASSERTION_RESULT = `Determine if the AI response is passed on the user's input.
Return true if the AI believes the assertion passes, false otherwise.`

export const SUMMARIZE_HTML = `I will provide the HTML code of an element, including its tag, attributes, and content.
Your task is to identify the distinctive attribute or feature of the element that best defines its purpose or identity.
Summarize what the element represents using a simple and short phrase based on its tag, attribute, or content.`

/**
 * The AI is a class to interact with the OpenAI API. It provides the following functionalities:
 * - Use the chat model binding with custom tools to perform actions.
 * - Embed documents into a new vector store.
 * - Search for the most similar documents from the vector store.
 * - Determine if the assertion passes based on the user's input and the AI response.
 * - Get the best candidate from the embedded documents based on the user's input.
 * - Summarize the purpose or identity of HTML elements.
 *
 * @param clientOptions The options for the OpenAI API. See {@link ClientOptions} for details.
 */
export class AI {
  /**
   * The chat model name.
   */
  private chatModel = 'gpt-4o-mini'

  /**
   * The embeddings model name.
   */
  private embeddingModel = 'text-embedding-3-small'

  /**
   * The chat model to use for the general tasks.
   */
  private model: ChatOpenAI

  /**
   * The vector store to store the embedded documents.
   */
  private store: MemoryVectorStore

  constructor(configuration: ClientOptions = {}) {
    this.model = new ChatOpenAI({ ...configuration, configuration, model: this.chatModel, temperature: 0 })
    this.store = new MemoryVectorStore(
      new OpenAIEmbeddings({
        ...configuration,
        configuration,
        model: this.embeddingModel
      })
    )
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
   *
   * @returns A new vector store with the embedded documents.
   */
  public async embedTexts(texts: string[]) {
    this.store = await MemoryVectorStore.fromTexts(texts, this.store.embeddings)
  }

  /**
   * Get the most similar documents from the vector store.
   *
   * @param query The query to search for the most similar documents.
   * @param topN The number of top results to return.
   *
   * @returns The most similar documents.
   */
  public async searchDocuments(query: string, topN: number = 10) {
    return this.store.asRetriever(topN).invoke(query)
  }

  /**
   * Determine if the assertion passes based on the messages.
   *
   * @param messages The messages stored the user's input and the AI response.
   *
   * @returns The result from the assertion.
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
   *
   * @returns The index of the best candidate.
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
            text: 'Candidates: ' + docs.map((doc, index) => `Index ${index}: ${doc.pageContent}`).join('\n')
          }
        ]
      }
    ])

    return parseInt(index)
  }

  /**
   * Summarize the purpose or identity of HTML elements.
   *
   * @param html The full HTML content of a DOM element.
   *
   * @returns The short phrase to summarize the purpose or identity of the element.
   */
  public async summarizeHTML(html: string) {
    const { phrase } = await this.model
      .withStructuredOutput(
        z.object({
          phrase: z.string().describe('Short phrase to summarize the purpose or identity of the element.')
        })
      )
      .invoke([
        {
          role: 'user',
          content: [
            { type: 'text', text: SUMMARIZE_HTML },
            { type: 'text', text: 'HTML: ' + html }
          ]
        }
      ])
    return phrase
  }
}
