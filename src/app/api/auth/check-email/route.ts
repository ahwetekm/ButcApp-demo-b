import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
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

    // Veritabanında kontrol et
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    return NextResponse.json({
      success: true,
      exists: !!existingUser
    })

  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Bir hata oluştu'
    }, { status: 500 })
  }
}