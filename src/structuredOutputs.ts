import { z } from 'zod'

export const CLASSIFICATION_OUTPUTS = z.object({
  intent: z.enum(['page', 'assertion'])
})
