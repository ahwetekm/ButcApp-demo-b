import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://dfiwgngtifuqrrxkvknn.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmaXdnbmd0aWZ1cXJyeGt2a25uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI3NzMyMSwiZXhwIjoyMDgwODUzMzIxfQ.uCfJ5DzQ2QCiyXycTrHEaKh1EvAFbuP8HBORmBSPbX8";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('status', 'published')

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    if (featured === 'true') {
      query = query.eq('featured', true)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`)
    }

    // Apply sorting and pagination
    query = query
      .order('createdat', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: posts, error, count } = await query

    if (error) {
      console.error('Blog posts fetch error:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch blog posts' 
      }, { status: 500 })
    }

    // Transform posts to match frontend interface
    const transformedPosts = (posts || []).map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.cover_image,
      category: post.category,
      author: {
        name: post.author_name || 'ButcApp Team',
        avatar: post.author_avatar || '/images/default-avatar.png',
        bio: post.author_bio || 'Finansal okuryazarlık uzmanları'
      },
      publishedAt: post.createdat,
      updatedAt: post.updatedat,
      readingTime: post.reading_time || Math.ceil(post.content?.length / 1000) || 5,
      featured: post.featured || false,
      tags: post.tags ? post.tags.split(',').map((tag: string) => tag.trim()) : [],
      views: post.views || 0,
      likes: post.likes || 0,
      status: post.status
    }))

    return NextResponse.json({
      success: true,
      data: transformedPosts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Blog API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.content || !body.excerpt) {
      return NextResponse.json({ 
        success: false,
        error: 'Title, content, and excerpt are required' 
      }, { status: 400 })
    }

    // Generate slug from title
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Create blog post
    const blogPost = {
      id: `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: body.title.trim(),
      slug: slug,
      excerpt: body.excerpt.trim(),
      content: body.content.trim(),
      cover_image: body.coverImage || '',
      category: body.category || 'genel',
      author_name: body.author?.name || 'ButcApp Team',
      author_avatar: body.author?.avatar || '/images/default-avatar.png',
      author_bio: body.author?.bio || 'Finansal okuryazarlık uzmanları',
      featured: body.featured || false,
      tags: body.tags ? (Array.isArray(body.tags) ? body.tags.join(',') : body.tags) : '',
      reading_time: body.readingTime || Math.ceil(body.content.length / 1000),
      status: body.status || 'published',
      views: 0,
      likes: 0,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString()
    }

    const { data: newPost, error } = await supabase
      .from('blog_posts')
      .insert([blogPost])
      .select()
      .single()

    if (error) {
      console.error('Blog post creation error:', error)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to create blog post' 
      }, { status: 500 })
    }

    // Transform response
    const transformedPost = {
      id: newPost.id,
      title: newPost.title,
      slug: newPost.slug,
      excerpt: newPost.excerpt,
      content: newPost.content,
      coverImage: newPost.cover_image,
      category: newPost.category,
      author: {
        name: newPost.author_name,
        avatar: newPost.author_avatar,
        bio: newPost.author_bio
      },
      publishedAt: newPost.createdat,
      updatedAt: newPost.updatedat,
      readingTime: newPost.reading_time,
      featured: newPost.featured,
      tags: newPost.tags ? newPost.tags.split(',').map((tag: string) => tag.trim()) : [],
      views: newPost.views,
      likes: newPost.likes,
      status: newPost.status
    }

    return NextResponse.json({ 
      success: true,
      message: 'Blog post created successfully',
      data: transformedPost 
    }, { status: 201 })

  } catch (error) {
    console.error('Blog API error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 })
  }
}