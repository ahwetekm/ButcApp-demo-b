import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { db } from '@/lib/db'

// DELETE - Delete a specific note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  try {
    const authResult = await AuthService.verifyTokenForAPI(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { noteId } = params

    // Delete the note (only if it belongs to the current user)
    const deletedNote = await db.userData.deleteMany({
      where: { 
        id: noteId,
        userId: authResult.user.id,
        type: 'note'
      }
    })

    if (deletedNote.count === 0) {
      return NextResponse.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}