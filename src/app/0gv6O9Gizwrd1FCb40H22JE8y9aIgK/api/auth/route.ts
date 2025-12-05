import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/jwt'
import { Logger } from '@/lib/logger'
import { corsMiddleware, handleOptions } from '@/lib/cors-middleware'

const prisma = new PrismaClient()

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

    const user = await prisma.user.findUnique({
      where: { email: username }
    })

    if (!user) {
      await Logger.logSecurity('admin_not_found', `User not found for email: ${username}`, ipAddress, userAgent)
      return NextResponse.json({
        success: false,
        error: 'Kullanıcı adı veya şifre hatalı'
      }, { status: 401, headers: corsHeaders })
    }

    const adminUser = await prisma.adminUser.findUnique({
      where: { userId: user.id }
    })

    if (!adminUser) {
      await Logger.logSecurity('admin_auth_failed', `User ${username} is not an admin`, ipAddress, userAgent)
      return NextResponse.json({
        success: false,
        error: 'Bu hesabın yönetici yetkisi yok'
      }, { status: 403, headers: corsHeaders })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    
    if (!isPasswordValid) {
      await Logger.logSecurity('invalid_password', `Invalid password attempt for username: ${username}`, ipAddress, userAgent)
      return NextResponse.json({
        success: false,
        error: 'Kullanıcı adı veya şifre hatalı'
      }, { status: 401, headers: corsHeaders })
    }

    const token = generateToken({
      id: user.id,
      userId: user.id,
      adminId: adminUser.id,
      username: user.email,
      email: user.email,
      role: adminUser.role || 'admin'
    })

    await Logger.logAdminAction(adminUser.id, 'admin_login', 'Admin successfully logged in', {
      username: user.email,
      loginTime: new Date().toISOString()
    })

    await Logger.logApiRequest('/api/auth', 'POST', 200, Date.now() - startTime, undefined, adminUser.id)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.email,
          email: user.email,
          name: user.fullName,
          role: adminUser.role || 'admin',
        },
        token
      },
      message: 'Giriş başarılı'
    }, { headers: corsHeaders })

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
