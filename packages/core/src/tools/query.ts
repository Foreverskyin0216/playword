import type { DynamicStructuredTool } from '@langchain/core/tools'
import type { ToolConfig } from '../types'

import { tool } from '@langchain/core/tools'
import * as actions from '../actions'
import * as utils from '../utils'

/**
 * Custom tools for querying data on a webpage
 *
 * Available query tools:
 * - GetText
 */
export const query = [
  tool(
    async (_, { configurable }) => {
      const { ref } = configurable as ToolConfig
      const { input, recorder } = ref

      utils.debug('Thoughts: Extracting relevant information from the webpage', 'magenta')
      recorder?.addAction({ name: 'getText', params: { input } })

      return actions.getText(ref, { input })
    },
    {
      name: 'GetText',
      description: 'Get specified information from the webpage'
    }
  )
] as unknown as DynamicStructuredTool[]
