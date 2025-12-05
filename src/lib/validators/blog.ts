import { z } from 'zod'

// BlogPost Zod Schema
export const blogPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(50000, 'Content must be less than 50,000 characters')
    .trim(),
  
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .transform(val => val.toLowerCase()),
  
  excerpt: z
    .string()
    .max(300, 'Excerpt must be less than 300 characters')
    .optional()
    .or(z.literal('')),
  
  featuredImage: z
    .string()
    .url('Featured image must be a valid URL')
    .optional()
    .or(z.literal('')),
  
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  
  tags: z
    .array(z.string().max(30, 'Tag must be less than 30 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
  
  metaTitle: z
    .string()
    .max(60, 'Meta title must be less than 60 characters')
    .optional()
    .or(z.literal('')),
  
  metaDescription: z
    .string()
    .max(160, 'Meta description must be less than 160 characters')
    .optional()
    .or(z.literal('')),
  
  metaKeywords: z
    .array(z.string().max(30, 'Keyword must be less than 30 characters'))
    .max(10, 'Maximum 10 keywords allowed')
    .optional()
    .default([]),
  
  status: z
    .enum(['draft', 'published', 'archived'], {
      errorMap: () => ({ message: 'Invalid status' })
    })
    .default('draft'),
  
  featured: z
    .boolean()
    .default(false),
  
  readingTime: z
    .number()
    .int()
    .min(1, 'Reading time must be at least 1 minute')
    .max(1000, 'Reading time must be less than 1000 minutes')
    .optional(),
  
  publishedAt: z
    .string()
    .datetime('Invalid published date format')
    .optional()
    .or(z.literal(''))
})

export const blogPostUpdateSchema = blogPostSchema.partial()

export type BlogPostInput = z.infer<typeof blogPostSchema>
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>