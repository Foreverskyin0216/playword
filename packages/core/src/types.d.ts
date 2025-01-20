import type { AIMessage, HumanMessage, ToolMessage } from '@langchain/core/messages'
import type { ClientOptions } from '@langchain/openai'
import type { BrowserContext, Frame, Page } from 'playwright-core'
import type { AI } from './ai'
import type { Recorder } from './recorder'

declare global {
  /**
   * The custom window object to interact with the browser page.
   */
  interface Window {
    /**
     * When assigning named functions in **page.evaluate** and run the programe with `tsx`,
     * an error `ReferenceError: __name is not defined` will be thrown.
     *
     * **Workaround**
     *
     * Define `__name` property in the window object to avoid the error.
     *
     * **Reference**
     *
     * https://stackoverflow.com/questions/78218772
     */
    __name: (fn: unknown) => unknown

    /**
     * Accepts the current action event and saves it to the recorder.
     */
    acceptEvent: () => Promise<void>

    /**
     * Clears all recorded actions in the recorder.
     */
    clearAll: () => Promise<void>

    /**
     * Cancels the current action event.
     */
    dropEvent: () => Promise<void>

    /**
     * Starts the dry run process.
     */
    dryRun: () => Promise<void>

    /**
     * Sends an action event to the observer for processing.
     *
     * @param event The action event to process. See {@link ObserverEvent} for details.
     */
    emit: (event: ObserverEvent) => Promise<void>

    /**
     * Displays a toast notification with the specified message, icon, and color.
     *
     * @param content The message content to display in the notification.
     * @param icon The icon to display in the notification.
     * @param color The text color for the notification. Accepts color names or HEX values (e.g., `#ffffff`).
     */
    notify: (content: string, icon: string, color: string) => Promise<void>

    /**
     * Retrieves the current state of the observer.
     *
     * @returns A promise resolving to the current observer state. See {@link ObserverState} for details.
     */
    state: () => Promise<ObserverState>

    /**
     * Updates the step description recorded in the observer.
     *
     * @param input The new step description to update.
     */
    updateInput: (input: string) => Promise<void>
  }
}

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
 * The response from an action performed on the page.
 *
 * - For assertion actions, the result is a boolean value indicating success (`true`) or failure (`false`).
 * - For non-assertion actions, the result is a string message describing the outcome.
 */
export type ActionResult = boolean | string

/**
 * The state for the action graph.
 *
 * This interface defines the required properties to record the state during the execution
 * of the action graph. It includes a list of messages exchanged during the process.
 */
export interface ActionState {
  /**
   * A list of messages generated during the execution of the action graph.
   *
   * The messages can be of the following types:
   * - `AIMessage`: Messages generated by the AI model.
   * - `HumanMessage`: Messages provided by the user.
   * - `ToolMessage`: Messages generated when the AI model interacts with tools to perform specific tasks.
   */
  messages: Array<AIMessage | HumanMessage | ToolMessage>
}

/**
 * Location information for an element on the page.
 *
 * This interface provides the necessary properties to identify and describe an element for interaction on the page.
 */
export interface ElementLocation {
  /**
   * The source URL or identifier of the frame containing the element.
   *
   * This is an optional field used when the element resides inside an iframe or frame.
   */
  frameSrc?: string

  /**
   * The full HTML content of the element, including tags, attributes, and text.
   */
  html: string

  /**
   * The XPath location of the element to interact with.
   */
  xpath: string
}

/**
 * Represents a memory vector used for storing content and its corresponding embedding.
 */
export interface MemoryVector {
  /**
   * The content associated with the vector.
   *
   * This can be any string data, such as text, metadata, or labels.
   */
  content: string

  /**
   * The numerical embedding corresponding to the content.
   *
   * The embedding is represented as an array of numbers, typically generated by embedding models.
   */
  embedding: number[]
}

/**
 * Configuration options for the observer.
 */
export interface ObserverOptions {
  /**
   * The delay in milliseconds to wait before executing each action during a dry run.
   *
   * This introduces a pause between consecutive actions to wait for loading and rendering.
   *
   * @default 250
   */
  delay?: number

  /**
   * The file path where the recordings will be saved.
   *
   * This specifies the location for storing recorded actions. The path should end with `.json`.
   *
   * Example: `/path/to/custom/recordings.json`
   *
   * @default '.playword/recordings.json'
   */
  recordPath?: string
}

/**
 * Configuration options for the PlayWord instance.
 */
export interface PlayWordOptions {
  /**
   * Enables or disables debug mode.
   *
   * When enabled, additional debug information will be logged during execution.
   *
   * @default false
   */
  debug?: boolean

  /**
   * The delay in milliseconds to wait before executing each action during the playback.
   *
   * This introduces a pause between actions to wait for loading and rendering.
   *
   * @default 250
   */
  delay?: number

  /**
   * Configuration options for the OpenAI client.
   *
   * These options allow customization of the OpenAI API client, such as specifying
   * an API key or custom endpoint.
   *
   * @example
   * **Use a custom endpoint**
   * ```ts
   * const playword = new PlayWord(context, {
   *   openAIOptions: {
   *     apiKey: '<your-api-key>',
   *     baseURL: 'https://api.my-openai-clone.com/v1'
   *   }
   * })
   * ```
   *
   * @default {}
   */
  openAIOptions?: ClientOptions

