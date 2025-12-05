import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/jwt-edge'
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

  const isAdmin = await verifyAdminToken(token)
  if (!isAdmin) {
    return { error: 'Forbidden', status: 403 }
  }

  return { token }
}

// GET /api/investments - Fetch user investments
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')

    const where: any = {}
    if (userId) {
      where.userId = userId
    }
    if (type) {
      where.type = type
    }

    const investments = await prisma.investment.findMany({
      where,
      orderBy: { buyDate: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: investments
    })

  } catch (error) {
    console.error('Investments GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// POST /api/investments - Create new investment
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()

    if (!body.userId || !body.type || !body.symbol || !body.amount || !body.buyPrice) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, type, symbol, amount, buyPrice'
      }, { status: 400 })
    }

    const investment = await prisma.investment.create({
      data: {
        userId: body.userId,
        type: body.type,
        symbol: body.symbol,
        name: body.name || body.symbol,
        amount: parseFloat(body.amount),
        buyPrice: parseFloat(body.buyPrice),
        currentPrice: parseFloat(body.currentPrice) || parseFloat(body.buyPrice),
        currency: body.currency || 'USD',
        buyDate: new Date(body.buyDate) || new Date(),
        notes: body.notes || ''
      }
    })

    return NextResponse.json({
      success: true,
      data: investment
    })

  } catch (error) {
    console.error('Investments POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}