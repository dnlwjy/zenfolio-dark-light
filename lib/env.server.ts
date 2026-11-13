import { z } from 'zod'

const serverEnvSchema = z.object({
  RECAPTCHA_V3_SECRET_KEY: z.string().min(1, 'RECAPTCHA_V3_SECRET_KEY is required'),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  CONTACT_TO_EMAIL: z.email('CONTACT_TO_EMAIL must be a valid email'),
  CONTACT_FROM_EMAIL: z.string().min(1, 'CONTACT_FROM_EMAIL is required'),
  CONTACT_RATE_LIMIT_WINDOW_MINUTES: z.coerce
    .number()
    .int('CONTACT_RATE_LIMIT_WINDOW_MINUTES must be an integer')
    .min(1, 'CONTACT_RATE_LIMIT_WINDOW_MINUTES must be >= 1')
    .default(3),
  CONTACT_RATE_LIMIT_MAX_REQUESTS: z.coerce
    .number()
    .int('CONTACT_RATE_LIMIT_MAX_REQUESTS must be an integer')
    .min(1, 'CONTACT_RATE_LIMIT_MAX_REQUESTS must be >= 1')
    .default(3),
})

const parsed = serverEnvSchema.safeParse({
  RECAPTCHA_V3_SECRET_KEY: process.env.RECAPTCHA_V3_SECRET_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
  CONTACT_RATE_LIMIT_WINDOW_MINUTES: process.env.CONTACT_RATE_LIMIT_WINDOW_MINUTES ?? 3,
  CONTACT_RATE_LIMIT_MAX_REQUESTS: process.env.CONTACT_RATE_LIMIT_MAX_REQUESTS ?? 1,
})

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ')
  throw new Error(`Server environment variables are invalid: ${details}`)
}

export const envServer = parsed.data