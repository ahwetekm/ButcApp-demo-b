import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { BlogPostResponse, BlogFilters, BlogPaginationOptions, CreateBlogPostRequest } from '@/types/blog'

// GET /api/blog - Fetch blog posts with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category') || undefined
    const featured = searchParams.get('featured') === 'true'
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || 'published'
    const sortBy = searchParams.get('sortBy') || 'publishedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const author_id = searchParams.get('author_id') || undefined

    // Build WHERE clause
    const where: any = { status }
    
    if (category) {
      where.category = category
    }
    
    if (featured) {
      where.featured = true
    }
    
    if (author_id) {
      where.authorId = author_id
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } }
      ]
    }

    // Count query
    const total = await db.blogPost.count({ where })

    // Data query
    const offset = (page - 1) * limit
    const posts = await db.blogPost.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: offset,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    })

    // Transform data to match our types
    const transformedPosts = posts.map(post => ({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      meta_keywords: post.metaKeywords ? JSON.parse(post.metaKeywords) : [],
      author_name: post.author?.fullName || post.authorName,
      author_avatar: post.author?.avatarUrl || post.authorAvatar,
      category_data: {
        name: post.category,
        slug: post.category?.toLowerCase().replace(/\s+/g, '-'),
        color: '#10b981',
        icon: 'BookOpen'
      }
    }))

    const response: BlogPostResponse = {
      success: true,
      data: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Blog API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

// POST /api/blog - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const body: CreateBlogPostRequest = await request.json()

    // Validate required fields
    if (!body.title || !body.content || !body.author_name || !body.category) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, content, author_name, category'
      }, { status: 400 })
    }

    // Generate slug if not provided
    let slug = body.slug
    if (!slug) {
      slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
    }

    // Check if slug is unique
    const existingPost = await db.blogPost.findUnique({
      where: { slug }
    })

    if (existingPost) {
      // Add random suffix to make it unique
      slug = `${slug}-${Date.now()}`
    }

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = body.content.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)

    // Create post
    const postData = {
      title: body.title,
      slug,
      excerpt: body.excerpt || '',
      content: body.content,
      featuredImage: body.featured_image || '',
      authorName: body.author_name,
      authorAvatar: body.author_avatar || '',
      category: body.category,
      tags: JSON.stringify(body.tags || []),
      metaTitle: body.meta_title || '',
      metaDescription: body.meta_description || '',
      metaKeywords: JSON.stringify(body.meta_keywords || []),
      status: body.status || 'draft',
      featured: body.featured || false,
      viewCount: 0,
      readingTime: body.reading_time || readingTime,
      publishedAt: body.status === 'published' ? new Date() : null,
      authorId: body.author_id || null
    }

    const newPost = await db.blogPost.create({
      data: postData
    })

    return NextResponse.json({
      success: true,
      post: {
        ...newPost,
        tags: JSON.parse(newPost.tags || '[]'),
        meta_keywords: JSON.parse(newPost.metaKeywords || '[]')
      }
    })

  } catch (error) {
    console.error('Blog POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}