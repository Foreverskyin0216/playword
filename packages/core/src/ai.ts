import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { Document } from '@langchain/core/documents'
import type { AIMessage, HumanMessage, ToolMessage } from '@langchain/core/messages'
import type { DynamicStructuredTool } from '@langchain/core/tools'
import type { AIOptions, GoogleOptions, VoyageOptions } from './types'

import { ChatAnthropic } from '@langchain/anthropic'
import { SystemMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { z } from 'zod'
import { VoyageEmbeddings } from './services'
import * as prompts from './prompts'
import { MemoryVectorStore } from './store'

/**
 * Services for handling PlayWord's AI functionalities.
 *
 * @param opts The options for AI configuration.
 */
export class AI {
  /** The chat model to use for the general tasks. */
  private llm: BaseChatModel

  /** The vector store to store the embedded documents. */
  private store: MemoryVectorStore

  constructor(opts: AIOptions = {}) {
    let embeddings: GoogleGenerativeAIEmbeddings | OpenAIEmbeddings | VoyageEmbeddings | undefined
    let llm: ChatGoogleGenerativeAI | ChatOpenAI | ChatAnthropic | undefined

    if ('googleApiKey' in opts || process.env.GOOGLE_API_KEY) {
      const apiKey = (opts as GoogleOptions).googleApiKey ?? process.env.GOOGLE_API_KEY
      embeddings = new GoogleGenerativeAIEmbeddings({ apiKey, model: 'text-embedding-004' })
      llm = new ChatGoogleGenerativeAI({ ...opts, apiKey, model: opts.model ?? 'gemini-2.0-flash-lite' })
    }

    if ('openAIApiKey' in opts || process.env.OPENAI_API_KEY) {
      embeddings = new OpenAIEmbeddings({ ...opts, configuration: opts, model: 'text-embedding-3-small' })
      llm = new ChatOpenAI({ ...opts, configuration: opts, model: opts.model ?? 'gpt-4o-mini' })
    }

    if ('anthropicApiKey' in opts || process.env.ANTHROPIC_API_KEY) {
      llm = new ChatAnthropic({ ...opts, clientOptions: opts, model: opts.model ?? 'claude-3-5-haiku-latest' })
    }

    if ('voyageAIApiKey' in opts || process.env.VOYAGEAI_API_KEY) {
      const apiKey = (opts as VoyageOptions).voyageAIApiKey || process.env.VOYAGEAI_API_KEY
      embeddings = new VoyageEmbeddings({ apiKey })
    }

    if (!embeddings) {
      throw new Error('Embeddings model setup failed. An API key for Google, OpenAI, or VoyageAI is required.')
    }

    if (!llm) {
      throw new Error('LLM setup failed. An API key for Google, OpenAI, or Anthropic is required.')
    }

    this.llm = llm
    this.store = new MemoryVectorStore(embeddings)
  }

  /**
   * Analyze an image and extract relevant information based on user input.
   *
   * @param image The base64-encoded image to analyze.
   * @param input The user input to guide the analysis.
   */
  public async analyzeImage(image: string, input: string) {
    const instruction = new SystemMessage(prompts.ANALYZE_IMAGE)
    const schema = z.object({ data: z.string().describe('The data extracted from the image that the user requested.') })

    const { data } = await this.llm.withStructuredOutput(schema, { strict: true }).invoke([
      instruction,
      {
        role: 'user',
        content: [
          { image_url: { url: image }, type: 'image_url' },
          { text: 'User input: ' + input, type: 'text' }
        ]
      }
    ])

    return data
  }

  /**
   * Classify the user's input into specific action types for agent invocation.
   *
   * @param message The user's input message.
   */
  public async classifyAction(message: HumanMessage) {
    const instruction = new SystemMessage(prompts.CLASSIFY_ACTION)
    const schema = z.object({ type: z.enum(['assertion', 'operation', 'query']) })

    const { type } = await this.llm.withStructuredOutput(schema, { strict: true }).invoke([instruction, message])

    return type
  }

  /**
   * Embed texts into a new vector store.
   *
   * @param texts The texts to embed.
   */
  public async embedTexts(texts: string[]) {
    const memoryVectorStore = await MemoryVectorStore.fromTexts(texts, this.store.embeddings)
    this.store = memoryVectorStore
  }

  /**
   * Get the best candidate from the candidate documents.
   *
   * @param input The user's input to find the best candidate.
   * @param docs The candidate documents.
   */
  public async getBestCandidate(input: string, docs: Document[]) {
    const candidates = 'Elements: ' + docs.map((doc, index) => `Index ${index}: ${doc.pageContent}`).join('\n')
    const schema = z.object({ index: z.enum(docs.map((_, index) => index.toString()) as [string]) })

    const { index } = await this.llm.withStructuredOutput(schema, { strict: true }).invoke([
      {
        role: 'user',
        content: [
          { type: 'text', text: prompts.CANDIDATE_LIST_REFERENCE },
          { type: 'text', text: 'User input: ' + input },
          { type: 'text', text: candidates }
        ]
      }
    ])

    return parseInt(index)
  }

  /**
   * Get the most similar documents from the vector store.
   *
   * @param query The query to search for the most similar documents.
   * @param topN The number of top results to return. Defaults to 10.
   */
  public async searchDocuments(query: string, topN = 10) {
    const retriever = this.store.asRetriever(topN)
    return retriever.invoke(query)
  }

  /**
   * Summarize the Observer action
   *
   * @param action The action to summarize.
   */
  public async summarizeAction(action: string) {
    const schema = z.object({ summary: z.string().describe('A concise summary of the action described in the JSON.') })

    const { summary } = await this.llm.withStructuredOutput(schema, { strict: true }).invoke([
      {
        role: 'user',
        content: [
          { type: 'text', text: prompts.SUMMARIZE_ACTION },
          { type: 'text', text: action }
        ]
      }
    ])

    return summary
  }

  /**
   * Use custom tools to perform actions.
   *
   * @param tools The custom tools to use.
   * @param messages The messages to send to the AI.
   */
  public async useTools(tools: DynamicStructuredTool[], messages: (AIMessage | HumanMessage | ToolMessage)[]) {
    return (this.llm as ChatOpenAI | ChatAnthropic | ChatGoogleGenerativeAI)
      .bindTools(tools, { maxConcurrency: 1, strict: true })
      .invoke([new SystemMessage(prompts.TOOL_CALL), ...messages])
  }
}
