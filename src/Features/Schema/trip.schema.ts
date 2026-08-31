import { z } from 'zod'

export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED', 'JPY'] as const

export const createTripSchema = z
  .object({
    name: z.string().trim().min(2, 'Trip name must be at least 2 characters').max(80, 'Trip name is too long'),
    description: z.string().trim().max(500, 'Keep the description under 500 characters').optional().or(z.literal('')),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    currency: z.string().min(1, 'Pick a currency'),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  })

export type CreateTripFormValues = z.infer<typeof createTripSchema>

export const addMemberByEmailSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
})

export type AddMemberByEmailFormValues = z.infer<typeof addMemberByEmailSchema>

export const tripSettingsSchema = z.object({
  expensePermission: z.enum(['admin_only', 'all_members', 'selected_members']),
  allowedMemberIds: z.array(z.string()),
})

export type TripSettingsFormValues = z.infer<typeof tripSettingsSchema>
