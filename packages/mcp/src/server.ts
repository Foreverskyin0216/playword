import type { CallToolRequest } from '@modelcontextprotocol/sdk/types.js'
import type { ServerOptions, Tool } from './types'

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { Context } from './context'

/**
 * CallTool request handler that executes the specified tool with the given arguments.
 *
 * @param request The CallToolRequest containing the tool name and arguments.
 * @param context The mcp context to be used for tool execution.
 * @param tools The list of available tools.
 */
export const callTool = async (request: CallToolRequest, context: Context, tools: Tool[]) => {
  const tool = tools.find((tool) => tool.schema.name === request.params.name)
  if (!tool) {
    return {
      content: [{ type: 'text', text: `Tool "${request.params.name}" not found` }],
      isError: true
    }
  }

  try {
    const response = await tool.handle(context, request.params.arguments)
    return response
  } catch (error) {
    return {
      content: [{ type: 'text', text: String(error) }],
      isError: true
    }
  }
}

/**
 * Run a MCP server with the given name, tools, and context options.
 *
 * @param opts - The options for the server, including name, tools, and context options. See {@link ServerOptions}
 */
export const runServer = (opts: ServerOptions) => {
  const { name, tools, version, ...contextOptions } = opts
  const context = new Context(contextOptions)
  const server = new Server({ name, version }, { capabilities: { tools: {} } })

  server.setRequestHandler(CallToolRequestSchema, (request) => callTool(request, context, tools))

  server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: tools.map((tool) => tool.schema) }))

  const oldClose = server.close.bind(server)
  server.close = async () => {
    await oldClose()
    await context.close()
  }

  return server
}

/** A class to manage a list of MCP servers. */
export class ServerList {
  private servers: Server[] = []
  private serverFactory: () => Server

  constructor(serverFactory: () => Server) {
    this.serverFactory = serverFactory
  }

  /** Close a specific MCP server. */
  async close(server: Server) {
    const index = this.servers.indexOf(server)
    if (index !== -1) this.servers.splice(index, 1)
    await server.close()
  }

  /** Close all MCP servers. */
  async closeAll() {
    await Promise.all(this.servers.map((server) => server.close()))
  }

  /** Create a new MCP server and add it to the list. */
  async create() {
    const server = this.serverFactory()
    this.servers.push(server)
    return server
  }
}
