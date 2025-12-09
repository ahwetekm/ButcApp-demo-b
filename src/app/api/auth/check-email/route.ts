import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const headersList = request.headers
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'
  
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'E-posta adresi gerekli'
      }, { status: 400 })
    }

    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({
        success: false,
        error: 'Geçersiz e-posta formatı'
      }, { status: 400 })
    }

    console.log('Checking email:', email.toLowerCase().trim())

    // Veritabanında kontrol et
    const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1)

    console.log('Email check result:', existingUser.length > 0 ? 'exists' : 'not found')

    return NextResponse.json({
      success: true,
      exists: existingUser.length > 0
    })

  } catch (error) {
    console.error('Email check error:', error)
    console.error('Error stack:', (error as Error).stack)
    
    return NextResponse.json({
      success: false,
      error: 'Bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}