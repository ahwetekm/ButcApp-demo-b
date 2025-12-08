// Blog post types for TypeScript
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featured_image?: string
  author_id: string
  author_name: string
  author_avatar?: string
  category: string
  tags: string[]
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  view_count: number
  reading_time?: number
  published_at?: string
  created_at: string
  updated_at: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  icon: string
  created_at: string
}

export interface BlogComment {
  id: string
  post_id: string
  author_name: string
  author_email?: string
  content: string
  parent_id?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface BlogAnalytics {
  id: string
  post_id: string
  ip_address?: string
  user_agent?: string
  referrer?: string
  viewed_at: string
}

// API Response types
export interface BlogPostResponse {
  success: boolean
  data?: BlogPost[]
  post?: BlogPost
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
}

export interface BlogCategoryResponse {
  success: boolean
  data?: BlogCategory[]
  error?: string
}

// Form types for creating/updating posts
export interface CreateBlogPostRequest {
  title: string
  slug?: string
  excerpt?: string
  content: string
  featured_image?: string
  author_name: string
  author_avatar?: string
  category: string
  tags: string[]
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
  status?: 'draft' | 'published'
  featured?: boolean
  reading_time?: number
  published_at?: string
}

export interface UpdateBlogPostRequest extends Partial<CreateBlogPostRequest> {
  id: string
}

// SEO metadata types
export interface BlogSEOMetadata {
  title: string
  description: string
  keywords: string[]
  author: string
  publishedTime: string
  modifiedTime: string
  image?: string
  url: string
  type: 'article'
}

// Blog listing filters
export interface BlogFilters {
  category?: string
  tags?: string[]
  featured?: boolean
  search?: string
  status?: 'draft' | 'published' | 'archived'
  author_id?: string
}

// Blog pagination options
export interface BlogPaginationOptions {
  page: number
  limit: number
  sortBy?: 'published_at' | 'created_at' | 'view_count' | 'title'
  sortOrder?: 'asc' | 'desc'
}