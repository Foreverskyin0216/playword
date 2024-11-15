import type { BaseMessage } from '@langchain/core/messages'

export interface ActionState {
  messages: BaseMessage[]
}

export interface LocatorBox {
  x: number
  y: number
  width: number
  height: number
}

export interface ElementLocation {
  /**
   * The entire content of the element. Including the tags, attributes, and text.
   */
  element: string
  /**
   * The XPath to the element.
   */
  xpath: string
}

export interface PlayWord {
  /**
   * The page to perform actions on.
   */
  page: import('playwright').Page
  /**
   * The vector store to save embedded element locations.
   */
  store: import('langchain/vectorstores/memory').MemoryVectorStore | null
  /**
   * The snapshot of the current page.
   */
  snapshot: string
  /**
   * Say something to perform actions.
   */
  say(message: string): void
}
