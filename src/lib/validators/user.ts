import { z } from 'zod'

// User Zod Schema
export const userSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must be less than 100 characters')
    .toLowerCase(),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
  
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\sğüşıöçİĞÜŞÖÇ]+$/, 'Full name can only contain letters and spaces')
    .trim()
    .optional(),
  
  avatarUrl: z
    .string()
    .url('Avatar URL must be a valid URL')
    .optional()
    .or(z.literal(''))
})

export const userLoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must be less than 100 characters')
    .toLowerCase(),
  
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters')
})

export const userUpdateSchema = userSchema.partial().omit({
  email: true,
  password: true
})

export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'New password must be less than 128 characters')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'New password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'New password must contain at least one special character'),
  
  confirmPassword: z
    .string()
    .min(1, 'Password confirmation is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export type UserInput = z.infer<typeof userSchema>
export type UserLoginInput = z.infer<typeof userLoginSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>