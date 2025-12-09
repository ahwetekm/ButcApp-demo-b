import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('=== DEBUG SIGNUP API ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database URL:', process.env.DATABASE_URL);
  console.log('Working Directory:', process.cwd());
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { email, password, fullName } = body;
    const captchaAnswer = body.captchaAnswer;

    if (!email || !password) {
      console.log('Missing required fields');
      return NextResponse.json({
        success: false,
        error: 'E-posta ve şifre gerekli',
        debug: {
          environment: process.env.NODE_ENV,
          databaseUrl: process.env.DATABASE_URL,
          workingDirectory: process.cwd(),
          hasEmail: !!email,
          hasPassword: !!password
        }
      }, { status: 400 })
    }

    // CAPTCHA doğrulaması
    if (!captchaAnswer || captchaAnswer.trim() === '') {
      console.log('Missing CAPTCHA');
      return NextResponse.json({
        success: false,
        error: 'İnsan doğrulaması gereklidir',
        debug: {
          environment: process.env.NODE_ENV,
          hasCaptcha: !!captchaAnswer
        }
      }, { status: 400 })
    }

    // Basit CAPTCHA doğrulaması
    if (!/^\d+$/.test(captchaAnswer.trim())) {
      console.log('Invalid CAPTCHA format:', captchaAnswer);
      return NextResponse.json({
        success: false,
        error: 'Geçersiz doğrulama cevabı',
        debug: {
          environment: process.env.NODE_ENV,
          captchaAnswer: captchaAnswer
        }
      }, { status: 400 })
    }

    console.log('Processing signup for email:', email.toLowerCase().trim());

    // Import services here to avoid circular dependency issues
    const { AuthService } = await import('@/lib/auth-service');

    const result = await AuthService.signUp(email, password, fullName);

    console.log('AuthService result:', result);

    if (result.error) {
      console.log('Signup failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
        debug: {
          environment: process.env.NODE_ENV,
          databaseUrl: process.env.DATABASE_URL,
          workingDirectory: process.cwd(),
          authError: result.error
        }
      }, { status: 400 })
    }

    const response = {
      success: true,
      user: result.user,
      token: result.token,
      message: 'Kayıt başarılı! Hoş geldiniz.',
      debug: {
        environment: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL,
        workingDirectory: process.cwd(),
        userId: result.user?.id
      }
    };

    console.log('Signup successful:', response);
    console.log('=== END DEBUG SIGNUP ===');

    return NextResponse.json(response);

  } catch (error) {
    console.error('=== SIGNUP ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', (error as Error).message);
    console.error('Error stack:', (error as Error).stack);
    console.error('=== END SIGNUP ERROR ===');
    
    return NextResponse.json({
      success: false,
      error: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.',
      details: (error as Error).message,
      debug: {
        environment: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL,
        workingDirectory: process.cwd(),
        errorStack: (error as Error).stack
      }
    }, { status: 500 })
  }
}