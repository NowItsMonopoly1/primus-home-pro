// PRIMUS HOME PRO - Lead Validation Schemas
// Zod schemas for form validation

import { z } from 'zod'

export const leadCaptureSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z
    .string()
    .regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .optional(),
  source: z.string(),
  message: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).refine(
  (data) => data.email || data.phone,
  {
    message: 'Either email or phone is required',
    path: ['email'],
  }
)

export type LeadCaptureFormData = z.infer<typeof leadCaptureSchema>
