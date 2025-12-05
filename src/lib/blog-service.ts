import { db } from '@/lib/db'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featuredImage?: string
  authorId: string
  authorName: string
  authorAvatar?: string
  category: string
  tags: string[]
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  viewCount: number
  readingTime?: number
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  icon: string
  createdAt: Date
}

export interface BlogComment {
  id: string
  postId: string
  authorName: string
  authorEmail?: string
  content: string
  parentId?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
}

export class BlogService {
  static async createDefaultCategories() {
    const defaultCategories = [
      {
        name: 'Bütçe Yönetimi',
        slug: 'butce-yonetimi',
        description: 'Kişisel bütçe planlama ve yönetimi ipuçları',
        color: '#10b981',
        icon: 'Calculator'
      },
      {
        name: 'Yatırım',
        slug: 'yatirim',
        description: 'Yatırım stratejileri ve analizleri',
        color: '#3b82f6',
        icon: 'TrendingUp'
      },
      {
        name: 'Birikim',
        slug: 'birikim',
        description: 'Para biriktirme teknikleri ve tasarruf ipuçları',
        color: '#8b5cf6',
        icon: 'PiggyBank'
      },
      {
        name: 'Finansal Okuryazarlık',
        slug: 'finansal-okuryazarlik',
        description: 'Finansal eğitim ve kavramlar',
        color: '#f59e0b',
        icon: 'GraduationCap'
      }
    ]

    for (const category of defaultCategories) {
      await db.blogCategory.upsert({
        where: { slug: category.slug },
        update: category,
        create: category
      })
    }
  }

  static async getPosts(options: {
    published?: boolean
    category?: string
    featured?: boolean
    limit?: number
    offset?: number
  } = {}): Promise<BlogPost[]> {
    const where: any = {}
    
    if (options.published) {
      where.status = 'published'
    }
    
    if (options.category) {
      where.category = options.category
    }
    
    if (options.featured) {
      where.featured = true
    }

    const posts = await db.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: options.limit,
      skip: options.offset,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          }
        }
      }
    })

    return posts.map(post => ({
      ...post,
      tags: JSON.parse(post.tags || '[]'),
      metaKeywords: post.metaKeywords ? JSON.parse(post.metaKeywords) : undefined,
      authorName: post.authorName || post.author.fullName || 'Anonymous',
      authorAvatar: post.authorAvatar || post.author.avatarUrl || undefined,
    }))
  }

  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const post = await db.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          }
        }
      }
    })

    if (!post) return null

    // Increment view count
    await db.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    })

    return {
      ...post,
      tags: JSON.parse(post.tags || '[]'),
      metaKeywords: post.metaKeywords ? JSON.parse(post.metaKeywords) : undefined,
      authorName: post.authorName || post.author.fullName || 'Anonymous',
      authorAvatar: post.authorAvatar || post.author.avatarUrl || undefined,
    }
  }

  static async createPost(data: {
    title: string
    slug: string
    excerpt?: string
    content: string
    featuredImage?: string
    authorId: string
    authorName: string
    authorAvatar?: string
    category: string
    tags: string[]
    metaTitle?: string
    metaDescription?: string
    metaKeywords?: string[]
    status?: 'draft' | 'published' | 'archived'
    featured?: boolean
    readingTime?: number
    publishedAt?: Date
  }): Promise<BlogPost> {
    const post = await db.blogPost.create({
      data: {
        ...data,
        tags: JSON.stringify(data.tags),
        metaKeywords: data.metaKeywords ? JSON.stringify(data.metaKeywords) : null,
        status: data.status || 'draft',
        featured: data.featured || false,
      }
    })

    return {
      ...post,
      tags: JSON.parse(post.tags || '[]'),
      metaKeywords: post.metaKeywords ? JSON.parse(post.metaKeywords) : undefined,
    }
  }

  static async updatePost(id: string, data: Partial<{
    title: string
    slug: string
    excerpt: string
    content: string
    featuredImage: string
    category: string
    tags: string[]
    metaTitle: string
    metaDescription: string
    metaKeywords: string[]
    status: 'draft' | 'published' | 'archived'
    featured: boolean
    readingTime: number
    publishedAt: Date
  }>): Promise<BlogPost> {
    const updateData: any = { ...data }

    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags)
    }

    if (data.metaKeywords) {
      updateData.metaKeywords = JSON.stringify(data.metaKeywords)
    }

    const post = await db.blogPost.update({
      where: { id },
      data: updateData
    })

    return {
      ...post,
      tags: JSON.parse(post.tags || '[]'),
      metaKeywords: post.metaKeywords ? JSON.parse(post.metaKeywords) : undefined,
    }
  }

  static async deletePost(id: string): Promise<void> {
    await db.blogPost.delete({
      where: { id }
    })
  }

  static async getCategories(): Promise<BlogCategory[]> {
    return await db.blogCategory.findMany({
      orderBy: { name: 'asc' }
    })
  }

  static async recordAnalytics(postId: string, data: {
    ipAddress?: string
    userAgent?: string
    referrer?: string
  }): Promise<void> {
    await db.blogAnalytics.create({
      data: {
        postId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        referrer: data.referrer,
      }
    })
  }

  static async getComments(postId: string, approvedOnly: boolean = true): Promise<BlogComment[]> {
    const where: any = { postId }
    
    if (approvedOnly) {
      where.status = 'approved'
    }

    return await db.blogComment.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    })
  }

  static async createComment(data: {
    postId: string
    authorName: string
    authorEmail?: string
    content: string
    parentId?: string
  }): Promise<BlogComment> {
    return await db.blogComment.create({
      data: {
        ...data,
        status: 'pending', // Comments need approval
      }
    })
  }

  static async approveComment(id: string): Promise<void> {
    await db.blogComment.update({
      where: { id },
      data: { status: 'approved' }
    })
  }

  static async rejectComment(id: string): Promise<void> {
    await db.blogComment.update({
      where: { id },
      data: { status: 'rejected' }
    })
  }
}