import type { Document } from '@langchain/core/documents'
import type { BaseMessage } from '@langchain/core/messages'
import type { ClientOptions } from '@langchain/openai'
import type { Frame, Page } from 'playwright-core'
import type { AI } from './ai'
import type { startLog } from './logger'

export interface Action {
  /**
   * The predefined action name.
   */
  name: string
  /**
   * The parameters to pass to the action.
   */
  params: ActionParams
}

/**
 * All types of parameters for the actions.
 */
export interface ActionParams {
  attribute?: string
  direction?: 'up' | 'down' | 'top' | 'bottom'
  duration?: number
  frameNumber?: number
  keys?: string
  option?: string
  order?: number
  pattern?: string
  text?: string
  url?: string
  xpath?: string
}

/**
 * The result type of the actions.
 */
export type ActionResult = Document[] | boolean | string | undefined

/**
 * State for the action graph.
 */
export interface ActionState {
  messages: BaseMessage[]
}

export interface ElementLocation {
  /**
   * Content of the element. Include the tags, attributes, and text.
   */
  element: string
  /**
   * The XPath to the element.
   */
  xpath: string
}

export interface MemoryVector {
  /**
   * The content of the vector.
   */
  content: string
  /**
   * The corresponding embedding.
   */
  embedding: number[]
}

export interface PlayWordOptions {
  /**
   * Whether to enable debug mode.
   */
  debug?: boolean
  /**
   * OpenAI options to configure the client. See {@link ClientOptions}.
   *
   * @example
   * **Use a custom OpenAI endpoint**
   * ```ts
   * const playword = new PlayWord(page, {
   *   openAIOptions: {
   *     apiKey: '<your-api-key>',
   *     baseURL: 'https://api.my-openai-clone.com/v1'
   *   }
   * })
   * ```
   */
  openAIOptions?: ClientOptions
  /**
   * Whether to record the actions performed.
   *
   * The value can be:
   *
   * **string**: Path to save the json file for recorded actions. Should be ended with .json.
   *
   * **true**: Record the actions. The recordings will be saved in `.playword/recordings.json` as default.
   *
   * **false**: Do not record the actions.
   *
   * @example
   * **Save recordings to '.playword/recordings.json' by default**
   * ```ts
   * const playword = new PlayWord(page, { record: true })
   * ```
   *
   * **Save recordings to a custom path**
   * ```ts
   * const playword = new PlayWord(page, {
   *  record: 'path/to/recordings.json'
   * })
   * ```
   */
  record?: boolean | string
  /**
   * Whether to retry the action with AI when the action fails.
   */
  retryOnFailure?: boolean
  /**
   * Whether to use screenshots to help AI understand the page.
   *
   * When enabled, PlayWord will label the candidates of the retrieved elements on the page, then refer to the labels when choosing the best candidate.
   * After the best candidate is chosen, all labels will be removed from the candidates.
   *
   * **NOTE:** This option will consume more tokens and take longer time to perform actions.
   *
   * @example
   * **Enable screenshot reference**
   * ```ts
   * const playword = new PlayWord(page, { useScreenshot: true })
   * ```
   */
  useScreenshot?: boolean
}

export interface PlayWordInterface {
  /**
   * The AI wrapper
   */
  ai: AI
  /**
   * Whether to enable debug mode.
   */
  debug: boolean
  /**
   * Page elements used for detecting the UI changes.
   */
  elements: ElementLocation[]
  /**
   * The current frame.
   */
  frame: Frame | undefined
  /**
   * The last input message.
   */
  input: string
  /**
   * Logger for debugging.
   */
  logger: Awaited<ReturnType<typeof startLog>> | undefined
  /**
   * The page to perform actions on.
   */
  page: Page
  /**
   * Whether to record the actions performed.
   */
  record: boolean | string | undefined
  /**
   * Recordings of the actions performed.
   */
  recordings: Recording[]
  /**
   * Whether to retry the action with AI when the action fails.
   */
  retryOnFailure: boolean
  /**
   * The page snapshot used for detecting the UI changes.
   */
  snapshot: string
  /**
   * The step number of the actions performed.
   */
  step: number
  /**
   * Whether to use screenshots to help AI understand the page.
   */
  useScreenshot: boolean
  /**
   * ### Perform actions on the page with natural language input.
   * The input will be converted to the corresponding action to operate on the page.
   *
   * @param input The action to perform on the page.
   * @returns See {@link ActionResult}.
   *
   * @example
   * ```ts
   * const playword = new PlayWord(page)
   * await playword.say('Navigate to https://www.google.com')
   * await playword.say('Click the "Gamil" link')
   *
   * const success = await playword.say(
   *  'Check if the page contains "Sign in"'
   * )
   * // Output: true
   *
   * const failure = await playword.say(
   *  'Check if the page contains "Sign In"'
   * )
   * // Output: false
   * ```
   */
  say(input: string): Promise<ActionResult>
}

export interface Recording {
  /**
   * The input message to map actions performed.
   */
  input: string
  /**
   * The actions performed in one step.
   */
  actions: Action[]
}

/**
 * Custom configuration for tool calls.
 */
export interface ToolConfig {
  ref: PlayWordInterface
  thread_id: string
  use_screenshot: boolean
}
