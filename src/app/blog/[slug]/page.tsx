import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogDetailPage } from '../components/BlogDetailPage'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    // Await params as required by Next.js 15
    const resolvedParams = await params
    const slug = resolvedParams.slug
    
    // Local SQLite database'den post verisini çek
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/local/blog/${slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return {
        title: 'Makale Bulunamadı - ButcApp Blog',
        description: 'Aradığınız makale bulunamadı.',
      }
    }
    
    const data = await response.json()
    
    if (!data.success || !data.post) {
      return {
        title: 'Makale Bulunamadı - ButcApp Blog',
        description: 'Aradığınız makale bulunamadı.',
      }
    }
    
    const post = data.post

    return {
      title: `${post.title} | ButcApp Blog`,
      description: post.meta_description || post.excerpt || `${post.title} hakkında detaylı bilgi.`,
      keywords: [
        ...(post.meta_keywords || []),
        ...(post.tags || []),
        'ButcApp',
        'finansal blog',
        'kişisel finans'
      ].join(', '),
      authors: [post.author_name],
      openGraph: {
        title: post.title,
        description: post.meta_description || post.excerpt || `${post.title} hakkında detaylı bilgi.`,
        type: 'article',
        publishedTime: post.published_at,
        modifiedTime: post.updated_at,
        author: post.author_name,
        images: post.featured_image ? [
          {
            url: post.featured_image,
            width: 1200,
            height: 630,
            alt: post.title
          }
        ] : [
          {
            url: '/og-image.png',
            width: 1200,
            height: 630,
            alt: 'ButcApp Blog'
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.meta_description || post.excerpt || `${post.title} hakkında detaylı bilgi.`,
        images: post.featured_image ? [
          {
            url: post.featured_image,
            width: 1200,
            height: 630,
            alt: post.title
          }
        ] : [
          {
            url: '/og-image.png',
            width: 1200,
            height: 630,
            alt: 'ButcApp Blog'
          }
        ]
      },
      alternates: {
        canonical: `/blog/${slug}`
      }
    }
  } catch (error) {
    console.error('Metadata generation error:', error)
    return {
      title: 'Blog - ButcApp',
      description: 'ButcApp Finansal Blog'
    }
  }
}

// Fetch blog post data
async function getBlogPost(slug: string) {
  try {
    // Local SQLite database'den post verisini çek
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/local/blog/${slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    
    if (!data.success || !data.post) {
      return null
    }
    
    return data.post
  } catch (error) {
    console.error('Blog post fetch error:', error)
    return null
  }
}

// Fetch related posts
async function getRelatedPosts(currentPostId: string, category: string) {
  try {
    // Local SQLite database'den ilgili post'ları çek
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/local/blog?category=${category}&limit=3`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    
    if (!data.success || !data.data) {
      return []
    }
    
    // Mevcut post'u çıkar
    return data.data.filter((post: any) => post.id !== currentPostId)

  } catch (error) {
    console.error('Related posts error:', error)
    return []
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  // Await params as required by Next.js 15
  const resolvedParams = await params
  const slug = resolvedParams.slug
  
  const post = await getBlogPost(slug)
  const relatedPosts = post ? await getRelatedPosts(post.id, post.category) : []

  if (!post) {
    notFound()
  }

  return <BlogDetailPage post={post} relatedPosts={relatedPosts} />
}