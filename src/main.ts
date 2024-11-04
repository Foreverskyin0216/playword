import { Document } from '@langchain/core/documents'
import { OpenAIEmbeddings } from '@langchain/openai'

import { MemoryVectorStore } from 'langchain/vectorstores/memory'

import { chromium } from 'playwright'

import { Playwright } from './lib/playwright'
import { generateXPath } from './utils/xpathGenerator'
;(async () => {
  const playwright = await Playwright.from(chromium, { headless: false })

  await playwright.navigate('https://www.google.com')

  const snapshot = await playwright.getSnapshot()

  const elementPaths = generateXPath(snapshot, ['a', 'div', 'button', 'input', 'select', 'textarea'])

  const docs = elementPaths.map(
    ({ element, xpath, source }) =>
      new Document({
        id: xpath,
        pageContent: element,
        metadata: source ? { source } : {}
      })
  )

  const start = Date.now()
  const vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings({ modelName: 'text-embedding-3-small' })
  )
  const retriever = vectorStore.asRetriever(5)
  const end = Date.now()
  console.log('Time:', (end - start) / 1000)

  const question = 'Gmail a button div input select textarea'
  const retrievedDocs = await retriever.invoke(question)
  console.log(retrievedDocs)

  for (const doc of retrievedDocs) {
    const locator = playwright.getPage().locator(doc.id!).first()
    const [visible, enabled] = await Promise.all([locator.isVisible(), locator.isEnabled()])
    console.log(doc.id, visible && enabled)
  }

  await playwright.close()
})()
