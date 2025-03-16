import type { TestOptions } from '../../packages/cli/src/types'

import { join } from 'path'
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import yargs from 'yargs'
import { TestCommand } from '../../packages/cli/src/commands'

const { mockConfirm, mockSay } = vi.hoisted(() => ({
  mockConfirm: vi.fn(),
  mockStdoutWrite: vi.spyOn(process.stdout, 'write').mockImplementation(() => true),
  mockConsoleLog: vi.spyOn(console, 'log').mockImplementation(() => {}),
  mockConsoleError: vi.spyOn(console, 'error').mockImplementation(() => {}),
  mockSay: vi.fn()
}))

vi.mock('@playword/core', () => ({ PlayWord: vi.fn(() => ({ say: mockSay })) }))

vi.mock('playwright-core', () => ({
  chromium: { launch: vi.fn(() => ({ close: vi.fn(), newContext: vi.fn() })) },
  firefox: { launch: vi.fn(() => ({ close: vi.fn(), newContext: vi.fn() })) },
  webkit: { launch: vi.fn(() => ({ close: vi.fn(), newContext: vi.fn() })) }
}))

vi.mock('@inquirer/input', () => ({ default: vi.fn().mockResolvedValue('mock input') }))

vi.mock('@inquirer/confirm', () => ({ default: mockConfirm }))

describe('Spec: Test Command', () => {
  describe('Given the test command is executed', () => {
    const defaultOptions = {
      aiOptions: {},
      browser: 'chrome',
      delay: 250,
      envFile: '.env',
      headed: false,
      playback: false,
      record: false,
      verbose: false
    } as TestOptions
    const originalProcess = process
    let workdir: string

    afterEach(() => mockSay.mockReset())

    describe('When the builder is called', () => {
      test('Then the builder should work as expected', async () => {
        const builder = await TestCommand.builder(yargs())
        expect(builder.parse('-o googleApiKey=sk-...')).toHaveProperty('aiOptions', { googleApiKey: 'sk-...' })
        expect(() => builder.parse('--record invalid-record-file')).toThrowError()
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
          }) as unknown as never
        }
        process.chdir(join(__dirname, 'mocks'))
        mockConfirm.mockResolvedValue(false)
      })

      afterAll(() => {
        global.process = originalProcess
        process.chdir(workdir)
        mockConfirm.mockReset()
      })

      test('Then the command should work as expected with the browser option', async () => {
        mockSay.mockResolvedValue(true)
        await TestCommand.handler({ ...defaultOptions, browser: 'chromium' })
        await TestCommand.handler({ ...defaultOptions, browser: 'chrome' })
        await TestCommand.handler({ ...defaultOptions, browser: 'msedge' })
        await TestCommand.handler({ ...defaultOptions, browser: 'firefox' })
        await TestCommand.handler({ ...defaultOptions, browser: 'webkit' })
        await expect(
          TestCommand.handler({ ...defaultOptions, browser: 'invalid' } as unknown as TestOptions)
        ).rejects.toThrow('exit with 1')
      })

      test('Then the command should work as expected with the env-file option', async () => {
        mockSay.mockResolvedValue(false)
        await TestCommand.handler({ ...defaultOptions, envFile: '.env' })
        await TestCommand.handler({ ...defaultOptions, envFile: '' })
      })

      test('Then the command should work as expected with the record option', async () => {
        mockConfirm.mockResolvedValue(false)
        await TestCommand.handler({ ...defaultOptions, record: true, playback: true })
        await TestCommand.handler({ ...defaultOptions, record: 'invalid' })
      })
    })
  })
})
