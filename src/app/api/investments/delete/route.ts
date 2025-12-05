import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { db } from '@/lib/db'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Investment ID is required'
      }, { status: 400 })
    }

    // Verify user authentication
    const authResult = await AuthService.verifyTokenForAPI(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // First check if investment belongs to the current user
    const investment = await db.investment.findUnique({
      where: { 
        id: id,
        userId: authResult.user.id 
      }
    })

    if (!investment) {
      return NextResponse.json({
        success: false,
        error: 'Investment not found or access denied'
      }, { status: 404 })
    }

    // Delete the investment
    await db.investment.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Investment deleted successfully',
      data: { id }
    })

  } catch (error) {
    console.error('Delete investment API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}