// Re-export all validators
export * from './investment'
export * from './blog'
export * from './user'
export * from './transaction'
export * from './note'

// Common validation utilities
import { ZodError, ZodIssue } from 'zod'

export interface ValidationError {
  field: string
  message: string
}

export const formatZodError = (error: ZodError): ValidationError[] => {
  return error.errors.map((issue: ZodIssue) => ({
    field: issue.path.join('.'),
    message: issue.message
  }))
}

export const createValidationResponse = (errors: ValidationError[]) => {
  return {
    success: false,
    error: 'Validation failed',
    details: errors,
    timestamp: new Date().toISOString()
  }
}