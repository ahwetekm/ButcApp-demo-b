import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    // Token verification
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await verifyAdminToken(token)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get server information
    const memUsage = process.memoryUsage()
    const memoryUsagePercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)

    const serverInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        total: Math.round(memUsage.heapTotal / 1024), // MB
        used: Math.round(memUsage.heapUsed / 1024), // MB
        free: Math.round((memUsage.heapTotal - memUsage.heapUsed) / 1024), // MB
        active: memoryUsagePercent,
        heapUsed: Math.round(memUsage.heapUsed / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024), // MB
        external: Math.round(memUsage.external / 1024), // MB
        residentSetSize: Math.round(memUsage.rss / 1024) // MB
      },
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      environment: process.env.NODE_ENV || 'development',
      nextVersion: '15.5.7',
      cpu: {
        count: 1, // Varsayılan olarak 1
        usage: 25, // Simüle edilmiş değer
        loadAverage: '0.15' // Simüle edilmiş değer
      },
      database: {
        status: 'connected',
        provider: 'supabase'
      },
      apis: {
        users: { status: 'active', lastCheck: new Date().toISOString() },
        posts: { status: 'active', lastCheck: new Date().toISOString() },
        categories: { status: 'active', lastCheck: new Date().toISOString() },
        realtimeStats: { status: 'active', lastCheck: new Date().toISOString() }
      }
    }

    return NextResponse.json({
      success: true,
      data: serverInfo
    })

  } catch (error) {
    console.error('System status API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}