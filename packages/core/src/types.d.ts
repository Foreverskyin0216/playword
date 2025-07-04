import type { AnthropicInput } from '@langchain/anthropic'
import type { EmbeddingsParams } from '@langchain/core/embeddings'
import type { AIMessage, HumanMessage, ToolMessage } from '@langchain/core/messages'
import type { GoogleGenerativeAIChatInput } from '@langchain/google-genai'
import type { ChatOpenAIFields, ClientOptions } from '@langchain/openai'
import type { BrowserContext, Frame, Page } from 'playwright-core'
import type { AI } from './ai'
import type * as actions from './actions'
import type { Recorder } from './recorder'

declare global {
  /** The custom window object to interact with the browser page. */
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

    /** Accepts the current action and saves it to the recorder. */
    accept: () => void

    /** Cancels the current action. */
    cancel: () => void

    /** Clears all recorded actions in the recorder. */
    clearAll: () => void

    /** Deletes the specified step on the timeline. */
    deleteStep: (index: number) => void

    /** Starts the dry run process. */
    dryRun: () => void

    /** Emits an action to the observer for processing. */
    emit: (action: ObserverAction) => void

    /** Stop the dry run process. */
    stopDryRun: () => void

    /** Updates the step description recorded in the observer. */
    updateInput: (input: string) => void
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
  name: keyof typeof actions

  /** Parameters to pass to the action during execution. */
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

  /** Specifies the duration to wait before performing the action, in milliseconds. */
  duration: number

  /**
   * The frame number to switch to, used for interacting with specific frames on a page.
   *
   * Frames are typically indexed starting from 0.
   */
  frameNumber: number

  /** The source of the frame in which to perform the action. */
  frameSrc: string

  /** The user input to describe how to extract the information from the page with AI. */
  input: string

  /**
   * The keys to press during the action.
   *
   * This should be a string representation of the keys, such as `"Enter"`, `"Ctrl+C"`, or `"ArrowUp"`.
   */
  keys: string

  /** The option to select from a dropdown menu. */
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

  /** The text to input into an element. */
  text: string

  /**
   * The URL to navigate to.
   *
   * This should be a valid and complete URL, including the protocol (e.g., `https://`).
   */
  url: string

  /** The XPath location of the element to interact with. */
  xpath: string
}

/**
 * This interface defines the required properties to record the state during the execution
 * of the graph of the `say method`.
 *
 * It includes a list of messages exchanged during the process.
 */
export interface GraphState {
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

  /** The full HTML content of the element, including tags, attributes, and text. */
  html: string

  /** The XPath location of the element to interact with. */
  xpath: string
}

/** Represents a memory vector used for storing content and its corresponding embedding. */
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

  /** The unique identifier for the vector. */
  id?: string

  /** Metadata associated with the vector. */
  metadata?: Record<string, unknown>
}

/** Configuration options for the Observer class. */
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

/** Configuration options for the PlayWord class. */
export interface PlayWordOptions {
  /**
   * Configuration options for the AI instance.
   *
   * These options allow customization of the API client, such as specifying
   * an API key or custom endpoint.
   *
   * @example
   * **Initialize with Google and change the default model**
   * ```ts
   * const playword = new PlayWord(context, {
   *   aiOptions: {
   *     googleApiKey: '<your-google-api-key>',
   *     model: 'gemini-2.0-flash'
   *   }
   * })
   * ```
   *
   * **Initialize with Anthropic and VoyageAI**
   * ```ts
   * const playword = new PlayWord(context, {
   *   aiOptions: {
   *     anthropicApiKey: 'sk-...',
   *     voyageAIApiKey: 'pa-...'
   *   }
   * })
   * ```
   *
   * **Use a custom OpenAI endpoint**
   * ```ts
   * const playword = new PlayWord(context, {
   *   aiOptions: {
   *     baseURL: 'https://api.my-openai-clone.com/v1',
   *     openAIApiKey: '<your-api-key>'
   *   }
   * })
   * ```
   *
   * @default {}
   */
  aiOptions?: AIOptions

  /**
   * Whether to enable debug mode.
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
   * Whether to record actions performed and where to save the recordings.
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
  /** AI instance to interact with the OpenAI API. */
  ai: AI

  /** Playwright `Context` instance used to control the browser. */
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
  frame?: Frame

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
  page?: Page

