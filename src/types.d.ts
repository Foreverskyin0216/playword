import type { BaseMessage } from '@langchain/core/messages'

export interface ActionState {
  messages: BaseMessage[]
}

export interface ElementLocation {
  element: string
  xpath: string
}

export interface PlayWord {
  /**
   * Return the current page.
   */
  getPage(): import('playwright').Page
  /**
   * Return the current snapshot.
   */
  getSnapshot(): string
  /**
   * Return the vector store that includes all embedded element locations.
   */
  getStore(): import('langchain/vectorstores/memory').MemoryVectorStore
  /**
   * Set a new memory vector store for embedded element locations.
   */
  setStore(store: import('langchain/vectorstores/memory').MemoryVectorStore): void
  /**
   * Set a new snapshot for the current page.
   */
  setSnapshot(snapshot: string): void
  /**
   * Say something to perform actions.
   */
  say(message: string): void
}
