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

export interface PlayWordOptions {
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
   * @example
   * ```ts
   * const playword = new PlayWord(page, { record: true })
   * const playword = new PlayWord(page, {
   *  record: 'path/to/recordings.json'
   * })
   * ```
   * @default false
   */
  record: boolean | string
}

export interface PlayWordProperties {
  /**
   * The last input message.
   */
  lastInput: string
  /**
   * The page to perform actions on.
   */
  page: import('playwright').Page
  /**
   * Whether to record the actions performed.
   */
  record: boolean | string
  /**
   * The recordings of the actions performed.
   */
  recordings: Recording[]
  /**
   * The snapshot of the page content.
   */
  snapshot: string
  /**
   * The step number of the actions performed.
   */
  step: number
  /**
   * The vector store to save embedded element locations.
   */
  store: import('langchain/vectorstores/memory').MemoryVectorStore | null
  /**
   * ### Perform actions on the page with natural language input.
   * The input will be converted to the corresponding action to operate on the page.
   *
   * @param input The action to perform on the page.
   * @param options Optional. See {@link SayOptions}.
   * @example
   * ```ts
   * const playword = new PlayWord(page)
   * await playword.say('Navigate to https://www.google.com')
   * await playword.say('Click the "Gamil" link')
   *
   * const success = await playword.say(
   *  'Check if the page contains "Sign in"'
   * )
   * console.log(success)
   * // Output: true
   *
   * const failure = await playword.say(
   *  'Check if the page contains "Sign In"',
   *  { withoutRecordings: true }
   * )
   * console.log(failure)
   * // Output: false
   * ```
   * @returns ### The following are the possible return types:
   *
   * **boolean**: The result of the assertion action.
   *
   * **string**: The result of the normal action performed by AI.
   *
   * **void** | **null**: The result of the normal action performed by recordings.
   */
  say(input: string, options: SayOptions): void
}

export interface SayOptions {
  /**
   * Whether to use the recordings for the current step when ebabling the record option.
   *
   * Default is **false**. If set to **true**, the step will be performed by AI.
   */
  withoutRecordings: boolean
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
export type ActionParams =
  | { direction: 'up' | 'down' | 'top' | 'bottom' }
  | { keys: string }
  | { pattern: string }
  | { text: string }
  | { url: string }
  | { xpath: string }
  | { xpath: string; option: string }
  | { xpath: string; text: string }
