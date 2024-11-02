import type { AIMessage } from '@langchain/core/messages'
import type { MemoryVectorStore } from 'langchain/vectorstores/memory'
import type { Page } from 'playwright'
import type { PlayWordOptions, Recording, SayOptions } from './types'

import { access, mkdir, readFile, writeFile } from 'fs/promises'
import { dirname } from 'path'
import { setTimeout } from 'timers/promises'
import { HumanMessage } from '@langchain/core/messages'
import { v4 as uuidv4 } from 'uuid'

import { actionGraph } from './actionGraph'
import * as actions from './actions'

/**
 * @class ### PlayWord
 *
 * Playword includes the following features:
 * - Perform actions on the browser page with natural language input.
 * - Record the actions performed to replay them later without token consumption.
 * @param page The PlayWright page. See {@link Page}.
 * @param playwordOptions Optional. See {@link PlayWordOptions}.
 */
export class PlayWord {
  /**
   * LangGraph requires a unique thread id to keep track of the conversation.
   */
  private threadId: string = uuidv4()
  /**
   * The last input to map the input message to the action performed.
   */
  lastInput: string = ''
  /**
   * PlayWright page to perform actions on.
   */
  page: Page
  /**
   * Whether to record the actions performed.
   */
  record: boolean | string = false
  /**
   * The recordings of the actions performed.
   */
  recordings: Recording[] = []
  /**
   * The snapshot of the current page content.
   */
  snapshot: string = ''
  /**
   * Step number of the current action performed.
   */
  step: number = 0
  /**
   * The vector store to save embedded element locations.
   */
  store: MemoryVectorStore | null = null

  constructor(page: Page, playwordOptions: PlayWordOptions = { record: false }) {
    this.page = page
    this.record = playwordOptions.record === true ? '.playword/recordings.json' : playwordOptions.record
  }

  private async checkPath(path: string) {
    try {
      await access(path)
      return path.endsWith('.json')
    } catch {
      return false
    }
  }

  private async beforeAction() {
    if (this.record && (await this.checkPath(this.record as string))) {
      const file = await readFile(this.record as string, 'utf-8')
      this.recordings = JSON.parse(file)
    }
  }

  private async afterAction() {
    if (this.record) {
      const filePath = this.record as string
      await mkdir(dirname(filePath), { recursive: true })
      await writeFile(filePath, JSON.stringify(this.recordings, null, 2))
    }
    this.step++
  }
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
  public async say(
    input: string,
    options: SayOptions = { withoutRecordings: false }
  ): Promise<boolean | string | void | null> {
    if (this.step === 0) {
      await this.beforeAction()
    }
    this.lastInput = input

    const matched = this.recordings.find((rec, index) => rec.input === input && index === this.step)
    let result: boolean | string | void | null = undefined

    this.recordings[this.step] = { input, actions: [] }

    if (this.record && !options.withoutRecordings && matched) {
      for (const { name, params } of matched.actions) {
        const res = await actions[name as keyof typeof actions](this, params)
        result = result !== false && res === false ? false : res
        await setTimeout(500)
      }
    } else {
      const { messages } = await actionGraph.invoke(
        {
          messages: [new HumanMessage(input)]
        },
        {
          configurable: { ref: this, thread_id: this.threadId }
        }
      )
      const message = (messages[messages.length - 1] as AIMessage).content.toString()
      result = ['true', 'false'].includes(message) ? message === 'true' : message
    }

    await this.afterAction()

    return result
  }
}
