import { describe, expect, test, vi } from 'vitest'
import { divider, info, startLog } from '../../../packages/core/src/utils'

const { mockConsoleLog } = await vi.hoisted(async () => ({
  mockConsoleLog: vi.spyOn(console, 'log').mockImplementation(() => {}),
  mockStderr: vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
}))

vi.mock('spinner')
vi.mock('ora')

describe('Spec: Logger', () => {
  describe('When divider is called', () => {
    test('It should print a divider line', () => {
      divider()
      expect(mockConsoleLog).toHaveBeenCalledWith('-'.repeat(process.stdout.columns))
    })
  })

  describe('When info is called', () => {
    test('It should print an information message', () => {
      info('message')
      expect(mockConsoleLog).toHaveBeenCalledWith('message')
    })

    test('It should print an information message with green color', () => {
      info('message', 'green')
      expect(mockConsoleLog).toHaveBeenCalledWith('\x1b[32mmessage\x1b[0m')
    })

    test('It should print an information message with magenta color', () => {
      info('message', 'magenta')
      expect(mockConsoleLog).toHaveBeenCalledWith('\x1b[35mmessage\x1b[0m')
    })
  })

  describe('When startLog is called', () => {
    test('It should start a progress spinner', async () => {
      const spinner = await startLog('ora message')
      expect(spinner.text).toBe('ora message')
    })
  })
})
