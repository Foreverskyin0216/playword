import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as utils from '../../../packages/core/src/utils'

const { mockConsoleLog } = vi.hoisted(() => ({ mockConsoleLog: vi.spyOn(console, 'log').mockImplementation(() => {}) }))

describe('Spec: Logger', () => {
  describe('When the debug function is called with divider', () => {
    beforeEach(() => (process.env.PLWD_DEBUG = 'true'))

    afterEach(() => mockConsoleLog.mockClear())

    test('Then it should print a divider line', () => {
      utils.debug('message', 'none', true)
      expect(mockConsoleLog).toBeCalledWith('—'.repeat(process.stdout.columns))
    })

    test('Then it should not print a divider line when turning off the debug mode', () => {
      process.env.PLWD_DEBUG = 'false'
      utils.debug('message', 'none', true)
      expect(mockConsoleLog).not.toBeCalled()
    })
  })

  describe('When the debug function is called without divider', () => {
    beforeEach(() => (process.env.PLWD_DEBUG = 'true'))

    afterEach(() => mockConsoleLog.mockClear())

    test('Then it should print a debug message', () => {
      utils.debug('message')
      expect(mockConsoleLog).toBeCalledWith('message')
    })

    test('Then is should print a debug message with green color', () => {
      utils.debug('message', 'green')
      expect(mockConsoleLog).toBeCalledWith('\x1b[32mmessage\x1b[0m')
    })

    test('Then it should print a debug message with magenta color', () => {
      utils.debug('message', 'magenta')
      expect(mockConsoleLog).toBeCalledWith('\x1b[35mmessage\x1b[0m')
    })

    test('Then it should not print a debug message when turning off the debug mode', () => {
      process.env.PLWD_DEBUG = 'false'
      utils.debug('message')
      expect(mockConsoleLog).not.toBeCalled()
    })
  })

  describe('When the info function is called with divider', () => {
    afterEach(() => mockConsoleLog.mockClear())

    test('Then it should print a divider line', () => {
      utils.info('message', 'none', true)
      expect(mockConsoleLog).toBeCalledWith('—'.repeat(process.stdout.columns))
    })
  })

  describe('When the info function is called without divider', () => {
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
  })
})
