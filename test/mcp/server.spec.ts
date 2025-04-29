import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { Context } from '../../packages/mcp/src/context'
import { callTool, runServer, ServerList } from '../../packages/mcp/src/server'
import * as tools from '../../packages/mcp/src/tools'

const { mockSay, mockServerClose } = vi.hoisted(() => ({ mockSay: vi.fn(), mockServerClose: vi.fn() }))

vi.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: vi.fn(() => ({ close: mockServerClose, setRequestHandler: vi.fn() }))
}))

vi.mock('@playword/core', () => ({ PlayWord: vi.fn(() => ({ say: mockSay })) }))

vi.mock('playwright-core', () => ({
  chromium: { launch: vi.fn(() => ({ newContext: vi.fn() })) },
  firefox: { launch: vi.fn(() => ({ newContext: vi.fn() })) },
  webkit: { launch: vi.fn(() => ({ newContext: vi.fn() })) }
}))

describe('Spec: Server', () => {
  describe('Given the callTool function', () => {
    const context = new Context()
    const toolkit = Object.values(tools)

    beforeAll(() => mockSay.mockResolvedValue('test response'))

    afterAll(() => mockSay.mockClear())

    describe('When the function is called', () => {
      test('Then it should return the correct response', async () => {
        const params = { name: 'CallPlayWord', arguments: { params: { input: 'test input' } } }
        const result = await callTool({ params, method: 'tools/call' }, context, toolkit)
        expect(result).toEqual({ content: [{ type: 'text', text: 'test response' }] })
      })
    })

    describe('When the tool is not found', () => {
      test('Then it should the message "Tool ${toolName} not found"', async () => {
        const params = { name: 'invalidTool', arguments: { params: { input: 'test input' } } }
        const result = await callTool({ params, method: 'tools/call' }, context, toolkit)
        expect(result).toEqual({ content: [{ type: 'text', text: 'Tool "invalidTool" not found' }], isError: true })
      })
    })

    describe('When the tool throws an error', () => {
      beforeAll(() => mockSay.mockRejectedValue(new Error('Test error')))

      afterAll(() => mockSay.mockReset())

      test('Then it should return the correct error message', async () => {
        const params = { name: 'CallPlayWord', arguments: { params: { input: 'test input' } } }
        const result = await callTool({ params, method: 'tools/call' }, context, toolkit)
        expect(result).toEqual({ content: [{ type: 'text', text: 'Error: Test error' }], isError: true })
      })
    })
  })

  describe('Given the ServerList class', () => {
    describe('When the close method is called', () => {
      const serverList = new ServerList(() => runServer({ name: 'test', tools: [], version: '1.0.0' }))
      let server: Server

      beforeAll(async () => {
        server = await serverList.create()
        await serverList.close(server)
      })

      afterAll(() => mockServerClose.mockClear())

      test('Then it should call the server close method', () => {
        expect(mockServerClose).toBeCalledTimes(1)
      })
    })

    describe('When the closeAll method is called', () => {
      const serverList = new ServerList(() => runServer({ name: 'test', tools: [], version: '1.0.0' }))

      beforeAll(async () => {
        await Promise.all([serverList.create(), serverList.create()])
        await serverList.closeAll()
      })

      afterAll(() => mockServerClose.mockClear())

      test('Then it should call the server close method', () => {
        expect(mockServerClose).toBeCalledTimes(2)
      })
    })
  })
})
