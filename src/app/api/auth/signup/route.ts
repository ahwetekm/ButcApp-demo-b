import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { Logger } from '@/lib/logger'
import { userSchema, formatZodError, createValidationResponse } from '@/lib/validators'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const headersList = request.headers
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  try {
    const body = await request.json()
    
    // Validate request body with Zod
    const validationResult = userSchema.safeParse(body)
    if (!validationResult.success) {
      await Logger.logSecurity('signup_validation_failed', 'Validation failed', ipAddress, userAgent)
      return NextResponse.json(
        createValidationResponse(formatZodError(validationResult.error)),
        { status: 400 }
      )
    }

    const { email, password, fullName } = validationResult.data
    const captchaAnswer = body.captchaAnswer

    // CAPTCHA doğrulaması
    if (!captchaAnswer || captchaAnswer.trim() === '') {
      await Logger.logSecurity('signup_validation_failed', 'Missing CAPTCHA', ipAddress, userAgent)
      return NextResponse.json({
        success: false,
        error: 'İnsan doğrulaması gereklidir'
      }, { status: 400 })
    }

    // Basit CAPTCHA doğrulaması - sadece sayı olup olmadığını kontrol et
    if (!/^\d+$/.test(captchaAnswer.trim())) {
      await Logger.logSecurity('signup_validation_failed', 'Invalid CAPTCHA format', ipAddress, userAgent)
      return NextResponse.json({
        success: false,
        error: 'Geçersiz doğrulama cevabı'
      }, { status: 400 })
    }

    const result = await AuthService.signUp(email, password, fullName)

    if (result.error) {
      await Logger.logSecurity('signup_failed', `Signup failed for email: ${email}`, ipAddress, userAgent, {
        email: email,
        error: result.error
      })
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }

    // Log successful user signup
    await Logger.logUserLogin(result.user!.id, ipAddress, userAgent, true)

    await Logger.logApiRequest('/api/auth/signup', 'POST', 201, Date.now() - startTime, result.user!.id, undefined)

    return NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
      message: 'Kayıt başarılı! Hoş geldiniz.'
    })

  } catch (error) {
    console.error('Signup API error:', error)
    console.error('Error stack:', (error as Error).stack)
    
    try {
      await Logger.logError(error as Error, 'POST /api/auth/signup', undefined, undefined)
      await Logger.logApiRequest('/api/auth/signup', 'POST', 500, Date.now() - startTime, undefined, undefined)
    } catch (logError) {
      console.error('Logging failed:', logError)
    }
    
    return NextResponse.json({
      success: false,
      error: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}