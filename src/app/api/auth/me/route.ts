import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUserFromRequest(request)

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Oturum bulunamadı'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({
      success: false,
      error: 'Kullanıcı bilgileri alınamadı'
    }, { status: 500 })
  }
}