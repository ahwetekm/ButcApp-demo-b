import { z } from 'zod'

// Investment Zod Schema
export const investmentSchema = z.object({
  amount: z
    .number()
    .positive('Investment amount must be positive')
    .min(0.01, 'Minimum investment amount is 0.01')
    .max(1000000000, 'Maximum investment amount is 1,000,000'),
  
  type: z
    .enum(['crypto', 'stock', 'currency', 'bond', 'etf', 'commodity'], {
      errorMap: () => ({ message: 'Invalid investment type' })
    }),
  
  symbol: z
    .string()
    .min(1, 'Symbol is required')
    .max(20, 'Symbol must be less than 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Symbol must contain only uppercase letters and numbers'),
  
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  buyPrice: z
    .number()
    .positive('Buy price must be positive')
    .min(0.01, 'Minimum buy price is 0.01')
    .max(1000000, 'Maximum buy price is 1,000,000'),
  
  currency: z
    .enum(['USD', 'EUR', 'GBP', 'JPY', 'TRY', 'BTC', 'ETH'], {
      errorMap: () => ({ message: 'Invalid currency' })
    })
    .default('USD'),
  
  buyDate: z
    .string()
    .datetime('Invalid date format')
    .refine((date) => {
      const dateObj = new Date(date)
      const now = new Date()
      return dateObj <= now
    }, 'Buy date cannot be in the future'),
  
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal(''))
})

export const investmentUpdateSchema = investmentSchema.partial()

export type InvestmentInput = z.infer<typeof investmentSchema>
export type InvestmentUpdateInput = z.infer<typeof investmentUpdateSchema>