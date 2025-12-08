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

// GET - Fetch user's recurring transactions
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Use authenticated user's ID
    const userId = auth.user.id

    const recurringTransactions = await db.userData.findMany({
      where: { 
        userId,
        type: 'recurring'
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: recurringTransactions
    })

  } catch (error) {
    console.error('Error fetching recurring transactions:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// POST - Add new recurring transaction
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()

    // Use authenticated user's ID
    const userId = auth.user.id

    if (!body.type || !body.amount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: type, amount'
      }, { status: 400 })
    }

    const recurringTransaction = await db.userData.create({
      data: {
        userId,
        type: 'recurring',
        amount: parseFloat(body.amount),
        description: body.description || '',
        category: body.category || '',
        frequency: body.frequency,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        // Add other recurring-specific fields
      }
    })

    return NextResponse.json({
      success: true,
      data: recurringTransaction
    })

  } catch (error) {
    console.error('Error adding recurring transaction:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT - Update recurring transaction
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const updatedData = await request.json()
    const { id, ...updateFields } = updatedData

    const updatedTransaction = await db.userData.update({
      where: { 
        id: id,
        userId: auth.user.id 
      },
      data: {
        ...updateFields,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedTransaction
    })

  } catch (error) {
    console.error('Error updating recurring transaction:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}