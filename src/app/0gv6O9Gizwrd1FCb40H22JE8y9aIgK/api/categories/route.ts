import { NextRequest, NextResponse } from 'next/server'
//import { PrismaClient } from '@prisma/client'
import { verifyAdminToken } from '@/lib/jwt'
import { Logger } from '@/lib/logger'
import { corsMiddleware, handleOptions } from '@/lib/cors-middleware'

//const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse
  const corsHeaders = corsMiddleware(request)

  try {
    // Temporarily disable authentication for testing
    console.log('Admin Categories API: Authentication temporarily disabled for testing')

    // Mock categories data
    const mockCategories = [
      {
        id: 'cat1',
        name: 'Genel',
        slug: 'genel',
        description: 'Genel finans yazıları',
        postCount: 5
      },
      {
        id: 'cat2',
        name: 'Bütçe Yönetimi',
        slug: 'butce-yonetimi',
        description: 'Bütçe planlama ve takip',
        postCount: 3
      },
      {
        id: 'cat3',
        name: 'Yatırım',
        slug: 'yatirim',
        description: 'Yatırım stratejileri ve tavsiyeler',
        postCount: 4
      }
    ]

    return NextResponse.json({
      success: true,
      categories: mockCategories
    }, { headers: corsHeaders })

  } catch (error: any) {
    console.error('Categories API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Kategoriler yüklenemedi: ' + error.message
    }, { status: 500, headers: corsHeaders })
  }
}

export async function POST(request: NextRequest) {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse
  const corsHeaders = corsMiddleware(request)
  const startTime = Date.now()
  const headersList = request.headers
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  try {
    // Token doğrula
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      await Logger.logSecurity('unauthorized_access', 'No token provided', ipAddress, userAgent)
      return NextResponse.json({
        success: false,
        error: 'Yetkilendirme token\'ı gerekli'
      }, { status: 401, headers: corsHeaders })
    }

    const token = authHeader.substring(7)
    const isAdmin = await verifyAdminToken(token)
    
    if (!isAdmin) {
      await Logger.logSecurity('unauthorized_access', 'Invalid admin token', ipAddress, userAgent)
      return NextResponse.json({
        success: false,
        error: 'Geçersiz veya yetkisiz token'
      }, { status: 403, headers: corsHeaders })
    }

    const { name, slug, description } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({
        success: false,
        error: 'Kategori adı ve slug zorunludur'
      }, { status: 400, headers: corsHeaders })
    }

    // Kategori oluştur
    const newCategory = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description
      }
    })

    await Logger.logAdminAction('', 'category_created', `Category created: ${name}`, {
      categoryId: newCategory.id,
      name,
      slug
    })

    await Logger.logApiRequest('/api/categories', 'POST', 200, Date.now() - startTime, undefined, undefined)

    return NextResponse.json({
      success: true,
      category: {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description
      }
    }, { headers: corsHeaders })

  } catch (error: any) {
    console.error('Categories API Error:', error)
    await Logger.logError(error as Error, 'POST /api/categories', undefined, undefined)
    
    return NextResponse.json({
      success: false,
      error: 'Kategori oluşturulamadı: ' + error.message
    }, { status: 500, headers: corsHeaders })
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}