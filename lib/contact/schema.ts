import { z } from 'zod'

export const contactFormFieldsSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  email: z.email('Invalid email format.').trim(),
  message: z
    .string()
    .trim()
    .min(50, 'Message must be at least 50 characters.')
    .max(500, 'Message must be at most 500 characters.'),
})

export const contactFormSchema = contactFormFieldsSchema.extend({
  recaptcha: z.string().trim().min(1, 'reCAPTCHA verification is required.'),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>

export type ContactApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'BOT_CHECK_FAILED'
  | 'RATE_LIMITED'
  | 'EMAIL_SEND_FAILED'
  | 'INTERNAL_ERROR'

export type ContactApiResponse =
  | {
      success: true
      code: 'MESSAGE_ACCEPTED'
      message: string
    }
  | {
      success: false
      code: ContactApiErrorCode
      message: string
    }