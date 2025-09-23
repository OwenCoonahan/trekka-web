import { z } from 'zod'

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores')
  .transform(val => val.toLowerCase())

export const profileSchema = z.object({
  username: usernameSchema,
  display_name: z.string().max(50).optional(),
  bio: z.string().max(240).optional(),
  occupation: z.string().max(100).optional(),
  base_location: z.string().max(100).optional(),
  links: z.object({
    instagram: z.string().url().optional().or(z.literal('')),
    tiktok: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    x: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),
})

export const tripSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
  description: z.string().optional(),
  is_private: z.boolean().optional().default(false),
}).refine(
  (data) => new Date(data.end_date) >= new Date(data.start_date),
  {
    message: 'End date must be after or equal to start date',
    path: ['end_date'],
  }
)

export const emailSchema = z.string().email('Invalid email address')