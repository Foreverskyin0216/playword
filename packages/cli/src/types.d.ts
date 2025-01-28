import type { ClientOptions } from 'openai'

/**
 * Represents an executable action within the application.
 *
 * This interface defines the structure for actions that can be performed
 * using the functions provided in the `actions` module. Each action includes a
 * name, parameters, and an optional status indicating the success of its last execution.
 */
export interface Action {
  /**
   * The action name to be executed.
   *
   * This must correspond to one of the functions defined in the actions module.
   */
  name: string

  /**
   * Parameters to pass to the action during execution.
   */
  params: Partial<ActionParams>

  /**
   * Indicates whether the action succeeded during the most recent execution.
   *
   * This field is optional and defaults to `undefined` if the action has not been executed.
   */
  success?: boolean
}

/**
 * Parameters for the actions.
 *
 * This interface defines the inputs required to perform various actions
 * within the application. Each property corresponds to a specific type of interaction
 * or behavior.
 */
export interface ActionParams {
  /**
   * Specifies the direction to scroll the page.
   *
   * Possible values:
   * - `up`: Scrolls the page upwards by the height of the window (`window.innerHeight`).
   * - `down`: Scrolls the page downwards by the height of the window (`window.innerHeight`).
   * - `top`: Scrolls the page to the topmost position.
   * - `bottom`: Scrolls the page to the bottommost position.
   */
  direction: 'up' | 'down' | 'top' | 'bottom'

  /**
   * Specifies the duration to wait before performing the action, in milliseconds.
   */
  duration: number

  /**
   * The frame number to switch to, used for interacting with specific frames on a page.
   *
   * Frames are typically indexed starting from 0.
   */
  frameNumber: number

  /**
   * The source of the frame in which to perform the action.
   */
  frameSrc: string

  /**
   * The keys to press during the action.
   *
   * This should be a string representation of the keys, such as `"Enter"`, `"Ctrl+C"`, or `"ArrowUp"`.
   */
  keys: string

  /**
   * The option to select from a dropdown menu.
   */
  option: string

  /**
   * The page number to switch to, used when multiple pages are managed simultaneously.
   *
   * Pages are typically indexed starting from 0.
   */
  pageNumber: number

  /**
   * A regular expression pattern to verify if the current URL matches a specific format.
   *
   * @example `^https://example.com/.*$`
   */
  pattern: string

  /**
   * The text to input into an element.
   */
  text: string

  /**
   * The URL to navigate to.
   *
   * This should be a valid and complete URL, including the protocol (e.g., `https://`).
   */
  url: string

  /**
   * The XPath location of the element to interact with.
   */
  xpath: string
}

/**
 * Configuration options for the AI class.
 */
export type AIOptions = ClientOptions & {
  /**
   * The chat model to use for general tasks.
   *
   * @default 'gpt-4o-mini'
   */
  chat?: string
  /**
   * The embeddings model to use for generating embeddings.
   *
   * @default 'text-embedding-3-small'
   */
  embeddings?: string
}

/**
 * This interface defines the options that can be passed to the observe command
 */
export interface ObserveOptions {
  /**
   * The browser to use for observing.
   */
  browser: string

  /**
   * The delay between executing each action during the dry run process.
   */
  delay: number

  /**
   * The environment file to use for observing.
   */
  envFile: string

  /**
   * Where to save the recordings.
   */
  recordPath: string

  /**
   * Whether to enable verbose mode.
   */
  verbose: boolean

  /**
   * Additional OpenAI API options.
   */
  openaiOptions: AIOptions
}

/**
 * Represents a recording of actions performed during user interactions.
 *
 * This interface includes the input message and the actions performed in one step.
 */
export interface Recording {
  /**
   * Input message to map actions performed.
   */
  input: string

  /**
   * Actions performed in one step.
   */
  actions: Action[]
}

/**
 * This interface defines the options that can be passed to the test command
 */
export interface TestOptions {
  /**
   * The browser to use for testing.
   */
  browser: string

  /**
   * The delay between executing each action during playback.
   */
  delay: number

  /**
   * The environment file to use for testing.
   */
  envFile: string

  /**
   * Whether to open the browser in headed mode.
   */
  headed: boolean

  /**
   * Additional OpenAI API options.
   */
  openaiOptions: AIOptions

  /**
   * Whether to record the test steps.
   */
  record: string | boolean

  /**
   * Whether to playback the test steps from a recording file.
   */
  playback: boolean

  /**
   * Whether to enable verbose mode.
   */
  verbose: boolean
}
