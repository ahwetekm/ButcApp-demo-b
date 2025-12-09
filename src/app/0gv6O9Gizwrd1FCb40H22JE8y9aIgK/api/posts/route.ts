import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/jwt'
//import { PrismaClient } from '@prisma/client'

//const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable authentication for testing
    console.log('Admin Posts API: Authentication temporarily disabled for testing')

    // Mock blog posts data
    const mockPosts = [
      {
        id: 'post1',
        title: 'Kişisel Finans Yönetiminin 10 Altın Kuralı',
        slug: 'kisisel-finans-yonetiminin-10-altin-kurali',
        excerpt: 'Finansal özgürlüğe giden yolda atmanız gereken adımlar.',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        published: true
      },
      {
        id: 'post2',
        title: 'Bütçe Yönetimi 101',
        slug: 'butce-yonetimi-101',
        excerpt: 'Bütçe yapmanın temel prensipleri ve etkili bütçe yönetimi teknikleri.',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        published: true
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockPosts
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