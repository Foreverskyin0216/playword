import type { ActionParams, PlayWordInterface } from '../types'
import { setTimeout } from 'timers/promises'

/**
 * Wait for the frame to load.
 *
 * @param ref The PlayWord instance.
 * @param frameSrc The source of the frame to wait for.
 * @param timeout The timeout in milliseconds. Default is 30 seconds.
 */
const waitForFrame = async (ref: PlayWordInterface, frameSrc: string, timeout = 30000) => {
  const start = Date.now()
  let isFound = false

  while (!isFound && Date.now() - start < timeout) {
    isFound = Boolean(ref.page?.frames().some((f) => f.url() === frameSrc))
    await setTimeout(500)
  }

  return isFound
}

/**
 * Get the handle used to interact with the page or frame.
 *
 * If the frame source is provided, wait for the frame to load and get the handle of the frame.
 * If the frame source is not provided, get the handle of the page.
 *
 * @param ref The PlayWord instance.
 * @param params The parameters for the action.
 */
export const getHandle = async (ref: PlayWordInterface, params: Partial<ActionParams> = {}) => {
  if (params.frameSrc && (await waitForFrame(ref, params.frameSrc))) {
    const frame = ref.page?.frames().find((frame) => frame.url() === params.frameSrc)
    ref.frame = frame
  }

  const handle = ref.frame || ref.page!
  await handle.waitForLoadState('domcontentloaded')

  return handle
}
