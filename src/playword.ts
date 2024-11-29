import type { AIMessage } from '@langchain/core/messages'
import type { Page } from 'playwright'
import type { ActionResult, PlayWordInterface, PlayWordOptions, Recording, SayOptions } from './types'

import { access, mkdir, readFile, writeFile } from 'fs/promises'
import { dirname } from 'path'
import { HumanMessage } from '@langchain/core/messages'
import { v4 as uuidv4 } from 'uuid'

import { actionGraph } from './actionGraph'
import * as actions from './actions'
import { divider, info } from './logger'

/**
 * Decorator to handle the test fixture, including the setup process and teardown process.
 *
 * Setup:
 * - Read the recordings from the record file.
 * - Increment the step.
 *
 * Teardown:
 * - Write the recordings to the record file.
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

    if (playword.debug) {
      divider()
      info(`Step ${playword.step + 1}: ${args[0]}`)
    }

    playword.input = args[0] as string

    const result = await originalMethod.apply(playword, args)

    playword.step++

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

  public frame = undefined
  public store = undefined
  public step = 0
  public input = ''
  public snapshot = ''
  public recordings = [] as Recording[]
  public debug
  public openAIOptions
  public page
  public record
  public retryOnFailure
  public useScreenshot

  constructor(page: Page, playwordOptions: PlayWordOptions = {}) {
    this.debug = playwordOptions.debug || false
    this.openAIOptions = playwordOptions.openAIOptions || {}
    this.page = page
    this.record = playwordOptions.record === true ? '.playword/recordings.json' : playwordOptions.record
    this.retryOnFailure = playwordOptions.retryOnFailure || false
    this.useScreenshot = playwordOptions.useScreenshot || false
    this.say = this.say.bind(this)
  }

  private async invokeAI() {
    let result: ActionResult

    const { messages } = (await actionGraph.invoke(
      {
        messages: [new HumanMessage(this.input)]
      },
      {
        configurable: { ref: this, thread_id: this.threadId, use_screenshot: this.useScreenshot }
      }
    )) as { messages: AIMessage[] }

    result = messages[messages.length - 1].content.toString()
    result = ['true', 'false'].includes(result) ? result === 'true' : result

    return result
  }

  private async invokeRecordings(recordings: Recording) {
    try {
      let result: ActionResult

      for (const { name, params } of recordings.actions) {
        result = await actions[name as keyof typeof actions](this, params)

        if (this.debug) info(result)

        if (result === 'No element found' && this.retryOnFailure) {
          info('Retrying with AI...')
          this.recordings[this.step].actions.pop()
          return await this.invokeAI()
        }
      }

      return result
    } catch (error) {
      if (this.retryOnFailure) {
        info('Retrying with AI...')
        return await this.invokeAI()
      }
      throw error
    }
  }

  @fixture
  public async say(input: string, options: SayOptions = {}) {
    const matched = this.recordings.find((rec, index) => rec.input === input && index === this.step)
    let result: ActionResult

    this.recordings[this.step] = { actions: [], input }

    if (this.record && !options.withoutRecordings && matched) {
      result = await this.invokeRecordings(matched)
    } else {
      result = await this.invokeAI()
    }

    return result
  }
}
