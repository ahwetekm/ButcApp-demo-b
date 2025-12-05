import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { BlogCategoryResponse } from '@/types/blog'

const prisma = new PrismaClient()

// GET /api/blog/categories - Fetch all blog categories
export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' }
    })

    const response: BlogCategoryResponse = {
      success: true,
      data: categories || []
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Blog categories API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

// POST /api/blog/categories - Create new blog category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name) {
      return NextResponse.json({
        success: false,
        error: 'Category name is required'
      }, { status: 400 })
    }

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    const category = await prisma.blogCategory.create({
      data: {
        name: body.name,
        slug: body.slug || slug,
        description: body.description || '',
        color: body.color || '#10b981',
        icon: body.icon || 'BookOpen'
      }
    })

    return NextResponse.json({
      success: true,
      data: category
    })

  } catch (error) {
    console.error('Blog categories POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}