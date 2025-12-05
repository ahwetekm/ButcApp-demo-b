import { NextRequest, NextResponse } from 'next/server'
import { Database } from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'

// SQLite connection
const dbPath = path.join(process.cwd(), 'db', 'custom.db')

async function getDb() {
  return open({
    filename: dbPath,
    driver: Database
  })
}

// GET /api/local/blog/categories - Tüm kategorileri getir
export async function GET() {
  try {
    const db = await getDb()
    
    const categories = await db.all(`
      SELECT *, 
             (SELECT COUNT(*) FROM blog_posts WHERE category = blog_categories.name AND status = 'published') as post_count
      FROM blog_categories 
      ORDER BY name
    `)
    
    await db.close()

    return NextResponse.json({
      success: true,
      data: categories || []
    })

  } catch (error) {
    console.error('Blog categories GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}