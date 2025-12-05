import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId parameter is required'
      }, { status: 400 })
    }

    // Check if user can access this data (only their own data)
    if (auth.user.id !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Forbidden'
      }, { status: 403 })
    }

    // Get user profile with balance information
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId }
    })

    if (!userProfile) {
      // Create default profile if not exists
      const newProfile = await prisma.userProfile.create({
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

    if (!body.userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required'
      }, { status: 400 })
    }

    // Check if user can update this data (only their own data)
    if (auth.user.id !== body.userId) {
      return NextResponse.json({
        success: false,
        error: 'Forbidden'
      }, { status: 403 })
    }

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: body.userId },
      update: {
        cash: parseFloat(body.cash) || 0,
        bank: parseFloat(body.bank) || 0,
        savings: parseFloat(body.savings) || 0
      },
      create: {
        userId: body.userId,
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