import type { Tool } from './types'

import { z } from 'zod'
import toJSON from 'zod-to-json-schema'

export const closePlayWord: Tool = {
  handle: async ({ close }) => {
    await close()
    return { content: [{ type: 'text', text: 'PlayWord instance closed.' }] }
  },

  schema: {
    name: 'ClosePlayWord',
    description: 'Close the PlayWord instance.',
    inputSchema: toJSON(z.object({}))
  }
}

export const callPlayWord: Tool = {
  handle: async ({ createPlayWord, getPlayWord }, params) => {
    const playword = getPlayWord() || (await createPlayWord())

    const response = await playword.say(params!.input as string)
    const text = response.toString()

    return { content: [{ type: 'text', text }] }
  },

  schema: {
    name: 'CallPlayWord',
    description: 'Call PlayWord to perform browser operations.',
    inputSchema: toJSON(z.object({ input: z.string().describe('The user input passed to PlayWord') }))
  }
}
