import type { ObserveOptions } from '../../packages/cli/src/types'

import { join } from 'path'
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import yargs from 'yargs'
import { ObserveCommand } from '../../packages/cli/src/commands'

const { mockObserve } = vi.hoisted(() => ({
  mockConsoleLog: vi.spyOn(console, 'log').mockImplementation(() => {}),
  mockConsoleError: vi.spyOn(console, 'error').mockImplementation(() => {}),
  mockObserve: vi.fn()
}))

vi.mock('@playword/core', () => ({ Observer: vi.fn(() => ({ observe: mockObserve })), PlayWord: vi.fn() }))

vi.mock('playwright-core', () => ({
  chromium: {
    launch: vi.fn(() => ({ close: vi.fn(), newContext: vi.fn(() => ({ newPage: vi.fn() })) }))
  },
  firefox: {
    launch: vi.fn(() => ({ close: vi.fn(), newContext: vi.fn(() => ({ newPage: vi.fn() })) }))
  },
  webkit: {
    launch: vi.fn(() => ({ close: vi.fn(), newContext: vi.fn(() => ({ newPage: vi.fn() })) }))
  }
}))

describe('Spec: Test Command', () => {
  describe('Given the test command is executed', () => {
    const defaultOptions = {
      aiOptions: {},
      browser: 'chrome',
      delay: 250,
      envFile: '.env',
      recordPath: '.playword/recordings.json',
      verbose: false
    } as ObserveOptions
    const originalProcess = process
    let workdir: string

    afterEach(() => mockObserve.mockReset())

    describe('When the builder is called', () => {
      test('Then the builder should work as expected', async () => {
        const builder = await ObserveCommand.builder(yargs())
        expect(builder.parse('-o openAIApiKey=sk-...')).toHaveProperty('aiOptions', { openAIApiKey: 'sk-...' })
        expect(() => builder.parse('--recordPath invalid-record-file')).toThrowError()
      })
    })

    describe('When the handler is called', () => {
      beforeAll(() => {
        workdir = process.cwd()
        global.process = {
          ...originalProcess,
          exit: vi.fn((code) => {
            if (code !== 0) {
              throw new Error('exit with ' + code)
            }
          }) as unknown as never,
          on: vi.fn(async (_, fn) => await fn()) as unknown as NodeJS.Process['on']
        }
        process.chdir(join(__dirname, 'mocks'))
      })

      afterAll(() => {
        global.process = originalProcess
        process.chdir(workdir)
      })

      afterEach(() => mockObserve.mockReset())

      test('Then the command should work as expected', async () => {
        await ObserveCommand.handler(defaultOptions)
        await expect(
          ObserveCommand.handler({ ...defaultOptions, browser: 'invalid' } as unknown as ObserveOptions)
        ).rejects.toThrow('exit with 1')
      })
    })
  })
})
