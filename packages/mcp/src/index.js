#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { argv, exit, stdin } from 'process'
import { setTimeout } from 'timers'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { runServer, ServerList } from './server'
import * as tools from './tools'
import pkg from '../package.json'

/** Watch for the close event on stdin and close all servers. */
const handleCloseEvent = (serverList) => {
  stdin.on('close', async () => {
    setTimeout(() => exit(0), 15000)
    await serverList.closeAll()
    exit(0)
  })
}

const {
  aiOptions = {},
  browser = 'chrome',
  headless = false
} = yargs(hideBin(argv))
  .option('ai-options', {
    alias: 'o',
    type: 'array',
    coerce: (options) =>
      options.reduce((acc, option) => {
        const [key, value] = option.split('=')
        if (key && value) acc[key] = value
        return acc
      }, {})
  })
  .option('browser', { choices: ['chrome', 'chromium', 'firefox', 'msedge', 'webkit'], default: 'chrome' })
  .option('headless')
  .parseSync(argv)

;(async () => {
  const serverList = new ServerList(() =>
    runServer({
      browserType: browser,
      name: 'PlayWord',
      launchOptions: { headless },
      playwordOptions: { aiOptions, debug: true },
      tools: Object.values(tools),
      version: pkg.version
    })
  )

  handleCloseEvent(serverList)

  const server = await serverList.create()
  await server.connect(new StdioServerTransport())
})()
