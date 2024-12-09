import type { ClientOptions } from 'openai'

export interface Action {
  /**
   * The predefined action name.
   */
  name: string
  /**
   * The parameters to pass to the action.
   */
  params: ActionParams
}

/**
 * All types of parameters for the actions.
 */
export interface ActionParams {
  attribute?: string
  direction?: 'up' | 'down' | 'top' | 'bottom'
  duration?: number
  frameNumber?: number
  keys?: string
  option?: string
  order?: number
  pattern?: string
  text?: string
  url?: string
  xpath?: string
}

export interface Recording {
  /**
   * The input message to map actions performed.
   */
  input: string
  /**
   * The actions performed in one step.
   */
  actions: Action[]
}

/**
 * Options for the Test command.
 */
export interface TestOptions {
  browser: string
  envFile: string
  headed: boolean
  openaiOptions: ClientOptions
  record: string | boolean
  playback: boolean
  useScreenshot: boolean
  verbose: boolean
}