  /**
   * Configures whether to record actions performed and where to save the recordings.
   *
   * - `true`: Records actions and saves them to `.playword/recordings.json` by default.
   * - `string`: Specifies a custom file path for saving the recordings. The path must end with `.json`.
   * - `false`: Disables action recording.
   *
   * @example
   * **Record actions and save to the default path**
   * ```ts
   * const playword = new PlayWord(context, { record: true })
   * ```
   *
   * **Save recordings to a custom path**
   * ```ts
   * const playword = new PlayWord(context, {
   *   record: 'path/to/recordings.json'
   * })
   * ```
   *
   * **Disable recordings**
   * ```ts
   * const playword = new PlayWord(context, { record: false })
   * ```
   *
   * @default false
   */
  record?: boolean | string
}

/**
 * Interface for interacting with PlayWord, providing functions to control the browser,
 * perform actions, and interact with the OpenAI API using natural language.
 */
export interface PlayWordInterface {
  /**
   * AI instance to interact with the OpenAI API.
   */
  ai: AI

  /**
   * The Playwright `Context` instance used to control the browser.
   */
  context: BrowserContext

  /**
   * The delay in milliseconds to wait before executing each action during the playback.
   *
   * This introduces a pause between actions to wait for loading and rendering.
   *
   * @default 250
   */
  delay: number

  /**
   * The frame within the page, if the current context is inside a frame.
   *
   * This property represents the current frame being operated on within the page. It
   * allows for frame-specific actions when the context is nested inside an iframe.
   *
   * - **PlayWord Observer**: The current frame will be recorded and saved to the record file.
   * - **PlayWord**: You can switch frames dynamically using the `say` method.
   *
   * If no frame is set, the value will be `undefined`.
   *
   * @example
   * **Switch to the specified frame**
   * ```ts
   * // Switch to the frame with the name "frame-name"
   * await playword.say('Switch to the frame "frame-name"')
   * // Switch to the frame with the source "https://www.example.com"
   * await playword.say('Switch to the frame "https://www.example.com"')
   * ```
   */
  frame: Frame | undefined

  /**
   * The most recent input from the user.
   *
   * This stores the last natural language command provided to the `say` method.
   */
  input: string

  /**
   * The Playwright `Page` instance used to perform actions.
   *
   * This property represents the current page being operated on. When a new page is
   * opened, the context will automatically switch to the new page. Additionally,
   * manual page switching can be performed using the `say` method.
   *
   * @example
   * **Switch to the specified page**
   * ```ts
   * // Switch to the first page
   * await playword.say('Switch to the first page')
   * // Switch to the second page
   * await playword.say('Switch to the second page')
   * ```
   */
  page: Page | undefined

  /**
   * The recorder instance used to save the actions performed.
   *
   * If recording is not enabled or initialized, the value will be `undefined`.
   */
  recorder: Recorder | undefined

  /**
   * Step count to keep track of the actions performed.
   * This is used to locate the recording in the record file.
   */
  stepCount: number

  /**
   * Executes actions on the page using natural language input.
   *
   * Converts the provided input into corresponding actions and performs them
   * on the browser page.
   *
   * @param message Natural language input to specify the action.
   * @returns The result of the action, which can be a boolean (for assertions)
   * or a string message indicating the outcome. See {@link ActionResult} for details.
   *
   * @example
   * **Navigate to a webpage**
   * ```ts
   * const playword = new PlayWord(context)
   * await playword.say('Navigate to https://www.google.com')
   * ```
   *
   * **Click a link**
   * ```ts
   * await playword.say('Click the "Gmail" link')
   * ```
   *
   * **Check for page content**
   * ```ts
   * const result = await playword.say('Check if the page contains "Sign in"')
   * console.log(result) // Output: true
   * ```
   */
  say(message: string): Promise<ActionResult>
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
 * Custom configuration for tool calls.
 */
export interface ToolConfig {
  /**
   * Reference to the PlayWord interface instance.
   *
   * This provides access to the PlayWord instance for interacting with the browser and managing actions.
   */
  ref: PlayWordInterface
}

/**
 * Represents an event observed during user interactions.
 *
 * The `ObserverEvent` type includes various event types and their associated parameters.
 */
export type ObserverEvent =
  | {
      /** The name of the event. */
      name: 'click'
      /**
       * The parameters for the `click` event.
       *
       * Includes the location of the element to be clicked.
       */
      params: ElementLocation
    }
  | {
      /** The name of the event. */
      name: 'hover'
      /**
       * The parameters for the `hover` event.
       *
       * Includes the location of the element and the duration of the hover action.
       */
      params: ElementLocation & { duration: number }
    }
  | {
      /** The name of the event. */
      name: 'input'
      /**
       * The parameters for the `input` event.
       *
       * Includes the location of the element and the text to input.
       */
      params: ElementLocation & { text: string }
    }
  | {
      /** The name of the event. */
      name: 'select'
      /**
       * The parameters for the `select` event.
       *
       * Includes the location of the dropdown element and the option to select.
       */
      params: ElementLocation & { option: string }
    }
  | {
      /** The name of the event. */
      name: 'goto'
      /**
       * The parameters for the `goto` event.
       *
       * Includes the URL to navigate to.
       */
      params: { url: string }
    }

/**
 * Represents the current state of the observer.
 *
 * The `ObserverState` interface tracks various states during the execution of the observer.
 */
export interface ObserverState {
  /**
   * Indicates whether the observer is currently performing a dry run.
   */
  isDryRunning?: boolean
  /**
   * Indicates whether the Observer is waiting for AI to generate
   * a step description or adjust the current action.
   */
  isWaitingForAI?: boolean
  /**
   * Indicates whether the Observer is waiting for user input
   * to accept, modify, or drop the action.
   */
  isWaitingForUserAction?: boolean
}
