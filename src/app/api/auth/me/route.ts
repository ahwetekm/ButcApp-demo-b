import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'

export async function GET(request: NextRequest) {
  console.log('=== AUTH ME API DEBUG ===')
  console.log('Timestamp:', new Date().toISOString())
  console.log('Environment:', process.env.NODE_ENV)
  
  try {
    const authHeader = request.headers.get('authorization')
    console.log('Auth header:', authHeader)
    
    const user = await AuthService.getCurrentUserFromRequest(request)
    console.log('User from AuthService:', user)

    if (!user) {
      console.log('No user found')
      return NextResponse.json({
        success: false,
        error: 'Oturum bulunamadı',
        debug: {
          environment: process.env.NODE_ENV,
          authHeader: authHeader
        }
      }, { status: 401 })
    }

    console.log('User found:', user.email)
    const response = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl
      },
      debug: {
        environment: process.env.NODE_ENV,
        authHeader: authHeader
      }
    }

    console.log('Response:', response)
    console.log('=== END AUTH ME DEBUG ===')

    return NextResponse.json(response)

  } catch (error) {
    console.error('=== AUTH ME ERROR ===')
    console.error('Error:', error)
    console.error('Error message:', (error as Error).message)
    console.error('Error stack:', (error as Error).stack)
    console.error('=== END AUTH ME ERROR ===')
    
    return NextResponse.json({
      success: false,
      error: 'Kullanıcı bilgileri alınamadı',
      details: (error as Error).message,
      debug: {
        environment: process.env.NODE_ENV,
        errorStack: (error as Error).stack
      }
    }, { status: 500 })
  }
}