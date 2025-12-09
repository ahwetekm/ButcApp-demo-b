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
  const startTime = Date.now()

  try {
    // Temporarily disable authentication for testing
    console.log('Admin Users API: Authentication temporarily disabled for testing')

    // Mock user data
    const mockUsers = [
      {
        id: 'user1',
        email: 'user1@example.com',
        fullName: 'Test User 1',
        avatarUrl: '/images/default-avatar.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        lastLogin: new Date().toISOString(),
        totalTransactions: 25,
        totalBalance: 5000
      },
      {
        id: 'user2',
        email: 'user2@example.com',
        fullName: 'Test User 2',
        avatarUrl: '/images/default-avatar.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        lastLogin: new Date().toISOString(),
        totalTransactions: 15,
        totalBalance: 3000
      }
    ]

    return NextResponse.json({
      success: true,
      users: mockUsers,
      count: mockUsers.length
    }, { headers: corsHeaders })

  } catch (error: any) {
    console.error('Users API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Kullanıcılar yüklenemedi: ' + error.message
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

    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({
        success: false,
        error: 'userId ve action parametreleri gerekli'
      }, { status: 400, headers: corsHeaders })
    }

    if (action === 'delete') {
      // Kullanıcıyı sil
      const deletedUser = await prisma.user.delete({
        where: { id: userId },
        include: {
          profile: true,
          userData: true,
          blogPosts: true
        }
      })

      await Logger.logAdminAction('', 'user_deleted', `User deleted: ${deletedUser.email}`, {
        userId: deletedUser.id,
        email: deletedUser.email,
        deletedAt: new Date().toISOString()
      })

      await Logger.logApiRequest('/api/users', 'POST', 200, Date.now() - startTime, undefined, undefined)

      return NextResponse.json({
        success: true,
        message: 'Kullanıcı başarıyla silindi'
      }, { headers: corsHeaders })
    }

    return NextResponse.json({
      success: false,
      error: 'Geçersiz işlem'
    }, { status: 400, headers: corsHeaders })

  } catch (error: any) {
    console.error('Users API Error:', error)
    await Logger.logError(error as Error, 'POST /api/users', undefined, undefined)
    
    return NextResponse.json({
      success: false,
      error: 'İşlem başarısız: ' + error.message
    }, { status: 500, headers: corsHeaders })
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}