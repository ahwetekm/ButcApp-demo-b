import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/jwt'
//import { PrismaClient } from '@prisma/client'

//const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Token verification
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await verifyAdminToken(token)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch blog posts from database
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform status to published boolean
    const transformedPosts = posts.map(post => ({
      ...post,
      published: post.status === 'published'
    }))

    return NextResponse.json({
      success: true,
      data: transformedPosts
    })

  } catch (error) {
    console.error('Posts API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Token verification
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await verifyAdminToken(token)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    // Create new blog post
    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        status: body.status || 'draft',
        authorId: body.authorId,
        authorName: body.authorName,
        authorAvatar: body.authorAvatar,
        category: body.category,
        tags: JSON.stringify(body.tags || []),
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaKeywords: JSON.stringify(body.metaKeywords || []),
        featured: body.featured || false,
        publishedAt: body.status === 'published' ? new Date() : null
      }
    })

    return NextResponse.json({
      success: true,
      data: post
    })

  } catch (error) {
    console.error('Create post API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}