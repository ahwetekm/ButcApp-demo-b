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

// GET /api/data/transactions - Fetch user transactions
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId parameter is required'
      }, { status: 400 })
    }

    // Check if user can access this data (only their own data, unless admin)
    if (auth.user.id !== userId) {
      // Check if current user is admin
      const adminUser = await prisma.adminUser.findUnique({
        where: { userId: auth.user.id }
      })
      
      if (!adminUser) {
        return NextResponse.json({
          success: false,
          error: 'Forbidden'
        }, { status: 403 })
      }
    }

    const where: any = { userId, type: { in: ['income', 'expense', 'transfer'] } }

    const transactions = await prisma.userData.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: transactions
    })

  } catch (error) {
    console.error('Transactions GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// POST /api/data/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()

    if (!body.userId || !body.type || !body.amount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, type, amount'
      }, { status: 400 })
    }

    // Check if user can create this data (only their own data, unless admin)
    if (auth.user.id !== body.userId) {
      // Check if current user is admin
      const adminUser = await prisma.adminUser.findUnique({
        where: { userId: auth.user.id }
      })
      
      if (!adminUser) {
        return NextResponse.json({
          success: false,
          error: 'Forbidden'
        }, { status: 403 })
      }
    }

    const transaction = await prisma.userData.create({
      data: {
        userId: body.userId,
        type: body.type,
        amount: parseFloat(body.amount),
        description: body.description || '',
        category: body.category || '',
        date: new Date(body.date) || new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: transaction
    })

  } catch (error) {
    console.error('Transactions POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}