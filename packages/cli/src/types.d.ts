import type { AnthropicInput } from '@langchain/anthropic'
import type { GoogleGenerativeAIChatInput } from '@langchain/google-genai'
import type { ChatOpenAIFields, ClientOptions } from '@langchain/openai'

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

/** This interface defines the options that can be passed to the observe command. */
export interface ObserveOptions {
  /** Additional AI options. */
  aiOptions: AIOptions

  /**
   * The browser to use for testing.
   *
   * @default 'chrome'
   */
  browser: 'chrome' | 'chromium' | 'firefox' | 'msedge' | 'webkit'

  /**
   * The delay between executing each action during playback.
   *
   * @default 250
   */
  delay: number

  /**
   * The environment file to use for testing.
   *
   * @default '.env'
   */
  envFile: string

  /**
   * Where to save the recordings.
   *
   * @default '.playword/recordings.json'
   */
  recordPath: string

  /**
   * Whether to enable verbose mode.
   *
   * @default false
   */
  verbose: boolean
}

/**
 * Represents a recording of actions performed during user interactions.
 *
 * This interface includes the input message and the actions performed in one step.
 */
export interface Recording {
  /** Actions performed in one step. */
  actions: Action[]

  /** Input message to map actions performed. */
  input: string
}

/** This interface defines the options that can be passed to the test command */
export interface TestOptions {
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
   * The browser to use for testing.
   *
   * @default 'chrome'
   */
  browser: 'chrome' | 'chromium' | 'firefox' | 'msedge' | 'webkit'

  /**
   * The delay between executing each action during playback.
   *
   * @default 250
   */
  delay: number

  /**
   * The environment file to use for testing.
   *
   * @default '.env'
   */
  envFile: string

  /**
   * Whether to open the browser in headed mode.
   *
   * @default false
   */
  headed: boolean

  /**
   * Whether to playback the test steps from a recording file.
   *
   * @default false
   */
  playback: boolean

  /**
   * Whether to record the test steps.
   *
   * @default false
   */
  record: boolean | string

  /**
   * Whether to enable verbose mode.
   *
   * @default false
   */
  verbose: boolean
}

/**
 * Interface that extends EmbeddingsParams and defines additional
 * parameters specific to the VoyageEmbeddings class.
 */
export interface VoyageEmbeddingsParams {
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
   * The format of the output embeddings. Can be "float", "base64", or "ubinary".
   *
   * @default 'float'
   */
  encodingFormat?: 'float' | 'base64' | 'ubinary'

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

/** Configuration for the AI class. */
export type AIOptions = GoogleOptions | OpenAIOptions | AnthropicOptions | VoyageOptions

/** Anthropic configuration options. */
export type AnthropicOptions = AnthropicInput & ClientOptions

/** Google configuration options. */
export type GoogleOptions = GoogleGenerativeAIChatInput & {
  /** The API key for the Google API. */
  googleApiKey?: string
}

/** OpenAI configuration options. */
export type OpenAIOptions = ChatOpenAIFields & ClientOptions

/** VoyageAI configuration options. */
export type VoyageOptions = VoyageEmbeddingsParams & {
  /** The VoyageAI API key. */
  voyageAIApiKey?: string
}