  /**
   * The recorder instance used to save the actions performed.
   *
   * If recording is not enabled or initialized, the value will be `undefined`.
   */
  recorder?: Recorder

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
   *
   * @example
   * **Navigate to a webpage**
   * ```ts
   * const playword = new PlayWord(context)
   * await playword.say('Go to https://www.google.com')
   * ```
   *
   * **Click a link**
   * ```ts
   * await playword.say('Click the "Gmail" link')
   * ```
   *
   * **Check for page content**
   * ```ts
   * const result = await playword.say('Does the page contain "Sign in"?')
   * // Output: true
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
  /** Input message to map actions performed. */
  input: string

  /** Actions performed in one step. */
  actions: Action[]
}

/** Custom configuration for tool calls. */
export interface ToolConfig {
  /**
   * Reference to the PlayWord interface instance.
   *
   * This provides access to the PlayWord instance for interacting with the browser and managing actions.
   */
  ref: PlayWordInterface
}

/**
 * Represents the current state of the observer.
 *
 * The `ObserverState` interface tracks various states during the execution of the observer.
 */
export interface ObserverState {
  /** Indicates whether the observer is currently performing a dry run. */
  dryRunning?: boolean

  /**
   * Indicates whether the Observer is waiting for AI to generate
   * a step description or adjust the current action.
   */
  waitingForAI?: boolean

  /**
   * Indicates whether the Observer is waiting for user input
   * to accept, modify, or drop the action.
   */
  waitingForUserAction?: boolean
}

/**
 * Interface that extends EmbeddingsParams and defines additional
 * parameters specific to the VoyageEmbeddings class.
 */
export interface VoyageEmbeddingsParams extends EmbeddingsParams {
  /** The VoyageAI API key. */
  apiKey?: string

  /**
   * The maximum number of documents to embed in a single request.
   *
   * This is limited by the VoyageAI API to a maximum of 8.
   *
   * @default 8
   */
  batchSize?: number

  /**
   * The endpoint URL for the VoyageAI API.
   *
   * @default 'https://api.voyageai.com/v1/embeddings'
   */
  endpoint?: string

  /**
   * Input type for the embeddings request. Can be "query", or "document".
   *
   * @default undefined
   */
  inputType?: 'query' | 'document'

  /**
   * The embeddings model to use.
   *
   * @default 'voyage-3'
   */
  model?: string

  /**
   * The desired dimension of the output embeddings.
   *
   * @default undefined
   */
  outputDimension?: number

  /**
   * The data type of the output embeddings. Can be "float" or "int8".
   *
   * @default 'float'
   */
  outputDtype?: 'float' | 'int8'

  /**
   * Whether to truncate the input texts to the maximum length allowed by the model.
   *
   * @default true
   */
  truncation?: boolean
}

/** Interface for the request body to generate embeddings. */
export interface VoyageRequest {
  /** The format of the output embeddings. */
  encoding_format?: string

  /** Texts to generate vector expectation */
  input: string | string[]

  /** Input type for the embeddings request. */
  input_type?: string

  /** The embeddings model to use. */
  model: string

  /** The desired dimension of the output embeddings. */
  output_dimension?: number

  /** The data type of the output embeddings. */
  output_dtype?: string

  /** Whether to truncate the input texts. */
  truncation?: boolean
}

/** Interface for the response body of the VoyageAI API. */
export interface VoyageResponse {
  /** An array of embedding objects. */
  data: {
    /**
     * Each embedding is a vector represented as an array of float numbers when
     * output_dtype is set to float and as an array of integers for other values (int8, uint8, binary, and ubinary).
     * The length of this vector varies depending on the specific model, output_dimension, and output_dtype.
     */
    embedding: number[]

    /** An integer representing the index of the embedding within the list of embeddings. */
    index: number

    /** The object type, which is always "embedding". */
    object: 'embedding'
  }[]

  /** Name of the model. */
  model: string

  /** The object type, which is always "list". */
  object: 'list'

  /** The usage statistics for the API request. */
  usage: {
    /** The total number of tokens used for computing the embeddings. */
    total_tokens: number
  }
}

/**
 * The response from an action performed on the page.
 *
 * - For assertion actions, the result is a boolean value indicating success (`true`) or failure (`false`).
 * - For non-assertion actions, the result is a string message describing the outcome.
 * - For multiple actions, the result is an array of strings or booleans.
 */
export type ActionResult = boolean | string

/** Configuration for the AI class. */
export type AIOptions = GoogleOptions | OpenAIOptions | AnthropicOptions | VoyageOptions

/** Anthropic configuration options. */
export type AnthropicOptions = Partial<AnthropicInput> & ClientOptions

/** Google configuration options. */
export type GoogleOptions = Partial<GoogleGenerativeAIChatInput> & {
  /** The API key for the Google API. */
  googleApiKey?: string
}

/** OpenAI configuration options. */
export type OpenAIOptions = Partial<ChatOpenAIFields> & ClientOptions

/** VoyageAI configuration options. */
export type VoyageOptions = Partial<VoyageEmbeddingsParams> & {
  /** The VoyageAI API key. */
  voyageAIApiKey?: string
}

/**
 * Represents an action observed during user interactions.
 *
 * This type includes various action types and their associated parameters.
 */
export type ObserverAction =
  | {
      /** The name of the action. */
      name: 'click'

      /**
       * The parameters for the `click` action.
       *
       * Includes the location of the element to be clicked.
       */
      params: ElementLocation
    }
  | {
      /** The name of the action. */
      name: 'hover'

      /**
       * The parameters for the `hover` action.
       *
       * Includes the location of the element and the duration of the hover action.
       */
      params: ElementLocation & { duration: number }
    }
  | {
      /** The name of the action. */
      name: 'input'

      /**
       * The parameters for the `input` action.
       *
       * Includes the location of the element and the text to input.
       */
      params: ElementLocation & { text: string }
    }
  | {
      /** The name of the action. */
      name: 'select'

      /**
       * The parameters for the `select` action.
       *
       * Includes the location of the dropdown element and the option to select.
       */
      params: ElementLocation & { option: string }
    }
  | {
      /** The name of the action. */
      name: 'goto'

      /**
       * The parameters for the `goto` action.
       *
       * Includes the URL to navigate to.
       */
      params: { url: string }
    }
