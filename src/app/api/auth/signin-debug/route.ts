import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('=== AUTH SIGNIN DEBUG ===')
  console.log('Timestamp:', new Date().toISOString())
  console.log('Environment:', process.env.NODE_ENV)
  
  try {
    const body = await request.json()
    console.log('Request body:', body)
    
    const { email, password, captchaAnswer } = body

    if (!email || !password) {
      console.log('Missing required fields')
      return NextResponse.json({
        success: false,
        error: 'Email ve şifre zorunludur',
        debug: {
          environment: process.env.NODE_ENV,
          hasEmail: !!email,
          hasPassword: !!password
        }
      }, { status: 400 })
    }

    // CAPTCHA validation
    if (captchaAnswer && !/^\d+$/.test(captchaAnswer.trim())) {
      console.log('Invalid CAPTCHA format:', captchaAnswer)
      return NextResponse.json({
        success: false,
        error: 'Geçersiz doğrulama cevabı',
        debug: {
          environment: process.env.NODE_ENV,
          captchaAnswer: captchaAnswer
        }
      }, { status: 400 })
    }

    console.log('Processing signin for email:', email.toLowerCase().trim())

    // Import AuthService here to avoid circular dependency issues
    const { AuthService } = await import('@/lib/auth-service')

    const result = await AuthService.signIn(email, password)
    console.log('AuthService result:', result)

    if (result.error) {
      console.log('Signin failed:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error,
        debug: {
          environment: process.env.NODE_ENV,
          authError: result.error
        }
      }, { status: 401 })
    }

    const response = {
      success: true,
      user: result.user,
      token: result.token,
      message: 'Giriş başarılı! Hoş geldiniz.',
      debug: {
        environment: process.env.NODE_ENV,
        userId: result.user?.id
      }
    }

    console.log('Signin successful:', response)
    console.log('=== END AUTH SIGNIN DEBUG ===')

    return NextResponse.json(response)

  } catch (error) {
    console.error('=== AUTH SIGNIN ERROR ===')
    console.error('Error:', error)
    console.error('Error message:', (error as Error).message)
    console.error('Error stack:', (error as Error).stack)
    console.error('=== END AUTH SIGNIN ERROR ===')
    
    return NextResponse.json({
      success: false,
      error: 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.',
      details: (error as Error).message,
      debug: {
        environment: process.env.NODE_ENV,
        errorStack: (error as Error).stack
      }
    }, { status: 500 })
  }
}