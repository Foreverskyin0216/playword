import type { Action, ObserverAction, ObserverOptions, ObserverState, PlayWordInterface } from './types'

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
   * The recorder instance used to save the actions performed.
   */
  private recorder: Recorder

  /**
   * The current state of the Observer. See {@link ObserverState} for details.
   */
  public state: ObserverState = { dryRunning: false, waitingForAI: false, waitingForUserAction: false }

  constructor(
    private playword: PlayWordInterface,
    { delay = 250, recordPath = '.playword/recordings.json' }: ObserverOptions = {}
  ) {
    this.delay = Math.abs(delay)

    this.recorder = new Recorder(recordPath)
    this.playword.recorder = undefined

    this.observe = this.observe.bind(this)
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
    const accept = async () => {
      if (this.state.waitingForAI) return

      await Promise.all([generateAction(), notify('Accepted', '✓', '#4db6ac')])

      this.recorder.initStep(this.recorder.count(), this.input)
      this.recorder.addAction(this.action)
      await this.recorder.save(['html', 'success'])

      this.state.waitingForUserAction = false
    }

    /**
     * Cancels the current action.
     */
    const cancel = async () => {
      if (this.state.waitingForAI) {
        return
      }
      this.state.waitingForUserAction = false
    }

    /**
     * Clears all the recorded actions and resets the UI.
     */
    const clearAll = async () => {
      this.recorder.clear()
      await Promise.all([this.recorder.save(), preview()])
    }

    /**
     * Closes the Observer UI.
     */
    const closePanel = async () => {
      await Promise.all([
        locate('.plwd-preview-title').evaluate(utils.removeClass, 'open'),
        locate('.plwd-clear-btn').evaluate(utils.removeClass, 'open'),
        locate('.plwd-dry-run-btn').evaluate(utils.removeClass, 'open'),
        locate('.plwd-panel').evaluate(utils.removeClass, 'open')
      ])
    }

    /**
     * Deletes the specified step from the recorded actions.
     *
     * @param position The position of the step to delete.
     */
    const deleteStep = async (position: number) => {
      this.recorder.delete(position)
      await Promise.all([this.recorder.save(['html', 'success']), preview()])
    }

    /**
     * Describes the emitted action to generate the step description.
     *
     * @param action The emitted action to generate the step description. See {@link ObserverAction} for details.
     */
    const describeAction = async (action: ObserverAction) => {
      updateInput('')
      await Promise.all([setInputValue(), waitForAI(true)])

      const summary = await this.ai().summarizeAction(JSON.stringify(action))
      updateInput(summary)

      await Promise.all([setInputValue(), waitForAI(false)])
    }

    /**
     * Performs a dry run of the recorded actions.
     *
     * You can press the **Esc** key to stop the execution during a dry run.
     */
    const dryRun = async () => {
      utils.info('Starting the dry run process...', 'green', true)
      this.state.dryRunning = true
      this.state.waitingForUserAction = false

      await Promise.all([notify('Dry Run', '🚀', '#e5c07b'), resetPageState()])

      for (const recording of this.recorder.list()) {
        if (this.state.dryRunning) {
          const action = recording.actions[0]
          const result = await actions[action.name as keyof typeof actions](this.playword, action.params)
          action.success = Boolean(result === 'Failed to perform the action' ? false : result)

          utils.info((action.success ? 'PASS: ' : 'FAIL: ') + recording.input)
          await setTimeout(this.delay)
        }
      }

      await notify('Completed', '🚀', '#e5c07b')

      this.state.dryRunning = false
      utils.info('Dry Run Completed')
    }

    /**
     * Before accepting the action, leverage AI to adjust the action to match the user's intent.
     */
    const generateAction = async () => {
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
      utils.info('Input: ' + this.input + '\nAction: ' + JSON.stringify(this.action, null, 2), 'green', true)

      return waitForAI(false)
    }

    /**
     * Receives and processes the emitted actions from the browser.
     *
     * @param action The emitted action. See {@link ObserverAction} for details.
     */
    const handleEmit = async (action: ObserverAction) => {
      if (this.state.dryRunning || this.state.waitingForAI || this.state.waitingForUserAction) {
        return
      }

      this.action = action
      this.state.waitingForUserAction = true

      await setTimeout(500)
      describeAction(action)

      while (this.state.waitingForUserAction) {
        const opened = await isPanelOpened()

        if (!opened) {
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
      return locate('.plwd-panel').evaluate(utils.hasClass, 'open')
    }

    /**
     * Locates the element on the page using the provided selector.
     *
     * @param selector The selector to locate the element.
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
      await locate('.plwd-panel').evaluate(utils.addClass, 'open')
    }

    /**
     * Preview the recorded test steps in the PlayWord panel.
     */
    const preview = async () => {
      if (this.recorder.count() > 0) {
        await Promise.all([
          locate('.plwd-preview-title').evaluate(utils.addClass, 'open'),
          locate('.plwd-clear-btn').evaluate(utils.addClass, 'open'),
          locate('.plwd-dry-run-btn').evaluate(utils.addClass, 'open')
        ])
      }
      await locate('.plwd-timeline').evaluate(utils.setTestCasePreview, this.recorder.list())
    }

    /**
     * Resets the page and clears all the caches, cookies, storages, and workers.
     *
     * After cleaning up, it closes all the pages and opens a new one.
     */
    const resetPageState = async () => {
      /**
       * Clears all the caches.
       */
      const clearCaches = () => this.page().evaluate(utils.clearCaches)

      /**
       * Clears all the cookies.
       */
      const clearCookies = () => this.context().clearCookies()

      /**
       * Clears all the IndexedDB databases.
       */
      const clearIndexedDB = () => this.page().evaluate(utils.clearIndexedDB)

      /**
       * Clears the local and session storages.
       */
      const clearStorage = () => this.page().evaluate(utils.clearStorage)

      /**
       * Clears all the service workers.
       */
      const clearServiceWorkers = () => this.page().evaluate(utils.clearServiceWorkers)

      await Promise.all([clearCaches(), clearCookies(), clearIndexedDB(), clearServiceWorkers(), clearStorage()])
      await setTimeout(2000)

      for (const page of this.context().pages()) {
        await page.close()
      }
      await this.context().newPage()
    }

    /**
     * Sets the value of the input element in the Observer UI.
     */
    const setInputValue = async () => {
      await locate('.plwd-input').evaluate(utils.setAttribute, { name: 'value', value: this.input })
    }

    const stopDryRun = () => {
      this.state.dryRunning = false
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
        locate('.plwd-input').evaluate(utils.setAttribute, { name: 'disabled', value: on }),
        locate('.plwd-loader-box').evaluate(utils.toggleLoader, on)
      ])
      this.state.waitingForAI = on
    }

    /**
     * Set up the page listeners to observe the navigation actions.
     */
    this.page().on('framenavigated', (frame) => {
      const frameUrl = frame.url()

      if (frameUrl === 'about:blank' || frameUrl !== this.page().mainFrame().url()) {
        return
      }

      return handleEmit({ name: 'goto', params: { url: frameUrl } })
    })

    await Promise.all([
      this.page().addInitScript(utils.setEventListeners),
      this.page().addInitScript(utils.setPanel, utils.observerCSS)
    ])

    await Promise.all([
      this.page().exposeFunction('accept', accept),
      this.page().exposeFunction('cancel', cancel),
      this.page().exposeFunction('clearAll', clearAll),
      this.page().exposeFunction('deleteStep', deleteStep),
      this.page().exposeFunction('dryRun', dryRun),
      this.page().exposeFunction('emit', handleEmit),
      this.page().exposeFunction('notify', notify),
      this.page().exposeFunction('stopDryRun', stopDryRun),
      this.page().exposeFunction('updateInput', updateInput)
    ])
  }

  /**
   * Starts observing the user interactions on the page.
   */
  public async observe() {
    this.context().on('page', async () => {
      await this.setPageListeners()
      await this.page().reload()
    })
    await this.recorder.load()
  }
}
