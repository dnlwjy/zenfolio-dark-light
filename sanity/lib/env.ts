import { z } from 'zod'

const schema = z.object({
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1, 'NEXT_PUBLIC_SANITY_DATASET is required'),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1, 'NEXT_PUBLIC_SANITY_PROJECT_ID is required'),
})

const parsed = schema.parse({
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
})

export const apiVersion = '2026-04-17'
export const dataset = parsed.NEXT_PUBLIC_SANITY_DATASET
export const projectId = parsed.NEXT_PUBLIC_SANITY_PROJECT_ID