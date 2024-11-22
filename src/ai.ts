import type { BaseMessage } from '@langchain/core/messages'
import type { DynamicStructuredTool } from '@langchain/core/tools'
import type { ClientOptions } from 'openai'
import type { ChatCompletionContentPart as ChatCompletionContent } from 'openai/resources/chat'

import { Document } from '@langchain/core/documents'
import { AIMessage } from '@langchain/core/messages'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'

import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

export const DETERMINE_ASSERTION_RESULT = `Determine if the response is passed on the user's input.
Return true if the assertion passes, false otherwise.`

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
  private opts: ClientOptions

  constructor(clientOptions: ClientOptions = {}) {
    this.opts = clientOptions
  }

  /**
   * Use custom tools to perform actions.
   *
   * @param tools The tools to use.
   * @param messages The messages to send to the AI.
   * @returns **AIMessageChunk**. The result from the AI.
   */
  public useTools(tools: DynamicStructuredTool[], messages: BaseMessage[]) {
    const openAI = new ChatOpenAI({ configuration: this.opts, modelName: 'gpt-4o-mini', temperature: 0, ...this.opts })
    return openAI.bindTools(tools).invoke(messages)
  }

  /**
   * Embed documents.
   *
   * @param documents The documents to embed.
   * @returns The vector store of the documents.
   */
  public async embedDocuments(documents: string[]) {
    return MemoryVectorStore.fromTexts(
      documents,
      [],
      new OpenAIEmbeddings({ configuration: this.opts, modelName: 'text-embedding-3-small', ...this.opts })
    )
  }

  /**
   * Get the result from the assertion.
   *
   * @param messages The messages to send to the AI.
   * @returns The result from the assertion.
   */
  public async getAssertionResult(messages: BaseMessage[]) {
    const question = messages.findLast((message) => message.getType() === 'human')
    const response = messages[messages.length - 1] as AIMessage
    const openAI = new OpenAI(this.opts)
    const { choices } = await openAI.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: DETERMINE_ASSERTION_RESULT
        },
        {
          role: 'user',
          content: question!.content.toString()
        },
        {
          role: 'assistant',
          content: response.content.toString()
        }
      ],
      response_format: zodResponseFormat(z.object({ result: z.boolean() }), 'result')
    })

    const result = choices[0].message.parsed?.result as boolean

    return new AIMessage(result.toString())
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
    const openAI = new OpenAI(this.opts)
    const { choices } = await openAI.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: screenshot ? CANDIDATE_SCREENSHOT_REFERENCE : CANDIDATE_LIST_REFERENCE
            },
            {
              type: 'text',
              text: 'User input: ' + input
            },
            {
              type: 'text',
              text: 'Candidates: ' + docs.map((doc, index) => `Index ${index}: ${doc.pageContent}`).join('\n')
            },
            ...((screenshot ? [{ type: 'image_url', image_url: { url: screenshot } }] : []) as ChatCompletionContent[])
          ]
        }
      ],
      response_format: zodResponseFormat(schema, 'index')
    })
    const { index } = choices[0].message.parsed!

    return index ? parseInt(index) : 0
  }
}
