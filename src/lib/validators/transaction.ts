import { z } from 'zod'

// Transaction Zod Schema
export const transactionSchema = z.object({
  type: z
    .enum(['income', 'expense', 'transfer'], {
      errorMap: () => ({ message: 'Invalid transaction type' })
    }),
  
  amount: z
    .number()
    .positive('Amount must be positive')
    .min(0.01, 'Minimum amount is 0.01')
    .max(1000000000, 'Maximum amount is 1,000,000'),
  
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters')
    .trim(),
  
  account: z
    .enum(['cash', 'bank', 'savings'], {
      errorMap: () => ({ message: 'Invalid account type' })
    }),
  
  date: z
    .string()
    .datetime('Invalid date format')
    .refine((date) => {
      const dateObj = new Date(date)
      const now = new Date()
      return dateObj <= now
    }, 'Date cannot be in the future'),
  
  transferFrom: z
    .enum(['cash', 'bank', 'savings'], {
      errorMap: () => ({ message: 'Invalid transfer from account' })
    })
    .optional(),
  
  transferTo: z
    .enum(['cash', 'bank', 'savings'], {
      errorMap: () => ({ message: 'Invalid transfer to account' })
    })
    .optional(),
  
  isRecurring: z
    .boolean()
    .default(false),
  
  recurringId: z
    .string()
    .optional()
}).refine((data) => {
  // If type is transfer, both transferFrom and transferTo must be provided
  if (data.type === 'transfer') {
    return data.transferFrom && data.transferTo && data.transferFrom !== data.transferTo
  }
  // If type is not transfer, transfer fields should not be provided
  return !data.transferFrom && !data.transferTo
}, {
  message: 'Transfer transactions must have valid transferFrom and transferTo fields',
  path: ['transferFrom']
})

// Recurring Transaction Zod Schema
export const recurringTransactionSchema = z.object({
  type: z
    .enum(['income', 'expense'], {
      errorMap: () => ({ message: 'Invalid recurring transaction type' })
    }),
  
  amount: z
    .number()
    .positive('Amount must be positive')
    .min(0.01, 'Minimum amount is 0.01')
    .max(1000000000, 'Maximum amount is 1,000,000'),
  
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters')
    .trim(),
  
  account: z
    .enum(['cash', 'bank', 'savings'], {
      errorMap: () => ({ message: 'Invalid account type' })
    }),
  
  frequency: z
    .enum(['daily', 'weekly', 'monthly', 'yearly', 'custom'], {
      errorMap: () => ({ message: 'Invalid frequency' })
    }),
  
  customFrequency: z
    .string()
    .max(50, 'Custom frequency must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  
  dayOfWeek: z
    .number()
    .int()
    .min(1, 'Day of week must be between 1 and 7')
    .max(7, 'Day of week must be between 1 and 7')
    .optional(),
  
  startDate: z
    .string()
    .datetime('Invalid start date format')
    .refine((date) => {
      const dateObj = new Date(date)
      const now = new Date()
      return dateObj <= now
    }, 'Start date cannot be in the future'),
  
  endDate: z
    .string()
    .datetime('Invalid end date format')
    .optional()
    .or(z.literal('')),
  
  isActive: z
    .boolean()
    .default(true)
}).refine((data) => {
  // If frequency is weekly, dayOfWeek is required
  if (data.frequency === 'weekly' && !data.dayOfWeek) {
    return false
  }
  return true
}, {
  message: 'Day of week is required for weekly frequency',
  path: ['dayOfWeek']
})

export type TransactionInput = z.infer<typeof transactionSchema>
export type RecurringTransactionInput = z.infer<typeof recurringTransactionSchema>