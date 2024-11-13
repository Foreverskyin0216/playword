import 'dotenv/config'

import type { BaseMessage } from '@langchain/core/messages'
import type { Page } from 'playwright'
import type { ActionState } from './types'

import { Document } from '@langchain/core/documents'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { Annotation, MemorySaver, StateGraph, messagesStateReducer } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'

import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { v4 as uuidv4 } from 'uuid'

import { getElementLocations, sanitize } from './htmlUtils'
import { toolkit as pageToolkit } from './pageToolkit'
import { CLASSIFICATION_PROMPT } from './prompts'
import { CLASSIFICATION_OUTPUTS } from './structuredOutputs'

import { setTimeout } from 'timers/promises'
import { chromium } from 'playwright'

const ALLOWED_TAGS = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  'label',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'span',
  'div'
]

export class Vespera {
  private annotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({ reducer: messagesStateReducer })
  })
  private page: Page
  private snapshot: string = ''
  private vecStore: MemoryVectorStore | null = null

  constructor(page: Page) {
    this.page = page
  }

  private async embedSnapshot() {
    const sanitized = sanitize(this.snapshot)
    const elems = getElementLocations(sanitized, ALLOWED_TAGS)
    const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
    const docs = elems.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
    this.vecStore = await MemoryVectorStore.fromDocuments(docs, embedder)
  }

  private async shouldInvoke({ messages }: ActionState) {
    const message = messages[messages.length - 1] as HumanMessage

    const openAI = new OpenAI()
    const completion = await openAI.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        { role: 'system', content: CLASSIFICATION_PROMPT },
        { role: 'user', content: message.content.toString() }
      ],
      response_format: zodResponseFormat(CLASSIFICATION_OUTPUTS, 'intent')
    })
    const { intent } = completion.choices[0].message.parsed!

    return intent
  }

  private async invokePageAgent({ messages }: ActionState) {
    const chatOpenAI = new ChatOpenAI({ modelName: 'gpt-4o-mini' }).bindTools(pageToolkit)
    const response = await chatOpenAI.invoke(messages)
    return { messages: [response] }
  }

  private async shouldUsePageTools({ messages }: ActionState) {
    const { tool_calls } = messages[messages.length - 1] as AIMessage
    return tool_calls && tool_calls.length > 0 ? 'pageToolkit' : '__end__'
  }

  public async auto(text: string) {
    await this.page.waitForLoadState('domcontentloaded')
    await this.page.waitForLoadState('networkidle')

    const snapshot = await this.page.content()
    if (snapshot !== this.snapshot) {
      this.snapshot = snapshot
      await this.embedSnapshot()
    }

    const graph = new StateGraph(this.annotation)
      .addNode('page', this.invokePageAgent)
      .addNode('pageToolkit', new ToolNode(pageToolkit))
      .addConditionalEdges('__start__', this.shouldInvoke, ['page'])
      .addConditionalEdges('page', this.shouldUsePageTools, ['pageToolkit', '__end__'])

    const app = graph.compile({ checkpointer: new MemorySaver() })
    await app.invoke(
      { messages: [new HumanMessage(text)] },
      { configurable: { thread_id: uuidv4(), page: this.page, vecStore: this.vecStore } }
    )
  }
}

;(async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  const vespera = new Vespera(page)

  await vespera.auto('Go to https://www.google.com')
  await vespera.auto('Click the "Gmail" link')
  await vespera.auto('Click the "Sign in" button')
  await vespera.auto('Input my email address: ads87216@gmail.com and then click the "Next" button')

  await setTimeout(5000)
  await browser.close()
})()
