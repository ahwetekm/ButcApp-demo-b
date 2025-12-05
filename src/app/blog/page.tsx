import { Metadata } from 'next'
import { BlogListingPage } from './components/BlogListingPage'

export const metadata: Metadata = {
  title: 'Finans Rehberi - ButcApp Blog',
  description: 'Kişisel finans, bütçe yönetimi, yatırım stratejileri ve para biriktirme ipuçları. ButcApp ile finansal okuryazarlığınızı artırın.',
  keywords: [
    'finansal blog',
    'bütçe yönetimi',
    'kişisel finans',
    'yatırım tavsiyeleri',
    'para biriktirme',
    'finansal okuryazarlık',
    'butçemi nasıl yönetebilirim'
  ],
  openGraph: {
    title: 'Finans Rehberi - ButcApp Blog',
    description: 'Kişisel finans, bütçe yönetimi, yatırım stratejileri ve para biriktirme ipuçları.',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ButcApp Finans Rehberi'
      }
    ]
  },
  alternates: {
    canonical: '/blog'
  }
}

// Fetch blog posts for SSR
async function getBlogPosts() {
  try {
    // Local SQLite database'den verileri çek
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/local/blog?limit=12`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error('Blog API response error:', response.status)
      return []
    }
    
    const data = await response.json()
    
    if (!data.success) {
      console.error('Blog API error:', data.error)
      return []
    }
    
    return data.data || []

  } catch (error) {
    console.error('Blog page error:', error)
    return []
  }
}

// Fetch categories
async function getCategories() {
  try {
    // Local SQLite database'den kategorileri çek
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/local/blog/categories`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error('Categories API response error:', response.status)
      return []
    }
    
    const data = await response.json()
    
    if (!data.success) {
      console.error('Categories API error:', data.error)
      return []
    }
    
    return data.data || []

  } catch (error) {
    console.error('Categories error:', error)
    return []
  }
}

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getBlogPosts(),
    getCategories()
  ])

  return <BlogListingPage initialPosts={posts} categories={categories} />
}