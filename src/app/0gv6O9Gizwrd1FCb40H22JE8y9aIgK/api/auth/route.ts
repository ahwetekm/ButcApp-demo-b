import { NextRequest, NextResponse } from 'next/server'
import { db, users, adminUsers } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/jwt'
import { Logger } from '@/lib/logger'
import { corsMiddleware, handleOptions } from '@/lib/cors-middleware'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const optionsResponse = handleOptions(request)
  if (optionsResponse) return optionsResponse
  const corsHeaders = corsMiddleware(request)
  const startTime = Date.now()
  const headersList = request.headers
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  try {
    const { username, password, captchaAnswer } = await request.json()

    if (!username || !password) {
      await Logger.logSecurity('auth_validation_failed', 'Missing username or password', ipAddress, userAgent)
      return NextResponse.json({
        success: false,
        error: 'Kullanıcı adı ve şifre zorunludur'
      }, { status: 400, headers: corsHeaders })
    }

    /*
    if (!captchaAnswer || !/^\d+$/.test(captchaAnswer.trim())) {
        await Logger.logSecurity('auth_validation_failed', 'Invalid CAPTCHA', ipAddress, userAgent)
        return NextResponse.json({
            success: false,
            error: 'Geçersiz doğrulama cevabı'
        }, { status: 400, headers: corsHeaders });
    }
    */

    // Drizzle ile kullanıcı bul
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, username))
      .limit(1)

    if (user.length === 0) {
      await Logger.logSecurity('admin_not_found', `User not found for email: ${username}`, ipAddress, userAgent)
      return NextResponse.json({
        success: false,
        error: 'Kullanıcı adı veya şifre hatalı'
      }, { status: 401, headers: corsHeaders })
    }

    // Admin kullanıcısını kontrol et
    const adminUser = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.userId, user[0].id))
      .limit(1)

    if (adminUser.length === 0) {
      await Logger.logSecurity('admin_auth_failed', `User ${username} is not an admin`, ipAddress, userAgent)
      return NextResponse.json({
        success: false,
        error: 'Bu hesabın yönetici yetkisi yok'
      }, { status: 403, headers: corsHeaders })
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].passwordHash)
    
    if (!isPasswordValid) {
      await Logger.logSecurity('invalid_password', `Invalid password attempt for username: ${username}`, ipAddress, userAgent)
      return NextResponse.json({
        success: false,
        error: 'Kullanıcı adı veya şifre hatalı'
      }, { status: 401, headers: corsHeaders })
    }

    const tokenPayload = {
      id: user[0].id,
      userId: user[0].id,
      adminId: adminUser[0].id,
      username: user[0].email,
      email: user[0].email,
      role: adminUser[0].role || 'admin'
    }

    console.log('Generating token with payload:', tokenPayload)
    const token = await generateToken(tokenPayload)
    console.log('Generated token:', token)

    await Logger.logAdminAction(adminUser[0].id, 'admin_login', 'Admin successfully logged in', {
      username: user[0].email,
      loginTime: new Date().toISOString()
    })

    await Logger.logApiRequest('/api/auth', 'POST', 200, Date.now() - startTime, undefined, adminUser[0].id)

    const responseData = {
      success: true,
      data: {
        user: {
          id: user[0].id,
          username: user[0].email,
          email: user[0].email,
          name: user[0].fullName,
          role: adminUser[0].role || 'admin',
        },
        token
      },
      message: 'Giriş başarılı'
    }

    console.log('Sending response:', responseData)

    return NextResponse.json(responseData, { headers: corsHeaders })

  } catch (error: any) {
    console.error('Auth API Error:', error)
    await Logger.logError(error as Error, 'POST /api/auth', undefined, undefined)
    
    return NextResponse.json({
      success: false,
      error: 'Giriş işlemi sırasında bir hata oluştu: ' + error.message
    }, { status: 500, headers: corsHeaders })
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}