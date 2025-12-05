import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'E-posta adresi zorunludur'
      }, { status: 400 })
    }

    const result = await AuthService.resetPassword(email)

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama linki e-posta adresinize gönderildi'
    })

  } catch (error) {
    console.error('Auth reset password error:', error)
    return NextResponse.json({
      success: false,
      error: 'Şifre sıfırlama işlemi başarısız oldu'
    }, { status: 500 })
  }
}