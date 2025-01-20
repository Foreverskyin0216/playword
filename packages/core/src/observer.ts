import type { Action, ObserverEvent, ObserverOptions, ObserverState, PlayWordInterface } from './types'

import { HumanMessage } from '@langchain/core/messages'
import { setTimeout } from 'timers/promises'
import * as actions from './actions'
import { Recorder } from './recorder'
import * as tools from './tools'
import * as utils from './utils'

/**
 * PlayWord Observer enables tracking and recording user interactions on a webpage.
 *
 * By leveraging AI, the Observer converts user behaviors into precise and reliable
 * test cases, making it an essential tool for automated testing of web applications.
 *
 * **Features:**
 * - Observes user interactions and translates them into executable test cases.
 * - Mounts a user interface on all opened pages using Playwright's `addInitScript` method,
 *   allowing seamless interaction with the Observer.
 * - Integrates with PlayWord for executing the recorded test cases.
 *
 * **Usage:**
 * This class works in conjunction with the PlayWord framework. The recorded test cases
 * can be directly executed via the provided PlayWord instance.
 *
 * @param playword The PlayWord instance used to control the browser and leverage AI.
 * @param observerOptions Optional configuration for the Observer. See {@link ObserverOptions} for details.
 *
 * @example
 * **Initialize and Use the Observer**
 * ```ts
 * // Initialize a PlayWord instance
 * const playword = new PlayWord(context)
 *
 * // Create an Observer instance and start observing
 * const observer = new Observer(playword, { delay: 500 })
 * await observer.observe()
 * ```
 */
export class Observer {
  /**
   * Represents the current page action being performed. See {@link Action} for details.
   */
  private action: Action = { name: '', params: {} }

  /**
   * The delay in milliseconds to wait before executing each action during a dry run.
   *
   * This introduces a pause between consecutive actions, allowing time for
   * the page to load and render properly.
   *
   * @default 250
   */
  private delay: number

  /**
   * The step description for the current action.
   */
  private input = ''

  /**
   * The `p-queue` instance for managing tasks for generating step descriptions.
   */
  private queue: import('p-queue').default | undefined

  /**
   * The recorder instance used to save the actions performed.
   */
  private recorder: Recorder

  /**
   * The current state of the Observer. See {@link ObserverState} for details.
   */
  private state: ObserverState = { isDryRunning: false, isWaitingForAI: false, isWaitingForUserAction: false }

  constructor(
    private playword: PlayWordInterface,
    observerOptions: ObserverOptions = {}
  ) {
    const { delay = 250, recordPath = '.playword/recordings.json' } = observerOptions

    this.delay = Math.abs(delay)

    this.recorder = new Recorder(recordPath)

    this.playword.recorder = undefined
  }

  /**
   * Retrieves the AI instance from the PlayWord instance.
   */
  private ai() {
    return this.playword.ai
  }

  /**
   * Retrieves the current context from the PlayWord instance.
   */
  private context() {
    return this.playword.context
  }

  /**
   * Retrieves the current page from the PlayWord instance.
   */
  private page() {
    return this.playword.page!
  }

