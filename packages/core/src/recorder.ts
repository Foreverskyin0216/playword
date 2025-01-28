import type { Action, Recording } from './types'

import { access, mkdir, readFile, writeFile } from 'fs/promises'
import { dirname } from 'path'

/**
 * The Recorder class manages the recordings created during interactions with
 * PlayWord and PlayWord Observer. It provides functionality to store, retrieve,
 * and manipulate recordings, allowing users to save test cases for replay or review.
 */
export class Recorder {
  /**
   * The current position in the list of recordings.
   *
   * This indicates the index of the recording currently being operated on.
   */
  private position = 0

  /**
   * The list of recordings being managed.
   *
   * Each recording contains a set of actions and metadata. See {@link Recording} for the structure.
   */
  private recordings: Recording[] = []

  constructor(private recordPath = '') {}

  /**
   * Checks if the recording file exists and verifies that it is a JSON file.
   *
   * @param path The path to the recording file.
   */
  private check = async (path: string) => {
    try {
      await access(path)
      return path.endsWith('.json')
    } catch {
      return false
    }
  }

  /**
   * Recursively removes a specified property from the recordings.
   *
   * @param recordings The target recordings.
   * @param prop The property to remove.
   */
  private removeProperty = (recordings: Recording[] | Recording, prop: string) => {
    if (!recordings || typeof recordings !== 'object') {
      return
    }

    if (Array.isArray(recordings)) {
      return recordings.forEach((recording) => this.removeProperty(recording, prop))
    }

    for (const key of Object.keys(recordings)) {
      if (key === prop) {
        delete (recordings as unknown as Record<string, Recording>)[key]
      } else {
        this.removeProperty((recordings as unknown as Record<string, Recording>)[key], prop)
      }
    }
  }

  /**
   * Appends an action to the current recording.
   *
   * @param action The action to append.
   */
  public addAction(action: Action) {
    this.recordings[this.position].actions.push(action)
  }

  /**
   * Clears all recordings and resets the position.
   */
  public clear() {
    this.recordings = []
    this.position = 0
  }

  /**
   * Retrieves the count of recordings.
   */
  public count() {
    return this.recordings.length
  }

  /**
   * Deletes the recording at the specified position.
   *
   * If the position is out of bounds, this method does nothing.
   *
   * @param position The position in the recordings list to delete.
   */
  public delete(position: number) {
    if (position < 0 || position >= this.recordings.length) {
      return
    }

    this.recordings.splice(position, 1)

    if (this.position >= position) {
      this.position--
    }

    if (this.position < 0) {
      this.position = 0
    }
  }

  /**
   * Initializes a new recording step at the specified position.
   *
   * @param position The position in the recordings list to initialize.
   * @param input The input of the recording step.
   */
  public initStep(position: number, input: string) {
    this.position = position
    this.recordings[position] = { input, actions: [] }
  }

  /**
   * Lists all recordings.
   */
  public list() {
    return this.recordings
  }

  /**
   * Loads recordings from the file path.
   */
  public async load() {
    if (!(await this.check(this.recordPath))) {
      return
    }
    this.recordings = JSON.parse(await readFile(this.recordPath, 'utf-8'))
  }

  /**
   * Saves the current recordings to the file path.
   *
   * @param excluded The properties to exclude from the recordings before saving.
   */
  public async save(excluded: string[] = []) {
    const recordings = structuredClone(this.recordings.slice(0, this.position + 1))

    for (const prop of excluded) {
      this.removeProperty(recordings, prop)
    }

    await mkdir(dirname(this.recordPath), { recursive: true })
    await writeFile(this.recordPath, JSON.stringify(recordings, null, 2))
  }
}
