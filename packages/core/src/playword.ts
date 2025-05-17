import type { BrowserContext, Frame, Page } from 'playwright-core'
import type { ActionResult, PlayWordInterface, PlayWordOptions, Recording } from './types'

import { HumanMessage } from '@langchain/core/messages'
import { setTimeout } from 'timers/promises'
import { playwordGraph } from './graph'
import * as actions from './actions'
import { AI } from './ai'
import { Recorder } from './recorder'
import * as utils from './utils'

/**
 * PlayWord enables users to automate browsers with AI.
 *
 * This class simplifies browser automation by removing the need to locate elements
 * manually using selectors. Instead, you can describe your desired actions in natural
 * language, and PlayWord will interpret and execute them.
 *
 * **Repository**: [GitHub - PlayWord](https://github.com/Foreverskyin0216/playword)
 *
 * @param context The Playwright `Context` instance used to control the browser.
 * @param playwordOptions Optional configuration for PlayWord. See {@link PlayWordOptions} for details.
 *
 * @example
 * **Create a new PlayWord instance**
 * ```ts
 * const context = await browser.newContext()
 * const playword = new PlayWord(context, {
 *   aiOptions: {
 *     openAIApiKey: '<your-api-key>'
 *   },
 *   debug: true,
 *   delay: 500,
 *   record: 'spec/test-login.json'
 * })
 * ```
 */
export class PlayWord implements PlayWordInterface {
  /** AI instance to interact with the OpenAI API. */
  ai: AI

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
  input = ''

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
  stepCount = 0

  /**
   * Cache for storing retrieved data during tool calls.
   */
  cache: ActionResult[] = []

  constructor(
    public context: BrowserContext,
    { debug = false, delay = 250, aiOptions = {}, record = false }: PlayWordOptions = {}
  ) {
    process.env.PLWD_DEBUG = debug.toString()

    this.ai = new AI(aiOptions)

    this.context.on('page', (page) => {
      this.page = page
      this.page.on('close', () => (this.page = this.context.pages()[this.context.pages().length - 1]))
    })

    this.delay = Math.abs(delay)

    if (record) {
      this.recorder = new Recorder(record === true ? '.playword/recordings.json' : record)
    }

    this.say = this.say.bind(this)
  }

  /**
   * The decorator to handle the test fixture, including the setup process and teardown process.
   *
   * **Setup:**
   * - If the page is not initialized, create a new page.
   * - If recording is enabled, load the recordings from the record file.
   * - If the input starts with the AI pattern, replace the AI pattern with an empty string for the input.
   *
   * **Teardown:**
   * - Increment the step count to locate the recording in the record file.
   */
  private static fixture(_target: object, _property: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (message: string) {
      const playword = this as PlayWord
      /** Setup */
      if (playword.stepCount === 0) {
        await Promise.all([playword.context.newPage(), playword.recorder?.load()])
      }

      playword.input = message.replace(utils.aiPattern, '').trim()

      /** Action */
      const result = await method.apply(playword, [message])

      /** Teardown */
      playword.stepCount++

      return result
    }
  }

  /** Invoke the PlayWord graph to perform actions. */
  private async usePlayWordGraph() {
    utils.info('[AI] ' + this.input, 'green', true)

    this.recorder?.initStep(this.stepCount, this.input)

    const { messages } = await playwordGraph().invoke(
      {
        messages: [new HumanMessage(this.input)]
      },
      {
        configurable: { ref: this }
      }
    )

    const response = messages[messages.length - 1].content.toString()
    utils.info('[RETURN] ' + response, 'green')

    this.recorder?.save()

    return ['true', 'false'].includes(response) ? response === 'true' : response
  }

  /**
   * Use recordings to perform actions. If the action fails, retry with AI.
   *
   * @param recording The recording to perform actions. See {@link Recording} for details.
   */
  private async useRecording(recording: Recording) {
    utils.info(`[RECORDING] ${this.input}`, 'green', true)

    let result: ActionResult = ''

    this.recorder?.initStep(this.stepCount, this.input)

    for (const { name, params } of recording.actions) {
      result = await actions[name](this, params)
      utils.info(result.toString())

      if (result.toString().startsWith('Failed')) {
        utils.info('Retrying with AI...', 'magenta')
        return this.usePlayWordGraph()
      }

      this.recorder?.addAction({ name, params })
      await setTimeout(this.delay)
    }

    this.recorder?.save()

    return result
  }

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
   * // Output: true
   * ```
   */
  @PlayWord.fixture
  public async say(message: string) {
    const recording = this.recorder?.list().find((r, i) => r.input === this.input && i === this.stepCount)

    if (utils.aiPattern.test(message) || !recording) {
      return this.usePlayWordGraph()
    }

    return this.useRecording(recording)
  }
}
