import type { Document } from '@langchain/core/documents'
import type { BaseMessage } from '@langchain/core/messages'
import type { DynamicStructuredTool } from '@langchain/core/tools'
import type { ClientOptions } from '@langchain/openai'

import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { z } from 'zod'
import { MemoryVectorStore } from './memoryVectorStore'

export const CANDIDATE_SCREENSHOT_REFERENCE = `I will provide you with some candidates of elements and a screenshot.
Your goal is to find the most relevant candidate that user mentioned in the input and want to interact with.
You need to refer to both of the element candidates and the screenshot to find the most relevant candidate.

The following is the rules you need to note:
- The candidates are labeled with "#" in the screenshot and start with "#" in the candidates list.
- When you find the candidate you believe to be the best match, return the number after the "#" symbol, which is the index of that candidate.`

export const CANDIDATE_LIST_REFERENCE = `I will provide you with some candidates of elements.
Your goal is to find the most relevant candidate that user mentioned in the input and want to interact with.
Refer to the candidates list to find the index of the most relevant result that matches the requirements.

When you find the candidate you believe to be the best match, return the number after the "#" symbol, which is the index of that candidate.`

export const CHECK_IMAGE_INFORMATION = `Check if the provided image includes the information that user needs. Return true if the image includes the information, false otherwise.`

export const DETERMINE_ASSERTION_RESULT = `Determine if the AI response is passed on the user's input. Return true if the AI believes the assertion passes, false otherwise.`

export const RETRIEVE_IMAGE_INFORMATION = `Retrieve the information from the image to match the user's needs.`

/**
 * @class ### AI
 *
 * AI is a wrapper for the OpenAI API. It includes the following features:
 * - Use custom tools to perform actions.
 * - Get the result from the assertion.
 * - Get the best candidate from the documents.
 *
 * @param clientOptions The options for the OpenAI API. See {@link ClientOptions}.
 */
export class AI {
  private chatModel = 'gpt-4o-mini'
  private embedderModel = 'text-embedding-3-small'
  private model: ChatOpenAI
  private store: MemoryVectorStore

  constructor(options: ClientOptions = {}) {
    this.model = new ChatOpenAI({ configuration: options, model: this.chatModel, temperature: 0, ...options })
    const embedder = new OpenAIEmbeddings({ configuration: options, model: this.embedderModel, ...options })
    this.store = new MemoryVectorStore(embedder)
  }

  /**
   * Use custom tools to perform actions.
   *
   * @param tools The tools to use.
   * @param messages The messages to send to the AI.
   * @returns The result from the AI.
   */
  public useTools(tools: DynamicStructuredTool[], messages: BaseMessage[]) {
    return this.model.bindTools(tools).invoke(messages)
  }

  /**
   * Embed documents into a new vector store.
   *
   * @param documents The documents to embed.
   * @returns The vector store of the documents.
   */
  public async embedDocuments(texts: string[]) {
    this.store = await MemoryVectorStore.fromTexts(texts, this.store.embeddings)
  }

  /**
   * Get the most similar documents from the vector store.
   */
  public async searchDocuments(query: string, topN: number = 10) {
    return this.store.asRetriever(topN).invoke(query)
  }

  /**
   * Get the result from the assertion.
   *
   * @param messages The messages to send to the AI.
   * @returns The result from the assertion.
   */
  public async parseResult(messages: BaseMessage[]) {
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
   * Get the best candidate from the documents.
   *
   * @param input The user's input.
   * @param docs Candidate documents.
   * @param screenshot Whether to use the screenshot for context.
   * @returns The index of the best candidate.
   */
  public async getBestCandidate(input: string, docs: Document[], screenshot?: string) {
    const schema = z.object({ index: z.enum(docs.map((_, index) => index.toString()) as [string, ...string[]]) })
    const { index } = await this.model.withStructuredOutput(schema).invoke([
      {
        role: 'user',
        content: [
          { type: 'text', text: screenshot ? CANDIDATE_SCREENSHOT_REFERENCE : CANDIDATE_LIST_REFERENCE },
          { type: 'text', text: 'User input: ' + input },
          {
            type: 'text',
            text: 'Candidates: ' + docs.map((doc, index) => `Index ${index}: ${doc.pageContent}`).join('\n')
          },
          ...(screenshot ? [{ type: 'image_url', image_url: { url: screenshot } }] : [])
        ]
      }
    ])

    return parseInt(index)
  }

  /**
   * Retrieve the information from the image to match the user's needs.
   *
   * @param input The user's input.
   * @param image The image to retrieve information from.
   * @returns The information from the image.
   */
  public async retrieveImageInformation(input: string, image: string) {
    const { info } = await this.model.withStructuredOutput(z.object({ info: z.string() })).invoke([
      {
        role: 'user',
        content: [
          { type: 'text', text: RETRIEVE_IMAGE_INFORMATION },
          { type: 'text', text: 'User input: ' + input },
          { type: 'image_url', image_url: { url: image } }
        ]
      }
    ])
    return info
  }

  /**
   * Check if the provided image includes the information that user needs.
   *
   * @param input The user's input.
   * @param image The image to check.
   * @returns Whether the image includes the information.
   */
  public async checkImageInformation(input: string, image: string) {
    const { result } = await this.model.withStructuredOutput(z.object({ result: z.boolean() })).invoke([
      {
        role: 'user',
        content: [
          { type: 'text', text: CHECK_IMAGE_INFORMATION },
          { type: 'text', text: 'User input: ' + input },
          { type: 'image_url', image_url: { url: image } }
        ]
      }
    ])
    return result
  }
}