  /**
   * Set up the Observer scripts and listeners on the page.
   */
  private async setPageListeners() {
    /**
     * Accepts the generated action and saves it to the recorder.
     */
    const acceptEvent = async () => {
      await generateEvent()
      this.recorder.initStep(this.recorder.count(), this.input)
      this.recorder.addAction(this.action)
      this.recorder.save(['html', 'success'])

      this.action = { name: '', params: {} }
      this.input = ''
      this.state.isWaitingForUserAction = false
    }

    /**
     * Cleans up the page by clearing cookies and closing all pages.
     */
    const cleanUp = async () => {
      const context = this.context()
      await Promise.all([context.clearCookies(), setTimeout(2000)])
      await Promise.all(context.pages().map((page) => page.close()))
      await context.newPage()
    }

    /**
     * Clears all the recorded actions and resets the UI.
     */
    const clearAll = async () => {
      dropEvent()
      this.recorder.clear()
      await Promise.all([notify('Cleared', '✓', '#e0e0e0'), setTimeout(2000)])
      await Promise.all([
        locate('#plwd-timeline').evaluate(utils.setTestCasePreview, []),
        locate('#plwd-preview-title').evaluate(utils.removeClass, 'open'),
        locate('#plwd-clear-btn').evaluate(utils.removeClass, 'open'),
        locate('#plwd-dry-run-btn').evaluate(utils.removeClass, 'open')
      ])
    }

    /**
     * Closes the Observer UI.
     */
    const closePanel = async () => {
      await Promise.all([
        locate('#plwd-preview-title').evaluate(utils.removeClass, 'open'),
        locate('#plwd-clear-btn').evaluate(utils.removeClass, 'open'),
        locate('#plwd-dry-run-btn').evaluate(utils.removeClass, 'open'),
        locate('#plwd-panel').evaluate(utils.removeClass, 'open')
      ])
    }

    /**
     * Cancels the current action.
     */
    const dropEvent = async () => {
      this.action = { name: '', params: {} }
      this.input = ''
      this.state.isWaitingForUserAction = false
    }

    /**
     * Performs a dry run of the recorded actions.
     *
     * You can press the **Esc** key to stop the execution during a dry run.
     */
    const dryRun = async () => {
      utils.divider()
      utils.info('Starting the dry run process...', 'green')

      this.state = { ...this.state, isDryRunning: true, isWaitingForUserAction: false }

      await cleanUp()
      utils.info('Reset the page', 'green')

      for (const recording of this.recorder.list()) {
        const action = recording.actions[0]
        const result = await actions[action.name as keyof typeof actions](this.playword, action.params)
        action.success = Boolean(result === 'Failed to perform the action' ? false : result)
        utils.info((action.success ? 'PASS: ' : 'FAIL: ') + recording.input)

        await setTimeout(this.delay)
      }

      this.state.isDryRunning = false

      utils.info('Dry run completed', 'green')
      await notify('Completed', '🚀', '#e5c07b')
    }

    /**
     * Before accepting the event, leverage AI to adjust the action to match the user's intent.
     */
    const generateEvent = async () => {
      await waitForAI(true)

      const { tool_calls } = await this.ai().useTools(tools.classifier, [new HumanMessage(this.input)])
      if (!tool_calls || !tool_calls.length) {
        return waitForAI(false)
      }

      const tool = tools.classifier.find((tool) => tool.name === tool_calls[0].name)
      if (!tool) {
        return waitForAI(false)
      }

      const { content } = await tool.invoke(tool_calls[0], { configurable: { action: this.action } })
      if (!content) {
        return waitForAI(false)
      }

      this.action = JSON.parse(content)
      utils.divider()
      utils.info('Input: ' + this.input + '\nAction: ' + JSON.stringify(this.action, null, 2), 'green')

      return waitForAI(false)
    }

    /**
     * Generates the step description for the current action via AI.
     *
     * @param event The emitted event to generate the step description. See {@link ObserverEvent} for details.
     */
    const generateInput = async (event: ObserverEvent) => {
      await waitForAI(true)

      switch (event.name) {
        case 'goto': {
          updateInput('Navigate to ' + event.params.url)
          break
        }

        case 'click': {
          const phrase = await this.ai().summarizeHTML(event.params.html)
          updateInput('Click on ' + phrase)
          break
        }

        case 'hover': {
          const phrase = await this.ai().summarizeHTML(event.params.html)
          updateInput('Hover over ' + phrase)
          break
        }

        case 'input': {
          const phrase = await this.ai().summarizeHTML(event.params.html)
          updateInput('Input "' + event.params.text + '" into ' + phrase)
          break
        }

        case 'select': {
          const phrase = await this.ai().summarizeHTML(event.params.html)
          updateInput('Select "' + event.params.option + '" from ' + phrase)
          break
        }
      }

      await Promise.all([setInputValue(), waitForAI(false)])
    }

    /**
     * The exposed function to retrieve the current state of the Observer.
     *
     * @returns The current state of the Observer. See {@link ObserverState} for details.
     */
    const getState = () => {
      return this.state
    }

    /**
     * Receives and processes the emitted events from the browser.
     *
     * @param event The emitted event. See {@link ObserverEvent} for details.
     */
    const handleEmits = async (event: ObserverEvent) => {
      const { isDryRunning, isWaitingForAI, isWaitingForUserAction } = this.state
      if (isDryRunning || isWaitingForAI || isWaitingForUserAction || !this.page()) return

      this.action = event
      this.state.isWaitingForUserAction = true

      await setTimeout(500)

      this.queue?.add(async () => await generateInput(event))

      while (this.state.isWaitingForUserAction) {
        if (!(await isPanelOpened())) {
          await Promise.all([openPanel(), preview(), setInputValue()])
        }
        await setTimeout(200)
      }

      await closePanel()
    }

    /**
     * Checks if the Observer UI is opened.
     */
    const isPanelOpened = async () => {
      return locate('#plwd-panel').evaluate(utils.hasClass, 'open')
    }

    /**
     * Locates the element on the page using the provided selector.
     *
     * @param selector The selector to locate the element.
     * @returns The Playwright locator for the element.
     */
    const locate = (selector: string) => {
      return this.page().locator(selector).first()
    }

    /**
     * Displays a toast notification with the specified message, icon, and color.
     *
     * @param content The message content to display in the notification.
     * @param icon The icon to display in the notification.
     * @param color The text color for the notification. Accepts color names or HEX values (e.g., `#ffffff`).
     */
    const notify = async (content: string, icon: string, color: string) => {
      await this.page().evaluate(utils.showMessage, { content, icon, color })
    }

    /**
     * Opens the Observer UI panel.
     */
    const openPanel = async () => {
      await locate('#plwd-panel').evaluate(utils.addClass, 'open')
    }

    /**
     * Preview the recorded test steps in the PlayWord panel.
     */
    const preview = async () => {
      if (this.recorder.count() === 0) return
      await Promise.all([
        locate('#plwd-timeline').evaluate(utils.setTestCasePreview, this.recorder.list()),
        locate('#plwd-preview-title').evaluate(utils.addClass, 'open'),
        locate('#plwd-clear-btn').evaluate(utils.addClass, 'open'),
        locate('#plwd-dry-run-btn').evaluate(utils.addClass, 'open')
      ])
    }

    /**
     * Sets the value of the input element in the Observer UI.
     */
    const setInputValue = async () => {
      await locate('#plwd-input').evaluate(utils.setAttribute, { name: 'value', value: this.input })
    }

    /**
     * Updates the input value in the Observer.
     *
     * @param text The new value to set for the input.
     */
    const updateInput = (text: string) => {
      this.input = text
    }

    /**
     * Enables or disables the loader element in the Observer UI.
     *
     * @param on `true` to enable the loader, `false` to disable it.
     */
    const waitForAI = async (on: boolean) => {
      await Promise.all([
        locate('#plwd-input').evaluate(utils.setAttribute, { name: 'disabled', value: on }),
        locate('#plwd-loader-box').evaluate(utils.toggleLoader, on)
      ])
      this.state.isWaitingForAI = on
    }

    /**
     * Set up the page listeners to observe the navigation events.
     */
    this.page().on('framenavigated', (frame) => {
      const mainFrameUrl = this.page().mainFrame().url()
      const frameUrl = frame.url()

      if (frameUrl === 'about:blank' || frameUrl !== mainFrameUrl) {
        return
      }

      return handleEmits({ name: 'goto', params: { url: frameUrl } })
    })

    await Promise.all([
      this.page().addInitScript(utils.setEventListeners),
      this.page().addInitScript(utils.setPanel, utils.observerCSS)
    ])

    await Promise.all([
      this.page().exposeFunction('acceptEvent', acceptEvent),
      this.page().exposeFunction('clearAll', clearAll),
      this.page().exposeFunction('dropEvent', dropEvent),
      this.page().exposeFunction('dryRun', dryRun),
      this.page().exposeFunction('emit', handleEmits),
      this.page().exposeFunction('notify', notify),
      this.page().exposeFunction('state', getState),
      this.page().exposeFunction('updateInput', updateInput)
    ])
  }

  /**
   * Starts observing the user interactions on the page.
   *
   * During the observation, the page instance will be automatically reloaded.
   */
  public async observe() {
    if (!this.queue) this.queue = new (await import('p-queue')).default({ concurrency: 1 })
    this.context().on('page', async () => await this.setPageListeners())
    await this.recorder.load()
  }
}
