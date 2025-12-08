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

// GET /api/data/notes - Fetch user notes
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

    const where: any = { userId, type: 'note' }

    const notes = await db.userData.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: notes
    })

  } catch (error) {
    console.error('Notes GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// POST /api/data/notes - Create new note
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()

    // Use authenticated user's ID instead of requiring userId parameter
    const userId = auth.user.id

    if (!body.title || !body.content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, content'
      }, { status: 400 })
    }

    const note = await db.userData.create({
      data: {
        userId,
        type: 'note',
        title: body.title,
        content: body.content,
        date: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: note
    })

  } catch (error) {
    console.error('Notes POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}