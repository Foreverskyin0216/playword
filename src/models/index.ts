import { z } from 'zod'

export const structuredInput = z.object({
  steps: z
    .array(
      z.object({
        type: z.enum(['navigate', 'click', 'input', 'assertion']).describe('The type of step.'),
        name: z.string().describe('The action to be performed in the test step.')
      })
    )
    .describe('The structured test steps.')
})

export const stepActionMapping = z.object({
  type: z.enum(['navigate', 'click', 'input', 'assertion']).describe('The type of action to be performed.'),
  args: z.record(z.string()).describe('The arguments for the action.')
})
