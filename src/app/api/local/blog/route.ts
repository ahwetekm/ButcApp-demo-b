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

// GET /api/local/blog - Blog post'larını getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured') === 'true'
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'published'
    const sortBy = searchParams.get('sortBy') || 'published_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const db = await getDb()
    
    // Build query
    let whereClause = `WHERE status = ?`
    let params: any[] = [status]
    
    if (category) {
      whereClause += ` AND category = ?`
      params.push(category)
    }
    
    if (featured) {
      whereClause += ` AND featured = 1`
    }
    
    if (search) {
      whereClause += ` AND (title LIKE ? OR content LIKE ? OR excerpt LIKE ?)`
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM blog_posts ${whereClause}`
    const countResult = await db.get(countQuery, params)
    const total = countResult.total

    // Data query
    const offset = (page - 1) * limit
    const dataQuery = `
      SELECT *, 
             (SELECT name FROM blog_categories WHERE name = blog_posts.category) as category_name,
             (SELECT color FROM blog_categories WHERE name = blog_posts.category) as category_color,
             (SELECT icon FROM blog_categories WHERE name = blog_posts.category) as category_icon
      FROM blog_posts 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `
    
    const posts = await db.all(dataQuery, [...params, limit, offset])
    
    await db.close()

    // Parse JSON fields
    const transformedPosts = posts.map(post => ({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      meta_keywords: post.meta_keywords ? JSON.parse(post.meta_keywords) : [],
      category_data: {
        name: post.category_name || post.category,
        slug: post.category?.toLowerCase().replace(/\s+/g, '-'),
        color: post.category_color || '#10b981',
        icon: post.category_icon || 'BookOpen'
      }
    }))

    return NextResponse.json({
      success: true,
      data: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Blog GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

// POST /api/local/blog - Yeni blog post oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.content || !body.author_name || !body.category) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, content, author_name, category'
      }, { status: 400 })
    }

    // Generate slug
    let slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Generate unique ID
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)

    // Calculate reading time
    const wordCount = body.content.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)

    // Prepare data
    const postData = {
      id,
      title: body.title,
      slug,
      excerpt: body.excerpt || '',
      content: body.content,
      featured_image: body.featured_image || '',
      author_name: body.author_name,
      author_avatar: body.author_avatar || '',
      category: body.category,
      tags: JSON.stringify(body.tags || []),
      meta_title: body.meta_title || '',
      meta_description: body.meta_description || '',
      meta_keywords: JSON.stringify(body.meta_keywords || []),
      status: body.status || 'published',
      featured: body.featured ? 1 : 0,
      view_count: 0,
      reading_time: body.reading_time || readingTime,
      published_at: body.status === 'published' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const db = await getDb()
    
    // Check if slug is unique
    const existingPost = await db.get(
      'SELECT id FROM blog_posts WHERE slug = ?',
      [slug]
    )
    
    if (existingPost) {
      slug = `${slug}-${Date.now()}`
      postData.slug = slug
    }

    // Insert post
    const result = await db.run(`
      INSERT INTO blog_posts (
        id, title, slug, excerpt, content, featured_image,
        author_name, author_avatar, category, tags, meta_title,
        meta_description, meta_keywords, status, featured,
        view_count, reading_time, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      postData.id, postData.title, postData.slug, postData.excerpt, postData.content,
      postData.featured_image, postData.author_name, postData.author_avatar, postData.category,
      postData.tags, postData.meta_title, postData.meta_description, postData.meta_keywords,
      postData.status, postData.featured, postData.view_count, postData.reading_time,
      postData.published_at, postData.created_at, postData.updated_at
    ])

    await db.close()

    // Get inserted post
    const newPost = await getDb()
    const insertedPost = await newPost.get('SELECT * FROM blog_posts WHERE id = ?', [postData.id])
    await newPost.close()

    return NextResponse.json({
      success: true,
      post: {
        ...insertedPost,
        tags: JSON.parse(insertedPost.tags || '[]'),
        meta_keywords: JSON.parse(insertedPost.meta_keywords || '[]')
      }
    })

  } catch (error) {
    console.error('Blog POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}