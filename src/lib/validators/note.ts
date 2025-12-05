import { z } from 'zod'

// Note Zod Schema
export const noteSchema = z.object({
  content: z
    .string()
    .min(1, 'Note content is required')
    .max(2000, 'Note content must be less than 2000 characters')
    .trim(),
  
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim()
    .optional(),
  
  tags: z
    .array(z.string().max(30, 'Tag must be less than 30 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
  
  date: z
    .string()
    .datetime('Invalid date format')
    .optional()
    .or(z.literal(''))
})

export const noteUpdateSchema = noteSchema.partial()

export type NoteInput = z.infer<typeof noteSchema>
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>