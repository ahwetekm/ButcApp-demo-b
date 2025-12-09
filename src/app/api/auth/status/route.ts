import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.nextUrl.searchParams.get('token')
    
    if (!token) {
      return NextResponse.json({ 
        success: false,
        error: 'No token provided',
        user: null 
      }, { status: 401 })
    }

    const user = await AuthService.verifyToken(token)
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid token',
        user: null 
      }, { status: 401 })
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Auth status error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      user: null 
    }, { status: 500 })
  }
}