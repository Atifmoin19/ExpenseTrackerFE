import { z } from 'zod'

const EPSILON = 0.01

const splitLineSchema = z.object({
  uid: z.string().min(1),
  amount: z.number().optional(),
  percentage: z.number().optional(),
  shares: z.number().optional(),
})

export const EXPENSE_CATEGORIES = [
  'Food & Drink',
  'Transport',
  'Lodging',
  'Activities',
  'Shopping',
  'Groceries',
  'Utilities',
  'Other',
] as const

export const addExpenseSchema = z
  .object({
    description: z.string().trim().min(1, 'Add a description').max(120, 'Keep it under 120 characters'),
    amount: z.number().positive('Amount must be greater than 0'),
    currency: z.string().min(1),
    category: z.string().optional(),
    notes: z
      .string()
      .trim()
      .max(1000, 'Keep notes under 1000 characters')
      .optional()
      .or(z.literal('')),
    tags: z.array(z.string()),
    receiptUrl: z.string().optional(),
    paidBy: z.string().min(1, 'Choose who paid'),
    date: z.string().min(1, 'Choose a date'),
    splitType: z.enum(['equal', 'exact', 'percentage', 'shares']),
    splits: z.array(splitLineSchema).min(1, 'Select at least one person to split with'),
  })
  .superRefine((data, ctx) => {
    const { splitType, splits, amount } = data

    if (splitType === 'exact') {
      const hasInvalid = splits.some((s) => s.amount === undefined || s.amount < 0)
      const sum = splits.reduce((acc, s) => acc + (s.amount ?? 0), 0)
      if (hasInvalid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter an amount for everyone in the split',
          path: ['splits'],
        })
      } else if (Math.abs(sum - amount) > EPSILON) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Split amounts must add up to ${amount.toFixed(2)} (currently ${sum.toFixed(2)})`,
          path: ['splits'],
        })
      }
    }

    if (splitType === 'percentage') {
      const hasInvalid = splits.some((s) => s.percentage === undefined || s.percentage < 0)
      const sum = splits.reduce((acc, s) => acc + (s.percentage ?? 0), 0)
      if (hasInvalid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a percentage for everyone in the split',
          path: ['splits'],
        })
      } else if (Math.abs(sum - 100) > EPSILON) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Percentages must add up to 100% (currently ${sum.toFixed(1)}%)`,
          path: ['splits'],
        })
      }
    }

    if (splitType === 'shares') {
      const invalid = splits.some(
        (s) => s.shares === undefined || !Number.isInteger(s.shares) || s.shares <= 0,
      )
      if (invalid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Shares must be positive whole numbers for everyone in the split',
          path: ['splits'],
        })
      }
    }
  })

export type AddExpenseFormValues = z.infer<typeof addExpenseSchema>
