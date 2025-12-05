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

// GET /api/local/blog/[slug] - Tek blog post getir
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const db = await getDb()
    
    // Get post with category data
    const post = await db.get(`
      SELECT *, 
             (SELECT name FROM blog_categories WHERE name = blog_posts.category) as category_name,
             (SELECT color FROM blog_categories WHERE name = blog_posts.category) as category_color,
             (SELECT icon FROM blog_categories WHERE name = blog_posts.category) as category_icon
      FROM blog_posts 
      WHERE slug = ? AND status = 'published'
    `, [slug])

    if (!post) {
      await db.close()
      return NextResponse.json({
        success: false,
        error: 'Blog post not found'
      }, { status: 404 })
    }

    // Increment view count
    await db.run(
      'UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?',
      [post.id]
    )

    // Track analytics
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referrer = request.headers.get('referer') || null

    await db.run(`
      INSERT INTO blog_analytics (id, post_id, ip_address, user_agent, referrer, viewed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      Date.now().toString() + Math.random().toString(36).substr(2, 9),
      post.id,
      clientIP,
      userAgent,
      referrer,
      new Date().toISOString()
    ])

    await db.close()

    // Parse JSON fields
    const transformedPost = {
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      meta_keywords: post.meta_keywords ? JSON.parse(post.meta_keywords) : [],
      category_data: {
        name: post.category_name || post.category,
        slug: post.category?.toLowerCase().replace(/\s+/g, '-'),
        color: post.category_color || '#10b981',
        icon: post.category_icon || 'BookOpen'
      }
    }

    return NextResponse.json({
      success: true,
      post: transformedPost
    })

  } catch (error) {
    console.error('Blog post GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}