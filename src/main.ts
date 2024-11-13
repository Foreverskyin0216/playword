import 'dotenv/config'

import type { HumanMessage } from '@langchain/core/messages'
import type { Page } from 'playwright'
import type { ActionState } from './types'

import { Document } from '@langchain/core/documents'
import { OpenAIEmbeddings } from '@langchain/openai'

import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'

import { getElementLocations, sanitize } from './htmlUtils'
import { CLASSIFICATION_PROMPT } from './prompts'
import { CLASSIFICATION_OUTPUTS } from './structuredOutputs'

export class Vespera {
  private page: Page
  private snapshot: string = ''
  private store: MemoryVectorStore | null = null

  constructor(page: Page) {
    this.page = page
  }

  private async embedSnapshot() {
    if (this.store) {
      await this.store.delete()
    }

    const sanitized = sanitize(this.snapshot)
    const elems = getElementLocations(sanitized)

    const embedder = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large' })
    const docs = elems.map(({ element, xpath }) => new Document({ id: xpath, pageContent: element }))
    this.store = await MemoryVectorStore.fromDocuments(docs, embedder)
  }

  public async shouldInvoke({ messages }: ActionState) {
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

  public async auto() {
    const snapshot = await this.page.content()
    if (snapshot !== this.snapshot) {
      this.snapshot = snapshot
      await this.embedSnapshot()
    }
  }
}
