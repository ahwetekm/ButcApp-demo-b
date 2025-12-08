import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 })
    }

    // Check if user exists and is admin
    const adminUser = await db.adminUser.findUnique({
      where: {
        user: {
          email: email.toLowerCase().trim()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true
          }
        }
      }
    })

    if (!adminUser) {
      return NextResponse.json({
        success: false,
        error: 'Admin user not found'
      }, { status: 404 })
    }

    // Generate admin token
    const jwt = await import('jsonwebtoken')
    const JWT_SECRET = process.env.JWT_SECRET || 'butcapp-secret-key-change-in-production-2024'
    const token = jwt.sign(
      { 
        userId: adminUser.user.id, 
        email: adminUser.user.email,
        role: 'admin'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    return NextResponse.json({
      success: true,
      data: {
        adminUser: {
          id: adminUser.user.id,
          email: adminUser.user.email,
          fullName: adminUser.user.fullName,
          role: adminUser.role
        },
        token
      }
    }, {
      headers: {
        'Set-Cookie': `auth-token=${token}; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax`
      }
    })

  } catch (error) {
    console.error('Admin access API Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Admin access failed: ' + (error as Error).message
    }, { status: 500 })
  }
}