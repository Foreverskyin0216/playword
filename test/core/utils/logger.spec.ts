import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as utils from '../../../packages/core/src/utils'

const { mockConsoleLog } = vi.hoisted(() => ({
  mockConsoleLog: vi.spyOn(console, 'log').mockImplementation(() => {}),
  mockStderr: vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
}))

describe('Spec: Logger', () => {
  describe('When the divider function is called', () => {
    beforeEach(() => (process.env.PLWD_DEBUG = 'true'))

    afterEach(() => mockConsoleLog.mockClear())

    test('Then it should print a divider line', () => {
      utils.divider()
      expect(mockConsoleLog).toBeCalledWith('-'.repeat(process.stdout.columns))
    })

    test('Then it should not print a divider line when turning off the debug mode', () => {
      process.env.PLWD_DEBUG = 'false'
      utils.divider()
      expect(mockConsoleLog).not.toBeCalled()
    })
  })

  describe('When the info function is called', () => {
    beforeEach(() => (process.env.PLWD_DEBUG = 'true'))

    afterEach(() => mockConsoleLog.mockClear())

    test('Then it should print an info message', () => {
      utils.info('message')
      expect(mockConsoleLog).toBeCalledWith('message')
    })

    test('Then is should print an info message with green color', () => {
      utils.info('message', 'green')
      expect(mockConsoleLog).toBeCalledWith('\x1b[32mmessage\x1b[0m')
    })

    test('Then it should print an info message with magenta color', () => {
      utils.info('message', 'magenta')
      expect(mockConsoleLog).toBeCalledWith('\x1b[35mmessage\x1b[0m')
    })

    test('Then it should not print an info message when turning off the debug mode', () => {
      process.env.PLWD_DEBUG = 'false'
      utils.info('message')
      expect(mockConsoleLog).not.toBeCalled()
    })
  })
})
