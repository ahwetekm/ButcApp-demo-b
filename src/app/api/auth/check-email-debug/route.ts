import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('=== DEBUG CHECK-EMAIL API ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database URL:', process.env.DATABASE_URL);
  console.log('Working Directory:', process.cwd());
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { email } = body;

    if (!email) {
      console.log('Missing email in request');
      return NextResponse.json({
        success: false,
        error: 'E-posta adresi gerekli',
        debug: {
          environment: process.env.NODE_ENV,
          databaseUrl: process.env.DATABASE_URL,
          workingDirectory: process.cwd()
        }
      }, { status: 400 })
    }

    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      console.log('Invalid email format:', email);
      return NextResponse.json({
        success: false,
        error: 'Geçersiz e-posta formatı',
        debug: {
          email: email,
          environment: process.env.NODE_ENV
        }
      }, { status: 400 })
    }

    console.log('Checking email:', email.toLowerCase().trim());

    // Import db here to avoid circular dependency issues
    const { db, users } = await import('@/lib/db');
    const { eq } = await import('drizzle-orm');

    // Veritabanında kontrol et
    const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);

    console.log('Email check result:', existingUser.length > 0 ? 'exists' : 'not found');
    console.log('Query result:', existingUser);

    const response = {
      success: true,
      exists: existingUser.length > 0,
      debug: {
        environment: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL,
        workingDirectory: process.cwd(),
        queryResult: existingUser
      }
    };

    console.log('Response:', response);
    console.log('=== END DEBUG CHECK-EMAIL ===');

    return NextResponse.json(response);

  } catch (error) {
    console.error('=== CHECK-EMAIL ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', (error as Error).message);
    console.error('Error stack:', (error as Error).stack);
    console.error('=== END CHECK-EMAIL ERROR ===');
    
    return NextResponse.json({
      success: false,
      error: 'Bir hata oluştu',
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