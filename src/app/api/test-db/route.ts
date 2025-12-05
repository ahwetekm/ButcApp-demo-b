import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('Testing SQLite connection and database...')
    
    // Test 1: Check if we can connect to SQLite
    const userCount = await db.user.count()
    console.log('SQLite connection test - user count:', userCount)
    
    // Test 2: Check table structure by testing queries
    const investmentCount = await db.investment.count()
    console.log('Investment count:', investmentCount)
    
    const blogPostCount = await db.blogPost.count()
    console.log('Blog post count:', blogPostCount)
    
    // Test 3: Try to insert a test record
    const testUser = await db.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'test-hash',
        fullName: 'Test User'
      }
    })
    
    console.log('Test user created:', testUser.id)
    
    // Clean up test record
    await db.user.delete({
      where: {
        id: testUser.id
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'SQLite connection and database are working correctly',
      stats: {
        users: userCount,
        investments: investmentCount,
        blogPosts: blogPostCount
      },
      connectionTest: 'OK',
      insertTest: 'OK',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}