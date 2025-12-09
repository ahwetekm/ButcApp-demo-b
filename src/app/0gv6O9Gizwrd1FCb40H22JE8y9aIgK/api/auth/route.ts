import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const { username, password, captchaAnswer } = await request.json()

    console.log('Admin Auth API: Login attempt', { username, hasPassword: !!password })

    // Temporary admin credentials for testing
    const validCredentials = [
      { username: 'admin', password: 'admin123', role: 'admin', email: 'admin@butcapp.com' },
      { username: 'demo', password: 'demo123', role: 'admin', email: 'demo@butcapp.com' }
    ]

    const user = validCredentials.find(cred => cred.username === username && cred.password === password)

    if (!user) {
      console.log('Admin Auth API: Invalid credentials')
      return NextResponse.json({
        success: false,
        error: 'Kullanıcı adı veya şifre hatalı'
      }, { status: 401 })
    }

    // Generate JWT token
    const token = await generateToken({
      id: user.username,
      username: user.username,
      email: user.email,
      role: user.role
    })

    console.log('Admin Auth API: Login successful', { username, role: user.role })

    const userData = {
      id: user.username,
      username: user.username,
      email: user.email,
      name: user.username,
      role: user.role,
      lastLogin: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        token: token
      }
    })

  } catch (error) {
    console.error('Admin Auth API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Giriş sırasında bir hata oluştu'
    }, { status: 500 })
  }
}