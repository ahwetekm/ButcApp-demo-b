'use client'

import { useState, useEffect } from 'react'

export function BlogDetailPage({ post, relatedPosts }: any) {
  const [readingProgress, setReadingProgress] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      setReadingProgress(scrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const formatReadingTime = (minutes?: number) => {
    if (!minutes) return '5 dk okuma'
    return `${minutes} dk okuma`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    
    // Use UTC methods to avoid timezone differences between server and client
    const day = date.getUTCDate()
    const month = date.getUTCMonth()
    const year = date.getUTCFullYear()
    
    const monthNames = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ]
    
    return `${day} ${monthNames[month]} ${year}`
  }

  const shareOnTwitter = () => {
    const text = `${post.title} - ${post.excerpt}`
    const url = window.location.href
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  const shareOnFacebook = () => {
    const url = window.location.href
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    const url = window.location.href
    const title = post.title
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank')
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link kopyalandı!')
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const toggleBookmark = () => {
    setBookmarked(!bookmarked)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <div 
          className="h-full bg-green-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Hero Section with Featured Image */}
      <section className="relative">
        {post.featured_image && (
          <div className="relative h-96 md:h-[500px]">
            <img
              src={post.featured_image}
              alt={post.title}
              className="object-cover"
              style={{ width: '100%', height: '100%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="max-w-4xl mx-auto">
                <a href="/blog">
                  <button 
                    className="bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white/30 transition-all duration-300 px-4 py-2 text-lg font-medium"
                    onClick={() => window.history.back()}
                  >
                    ← Blog'a Dön
                  </button>
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-12">
          
          {/* Left Sidebar - Ad Space */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Reklam Alanı</div>
                <div className="bg-white dark:bg-gray-700 rounded h-96 flex items-center justify-center">
                  <span className="text-gray-400">160x600</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <article className="prose prose prose-lg max-w-none" style={{ direction: 'ltr', textAlign: 'left' }}>
              {/* Article Header */}
              <header className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm font-medium rounded-full">
                    Bütçe
                  </span>
                  
                  {post.featured && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-sm font-medium rounded-full">
                      ⭐
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4">👤</span>
                    <span>{post.author_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4">📅</span>
                    <span>{formatDate(post.published_at || post.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4">⏱</span>
                    <span>{formatReadingTime(post.reading_time)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4">👁</span>
                    <span>{post.view_count}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={toggleBookmark}
                    className={bookmarked ? 'bg-green-600 text-white' : 'border border-gray-300 dark:border-gray-600 hover:bg-green-50 hover:text-green-700 px-3 py-2 text-sm font-medium transition-colors duration-300'}
                  >
                    {bookmarked ? '✅ Kaydedildi' : '📖 Kaydet'}
                  </button>

                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 hover:bg-gray-100 px-3 py-2 text-sm font-medium transition-colors duration-300"
                  >
                    <span>📤 Paylaş</span>
                  </button>

                  {showShareMenu && (
                    <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50 min-w-[200px]">
                      <div className="space-y-2">
                        <button
                          onClick={shareOnFacebook}
                          className="w-full justify-start border border-gray-300 dark:border-gray-600 hover:bg-gray-50 hover:bg-gray-100 px-3 py-2 text-sm font-medium transition-colors duration-300"
                        >
                          <span>📘 Facebook</span>
                        </button>
                        <button
                          onClick={shareOnTwitter}
                          className="w-full justify-start border border-gray-300 dark:border-gray-600 hover:bg-gray-50 hover:bg-gray-100 px-3 py-2 text-sm font-medium transition-colors duration-300"
                        >
                          <span>𝕊 Twitter</span>
                        </button>
                        <button
                          onClick={shareOnLinkedIn}
                          className="w-full justify-start border border-gray-300 dark:border-gray-600 hover:bg-gray-50 hover:bg-gray-100 px-3 py-2 text-sm font-medium transition-colors duration-300"
                        >
                          <span>💼 LinkedIn</span>
                        </button>
                        <button
                          onClick={copyLink}
                          className="w-full justify-start border-gray-300 dark:border-gray-600 hover:bg-gray-50 hover:bg-gray-100 px-3 py-2 text-sm font-medium transition-colors duration-300"
                        >
                          <span>📋 Linki Kopyala</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </header>

              {/* Article Content */}
              <div 
                className="prose prose prose-lg max-w-none"
                style={{ direction: 'ltr', textAlign: 'left' }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                  İlgili Makaleler
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost: any) => (
                    <div key={relatedPost.id} className="group hover:shadow-lg transition-all duration-300">
                      <div className="p-6 border border border-gray-200 dark:border-gray-700 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          <a href={`/blog/${relatedPost.slug}`}>
                            {relatedPost.title}
                          </a>
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <span>📈</span>
                            <span>{relatedPost.category}</span>
                          </div>
                            
                          <div className="flex items-center gap-2">
                            <span>📅</span>
                            <span>{formatReadingTime(relatedPost.reading_time)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar - Ad Space */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Reklam Alanı</div>
                <div className="bg-white dark:bg-gray-700 rounded h-96 flex items-center justify-center">
                  <span className="text-gray-400">160x600</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}