import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { db } from '@/lib/db'

// GET - Fetch user's recurring transactions
export async function GET(request: NextRequest) {
  try {
    const authResult = await AuthService.verifyTokenForAPI(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const recurringTransactions = await db.userData.findMany({
      where: { 
        userId: authResult.user.id,
        type: 'recurring'
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(recurringTransactions)

  } catch (error) {
    console.error('Error fetching recurring transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add new recurring transaction
export async function POST(request: NextRequest) {
  try {
    const authResult = await AuthService.verifyTokenForAPI(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const recurringData = await request.json()

    const recurringTransaction = await db.userData.create({
      data: {
        userId: authResult.user.id,
        type: 'recurring',
        amount: recurringData.amount,
        description: recurringData.description,
        category: recurringData.category,
        frequency: recurringData.frequency,
        startDate: new Date(recurringData.startDate),
        endDate: recurringData.endDate ? new Date(recurringData.endDate) : null,
        // Add other recurring-specific fields
      }
    })

    return NextResponse.json(recurringTransaction)

  } catch (error) {
    console.error('Error adding recurring transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update recurring transaction
export async function PUT(request: NextRequest) {
  try {
    const authResult = await AuthService.verifyTokenForAPI(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const updatedData = await request.json()
    const { id, ...updateFields } = updatedData

    const updatedTransaction = await db.userData.update({
      where: { 
        id: id,
        userId: authResult.user.id 
      },
      data: {
        ...updateFields,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedTransaction)

  } catch (error) {
    console.error('Error updating recurring transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}