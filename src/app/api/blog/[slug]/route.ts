import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://dfiwgngtifuqrrxkvknn.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmaXdnbmd0aWZ1cXJyeGt2a25uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI3NzMyMSwiZXhwIjoyMDgwODUzMzIxfQ.uCfJ5DzQ2QCiyXycTrHEaKh1EvAFbuP8HBORmBSPbX8";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch single blog post by slug
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    // Fetch blog post
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !post) {
      console.error('Blog post fetch error:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Blog post not found' 
      }, { status: 404 })
    }

    // Increment view count
    await supabase
      .from('blog_posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('id', post.id)

    // Transform post to match frontend interface
    const transformedPost = {
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
      views: (post.views || 0) + 1,
      likes: post.likes || 0,
      status: post.status
    }

    // Get related posts
    const { data: relatedPosts } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('category', post.category)
      .eq('status', 'published')
      .neq('id', post.id)
      .order('createdat', { ascending: false })
      .limit(3)

    const transformedRelatedPosts = (relatedPosts || []).map(relatedPost => ({
      id: relatedPost.id,
      title: relatedPost.title,
      slug: relatedPost.slug,
      excerpt: relatedPost.excerpt,
      coverImage: relatedPost.cover_image,
      category: relatedPost.category,
      publishedAt: relatedPost.createdat,
      readingTime: relatedPost.reading_time || Math.ceil(relatedPost.content?.length / 1000) || 5,
      featured: relatedPost.featured || false
    }))

    return NextResponse.json({
      success: true,
      data: transformedPost,
      relatedPosts: transformedRelatedPosts
    })

  } catch (error) {
    console.error('Blog post API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}