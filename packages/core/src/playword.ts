import type { AIMessage } from '@langchain/core/messages'
import type { Page } from 'playwright-core'

import { randomUUID } from 'crypto'
import { access, mkdir, readFile, writeFile } from 'fs/promises'
import { dirname } from 'path'
import { HumanMessage } from '@langchain/core/messages'

import { actionGraph } from './graph'
import * as actions from './actions'
import { AI } from './ai'
import { divider, info, startLog } from './utils'
import { aiPattern } from './validators'

/**
 * Decorator to handle the test fixture, including the setup process and teardown process.
 *
 * Setup:
 * - Read the recordings from the record file.
 *
 * Teardown:
 * - Write the recordings to the record file.
 * - Increment the step count.
 */
const fixture = (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) => {
  const originalMethod = descriptor.value

  const checkPath = async (path: string) => {
    try {
      await access(path)
      return path.endsWith('.json')
    } catch {
      return false
    }
  }

  descriptor.value = async function (...args: unknown[]) {
    const playword = this as PlayWord

    if (playword.step === 0) {
      const filePath = playword.record as string
      if (playword.record && (await checkPath(filePath))) {
        const file = await readFile(filePath, 'utf-8')
        playword.recordings = JSON.parse(file)
      }
    }

    if (playword.debug) divider()

    playword.input = (args[0] as string).replace(aiPattern, '').trim()

    const result = await originalMethod.apply(playword, args)

    playword.step++
    playword.logger = undefined

    if (playword.record) {
      const filePath = playword.record as string
      await mkdir(dirname(filePath), { recursive: true })
      await writeFile(filePath, JSON.stringify(playword.recordings.slice(0, playword.step), null, 2))
    }

    return result
  }
}

/**
 * @class ### PlayWord
 *
 * PlayWord includes the following features:
 * - Perform actions on the browser page with natural language input.
 * - Record the actions performed to replay them later without token consumption.
 * @param page The PlayWright page. See {@link Page}.
 * @param playwordOptions Optional. See {@link PlayWordOptions}.
 */
export class PlayWord implements PlayWordInterface {
  /**
   * LangGraph requires a unique thread id to keep track of the conversation.
   */
  private threadId: string = randomUUID()

  public ai: AI
  public elements = []
  public frame = undefined
  public step = 0
  public input = ''
  public snapshot = ''
  public recordings = [] as Recording[]
  public logger: Awaited<ReturnType<typeof startLog>> | undefined
  public debug
  public page
  public record
  public retryOnFailure
  public useScreenshot

  constructor(page: Page, playwordOptions: PlayWordOptions = {}) {
    const { debug, openAIOptions, record, retryOnFailure, useScreenshot } = playwordOptions
    this.ai = new AI(openAIOptions || {})
    this.debug = debug || false
    this.page = page
    this.record = record === true ? '.playword/recordings.json' : record
    this.retryOnFailure = retryOnFailure || false
    this.useScreenshot = useScreenshot || false
    this.say = this.say.bind(this)
  }

  /**
   * Use AI to perform the action.
   *
   * @returns The last action result.
   */
  private async invokeAI() {
    let result: ActionResult

    if (this.debug) {
      info('[AI] ' + this.input, 'green')
      this.logger = await startLog('Invoking the action graph...')
    }
    if (this.record) this.recordings[this.step] = { input: this.input, actions: [] }

    const { messages } = await actionGraph.invoke(
      {
        messages: [new HumanMessage(this.input)]
      },
      {
        configurable: { ref: this, thread_id: this.threadId, use_screenshot: this.useScreenshot }
      }
    )

    result = (messages as AIMessage[])[messages.length - 1].content.toString()
    result = ['true', 'false'].includes(result) ? result === 'true' : result

    if (this.logger) {
      if (result) this.logger.success()
      else this.logger.error()
    }

    return result
  }

  /**
   * Use the recordings to perform the action. If the action fails, retry with AI.
   *
   * @param recordings The recordings to perform.
   * @returns The last action result.
   */
  private async invokeRecordings(recordings: Recording) {
    try {
      let result: ActionResult

      if (this.debug) info(`[RECORDING] ${this.input}`, 'green')

      for (const { name, params } of recordings.actions) {
        result = await actions[name as keyof typeof actions](this, params)

        if (this.debug) info(result)

        if (result === 'No element found' && this.retryOnFailure) {
          info('Retrying with AI...', 'magenta')
          return await this.invokeAI()
        }
      }

      return result
    } catch (error) {
      if (this.retryOnFailure) {
        info(error.message, 'red')
        info('Retrying with AI...', 'magenta')
        return await this.invokeAI()
      }
      throw error
    }
  }

  @fixture
  public async say(input: string) {
    const matched = this.recordings.find((rec, index) => rec.input === this.input && index === this.step)
    let result: ActionResult

    if (this.record && !aiPattern.test(input) && matched) {
      result = await this.invokeRecordings(matched)
    } else {
      result = await this.invokeAI()
    }

    return result
  }
}
