import type { BaseMessage } from '@langchain/core/messages'

export interface ActionState {
  messages: BaseMessage[]
}

export interface ElementLocation {
  element: string
  xpath: string
}
