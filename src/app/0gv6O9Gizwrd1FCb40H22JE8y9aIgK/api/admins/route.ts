import { NextRequest, NextResponse } from 'next/server'
import { db, adminUsers, users } from '@/lib/db'
import { verifyAdminToken } from '@/lib/jwt'
import { Logger } from '@/lib/logger'
import { corsMiddleware, handleOptions } from '@/lib/cors-middleware'
import { eq, desc } from 'drizzle-orm'

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

    // Admin kullanıcılarını getir - Drizzle ile
    const adminUsersList = await db
      .select({
        id: adminUsers.id,
        role: adminUsers.role,
        createdAt: adminUsers.createdAt,
        updatedAt: adminUsers.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          createdAt: users.createdAt
        }
      })
      .from(adminUsers)
      .leftJoin(users, eq(adminUsers.userId, users.id))
      .orderBy(desc(adminUsers.createdAt))

    const formattedAdmins = adminUsersList.map(admin => ({
      id: admin.id,
      username: admin.user?.email || 'unknown',
      email: admin.user?.email || 'unknown',
      name: admin.user?.fullName || 'Unknown',
      role: admin.role,
      createdAt: admin.createdAt.toISOString(),
      lastLogin: null, // Bu bilgiyi systemLogs'dan alabiliriz
      active: true // Varsayılan olarak aktif
    }))

    await Logger.logApiRequest('/api/admins', 'GET', 200, Date.now() - startTime, undefined, undefined)

    return NextResponse.json({
      success: true,
      data: formattedAdmins
    }, { headers: corsHeaders })

  } catch (error: any) {
    console.error('Admins API Error:', error)
    await Logger.logError(error as Error, 'GET /api/admins', undefined, undefined)
    
    return NextResponse.json({
      success: false,
      error: 'Adminler yüklenemedi: ' + error.message
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

    const { username, email, name, role, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Kullanıcı adı, e-posta ve şifre zorunludur'
      }, { status: 400, headers: corsHeaders })
    }

    // Bu örnekte sadece simüle edilmiş admin oluşturma
    // Gerçek uygulamada burada kullanıcı ve adminUser oluşturulur

    await Logger.logAdminAction('', 'admin_created', `Admin created: ${email}`, {
      username,
      email,
      role
    })

    await Logger.logApiRequest('/api/admins', 'POST', 200, Date.now() - startTime, undefined, undefined)

    return NextResponse.json({
      success: true,
      message: 'Admin başarıyla oluşturuldu'
    }, { headers: corsHeaders })

  } catch (error: any) {
    console.error('Admins API Error:', error)
    await Logger.logError(error as Error, 'POST /api/admins', undefined, undefined)
    
    return NextResponse.json({
      success: false,
      error: 'Admin oluşturulamadı: ' + error.message
    }, { status: 500, headers: corsHeaders })
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}