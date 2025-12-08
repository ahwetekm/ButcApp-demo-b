import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { BlogPostResponse } from '@/types/blog'

// GET /api/blog/[slug] - Fetch single blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const post = await db.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true
          }
        }
      }
    })

    if (!post || post.status !== 'published') {
      return NextResponse.json({
        success: false,
        error: 'Blog post not found'
      }, { status: 404 })
    }

    // Increment view count
    await db.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    })

    // Track analytics
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referrer = request.headers.get('referer') || null

    await db.blogAnalytics.create({
      data: {
        postId: post.id,
        ipAddress: clientIP,
        userAgent,
        referrer
      }
    })

    const response: BlogPostResponse = {
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage,
        authorId: post.authorId,
        authorName: post.authorName,
        authorAvatar: post.authorAvatar,
        category: post.category,
        tags: post.tags ? JSON.parse(post.tags) : [],
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        metaKeywords: post.metaKeywords ? JSON.parse(post.metaKeywords) : [],
        status: post.status,
        featured: post.featured,
        viewCount: post.viewCount + 1,
        readingTime: post.readingTime,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        category_data: {
          name: post.category,
          slug: post.category?.toLowerCase().replace(/\s+/g, '-'),
          color: '#10b981',
          icon: 'BookOpen'
        },
        author: post.author
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Blog post API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: (error as Error).message
    }, { status: 500 })
  }
}