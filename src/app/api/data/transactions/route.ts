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

// GET /api/data/transactions - Fetch user transactions
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Use authenticated user's ID instead of requiring userId parameter
    const userId = auth.user.id
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = { userId, type: { in: ['income', 'expense', 'transfer'] } }

    const transactions = await db.userData.findMany({
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

    // Use authenticated user's ID instead of requiring userId parameter
    const userId = auth.user.id

    if (!body.type || !body.amount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: type, amount'
      }, { status: 400 })
    }

    const transaction = await db.userData.create({
      data: {
        userId,
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