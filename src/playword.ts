import type { AIMessage } from '@langchain/core/messages'
import type { Page } from 'playwright'
import type { ActionResult, PlayWordInterface, PlayWordOptions, Recording, SayOptions } from './types'

import { access, mkdir, readFile, writeFile } from 'fs/promises'
import { dirname } from 'path'
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
export class PlayWord implements PlayWordInterface {
  /**
   * LangGraph requires a unique thread id to keep track of the conversation.
   */
  private threadId: string = uuidv4()

  public debug
  public frame = undefined
  public input = ''
  public openAIOptions
  public page
  public record
  public recordings = [] as Recording[]
  public snapshot = ''
  public step = 0
  public store = undefined
  public useScreenshot

  constructor(page: Page, playwordOptions: PlayWordOptions = {}) {
    this.debug = playwordOptions.debug || false
    this.openAIOptions = playwordOptions.openAIOptions || {}
    this.page = page
    this.record = playwordOptions.record === true ? '.playword/recordings.json' : playwordOptions.record
    this.useScreenshot = playwordOptions.useScreenshot || false
    this.say = this.say.bind(this)
  }

  /**
   * Check if the path exists and is a JSON file.
   */
  private async checkPath(path: string) {
    try {
      await access(path)
      return path.endsWith('.json')
    } catch {
      return false
    }
  }

  /**
   * Perform one-time setup before any actions are performed.
   */
  private async beforeAll() {
    const filePath = this.record as string
    if (this.record && (await this.checkPath(filePath))) {
      this.recordings = JSON.parse(await readFile(filePath, 'utf-8'))
    }
  }

  /**
   * Perform the teardown after each action is performed.
   */
  private async afterEach() {
    if (this.record) {
      const filePath = this.record as string
      await mkdir(dirname(filePath), { recursive: true })
      await writeFile(filePath, JSON.stringify(this.recordings.slice(0, this.step + 1), null, 2))
    }
    this.step++
  }

  public async say(input: string, options: SayOptions = {}) {
    if (this.step === 0) {
      await this.beforeAll()
    }
    this.input = input

    const matched = this.recordings.find((rec, index) => rec.input === input && index === this.step)
    let result: ActionResult

    this.recordings[this.step] = { input, actions: [] }

    if (this.record && !options.withoutRecordings && matched) {
      for (const { name, params } of matched.actions) {
        result = await actions[name as keyof typeof actions](this, params)
      }
    } else {
      const { messages } = (await actionGraph.invoke(
        {
          messages: [new HumanMessage(input)]
        },
        {
          configurable: {
            ref: this,
            thread_id: this.threadId,
            use_screenshot: this.useScreenshot && !options.withoutScreenshot
          }
        }
      )) as { messages: AIMessage[] }

      const message = messages[messages.length - 1].content.toString()
      result = ['true', 'false'].includes(message) ? message === 'true' : message
    }

    if (this.debug) {
      console.log('\x1b[35m [DEBUG] \x1b[0m', '\x1b[32m ' + result + ' \x1b[0m')
    }

    await this.afterEach()

    return result
  }
}
