import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { db } from '@/lib/db'

// Authentication middleware
async function authenticate(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.nextUrl.searchParams.get('token')

  if (!token) {
    return { error: 'Unauthorized', status: 401 }
  }

  const user = await AuthService.verifyToken(token)
  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }

  return { user, token }
}

// GET /api/data/balances - Fetch user balances
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Use authenticated user's ID instead of requiring userId parameter
    const userId = auth.user.id

    // Get user profile with balance information
    const userProfile = await db.userProfile.findUnique({
      where: { userId }
    })

    if (!userProfile) {
      // Create default profile if not exists
      const newProfile = await db.userProfile.create({
        data: {
          userId,
          email: '',
          fullName: '',
          cash: 0,
          bank: 0,
          savings: 0
        }
      })

      return NextResponse.json({
        success: true,
        data: newProfile
      })
    }

    return NextResponse.json({
      success: true,
      data: userProfile
    })

  } catch (error) {
    console.error('Balances GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT /api/data/balances - Update user balances
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()

    // Use authenticated user's ID instead of requiring userId parameter
    const userId = auth.user.id

    const updatedProfile = await db.userProfile.upsert({
      where: { userId },
      update: {
        cash: parseFloat(body.cash) || 0,
        bank: parseFloat(body.bank) || 0,
        savings: parseFloat(body.savings) || 0
      },
      create: {
        userId,
        email: body.email || '',
        fullName: body.fullName || '',
        cash: parseFloat(body.cash) || 0,
        bank: parseFloat(body.bank) || 0,
        savings: parseFloat(body.savings) || 0
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedProfile
    })

  } catch (error) {
    console.error('Balances PUT error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}