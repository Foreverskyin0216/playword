import { join } from 'path'
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import yargs from 'yargs'
import TestCommand from '../../packages/cli/src/testCommand'

const { mockConfirm, mockSay } = vi.hoisted(() => ({
  mockConfirm: vi.fn(),
  mockStdoutWrite: vi.spyOn(process.stdout, 'write').mockImplementation(() => true),
  mockConsoleLog: vi.spyOn(console, 'log').mockImplementation(() => {}),
  mockConsoleError: vi.spyOn(console, 'error').mockImplementation(() => {}),
  mockSay: vi.fn()
}))

vi.mock('@playword/core', () => ({ PlayWord: vi.fn(() => ({ say: mockSay })) }))
vi.mock('playwright-core', () => ({
  chromium: { launch: vi.fn(() => ({ newPage: vi.fn(), close: vi.fn() })) },
  firefox: { launch: vi.fn(() => ({ newPage: vi.fn(), close: vi.fn() })) },
  webkit: { launch: vi.fn(() => ({ newPage: vi.fn(), close: vi.fn() })) }
}))
vi.mock('@inquirer/input', () => ({ default: vi.fn().mockResolvedValue('mock input') }))
vi.mock('@inquirer/confirm', () => ({ default: mockConfirm }))

describe('Spec: Test Command', () => {
  describe('Given the test command is executed', () => {
    const actualProcess = process
    const defaultOptions = {
      browser: 'chrome',
      envFile: '.env',
      headed: false,
      openAIOptions: {},
      playback: false,
      record: false,
      useScreenshot: false,
      verbosity: 1
    }
    let workdir: string

    afterEach(() => mockSay.mockRestore())

    describe('When the builder is called', () => {
      test('Builder should work as expected', async () => {
        const builder = await TestCommand.builder(yargs())
        expect(builder.parse('--openai-options apiKey=sk-...')).toHaveProperty('openaiOptions', { apiKey: 'sk-...' })
        expect(() => builder.parse('--record invalid-record-file')).toThrowError()
      })
    })

    describe('When the handler is called', () => {
      beforeAll(() => {
        workdir = process.cwd()
        global.process = {
          ...actualProcess,
          exit: vi.fn((code) => {
            if (code !== 0) throw new Error('exit with ' + code)
          }) as unknown as never
        }
        process.chdir(join(__dirname, 'mocks'))
        mockConfirm.mockResolvedValue(false)
      })

      afterAll(() => {
        global.process = actualProcess
        process.chdir(workdir)
        mockConfirm.mockRestore()
      })

      test('Should work as expected with the browser option', async () => {
        mockSay.mockResolvedValue(true)
        await TestCommand.handler({ ...defaultOptions, browser: 'chromium' })
        await TestCommand.handler({ ...defaultOptions, browser: 'chrome' })
        await TestCommand.handler({ ...defaultOptions, browser: 'msedge' })
        await TestCommand.handler({ ...defaultOptions, browser: 'firefox' })
        await TestCommand.handler({ ...defaultOptions, browser: 'webkit' })
        await expect(TestCommand.handler({ ...defaultOptions, browser: 'invalid' })).rejects.toThrow('exit with 1')
      })

      test('Should work as expected with the env-file option', async () => {
        mockSay.mockResolvedValue(false)
        await TestCommand.handler({ ...defaultOptions, envFile: '.env' })
        await TestCommand.handler({ ...defaultOptions, envFile: '' })
      })

      test('Should work as expected with the record option', async () => {
        mockConfirm.mockResolvedValue(false)
        await TestCommand.handler({ ...defaultOptions, record: true, playback: true })
        await TestCommand.handler({ ...defaultOptions, record: 'invalid' })
      })
    })
  })
})
