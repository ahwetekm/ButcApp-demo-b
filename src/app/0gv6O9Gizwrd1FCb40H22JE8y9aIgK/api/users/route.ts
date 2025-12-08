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

    // Kullanıcıları getir
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            cash: true,
            bank: true,
            savings: true
          }
        },
        userData: {
          where: {
            type: {
              in: ['income', 'expense']
            }
          },
          select: {
            amount: true
          }
        },
        systemLogs: {
          where: {
            type: 'user_login'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Kullanıcı verilerini formatla
    const formattedUsers = users.map(user => {
      const totalTransactions = user.userData.length
      const totalBalance = (user.profile?.cash || 0) + (user.profile?.bank || 0) + (user.profile?.savings || 0)
      const lastLogin = user.systemLogs[0]?.createdAt || user.createdAt

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        isActive: true, // Varsayılan olarak aktif
        lastLogin: lastLogin.toISOString(),
        totalTransactions,
        totalBalance
      }
    })

    await Logger.logApiRequest('/api/users', 'GET', 200, Date.now() - startTime, undefined, undefined)

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      count: formattedUsers.length
    }, { headers: corsHeaders })

  } catch (error: any) {
    console.error('Users API Error:', error)
    await Logger.logError(error as Error, 'GET /api/users', undefined, undefined)
    
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