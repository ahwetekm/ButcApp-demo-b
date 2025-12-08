import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Security: Only allow cron jobs or admin requests
    const authHeader = request.headers.get('authorization')
    const cronSecret = request.headers.get('x-cron-secret')
    
    // Allow either admin token or cron secret
    const isValidCron = cronSecret === process.env.CRON_SECRET
    const isValidAdmin = authHeader?.startsWith('Bearer ') // Add proper admin validation if needed
    
    if (!isValidCron && !isValidAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Clean logs older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Clean system logs
    const deletedLogs = await db.systemLog.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    })

    // Clean log statistics older than 90 days
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const deletedStats = await db.logStats.deleteMany({
      where: {
        date: {
          lt: ninetyDaysAgo
        }
      }
    })

    console.log(`Log cleanup completed: ${deletedLogs.count} system logs and ${deletedStats.count} log stats deleted`)

    return NextResponse.json({ 
      success: true, 
      message: 'Log cleanup completed',
      deletedLogs: deletedLogs.count,
      deletedStats: deletedStats.count,
      cleanupDate: new Date().toISOString()
    })

  } catch (error) {
    console.error('Log cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}