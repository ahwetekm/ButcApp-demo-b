'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Calendar, Clock, Eye, User, ChevronRight, BookOpen, TrendingUp, PiggyBank, Calculator, GraduationCap, Home, ArrowLeft, Mail, X, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BlogPost, BlogCategory } from '@/types/blog'
import Link from 'next/link'
import Image from 'next/image'

interface BlogListingPageProps {
  initialPosts: BlogPost[]
  categories: BlogCategory[]
}

// Category icons mapping
const categoryIcons: Record<string, any> = {
  'Bütçe Yönetimi': Calculator,
  'Yatırım': TrendingUp,
  'Birikim': PiggyBank,
  'Finansal Okuryazarlık': GraduationCap,
  'default': BookOpen
}

export function BlogListingPage({ initialPosts, categories }: BlogListingPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(initialPosts)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'published_at' | 'view_count' | 'title'>('published_at')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showContactDialog, setShowContactDialog] = useState(false)
  
  // İletişim form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'Öneri'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Form verilerini güncelle
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Formu Formspree ile gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      
      // Formspree'ye gönder
      const response = await fetch('https://formspree.io/f/mzzwpgar', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        setSubmitStatus('success')
        setTimeout(() => {
          setShowContactDialog(false)
          setSubmitStatus('idle')
          // Formu sıfırla
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
            type: 'Öneri'
          })
          form.reset()
        }, 2000)
      } else {
        throw new Error('Form gönderilemedi. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.')
      }
      
    } catch (error) {
      console.error('Form gönderim hatası:', error)
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter and sort posts
  useEffect(() => {
    let filtered = posts

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'view_count':
          return b.view_count - a.view_count
        case 'title':
          return a.title.localeCompare(b.title)
        case 'published_at':
        default:
          return new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime()
      }
    })

    setFilteredPosts(filtered)
  }, [posts, selectedCategory, searchTerm, sortBy])

  // Load more posts
  const loadMore = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const response = await fetch(`/api/local/blog?page=${page + 1}&limit=12`)
      const data = await response.json()

      if (data.success && data.data) {
        setPosts(prev => [...prev, ...data.data])
        setPage(prev => prev + 1)
        setHasMore(data.pagination?.page < data.pagination?.totalPages)
      }
    } catch (error) {
      console.error('Load more error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get category icon
  const getCategoryIcon = (categoryName: string) => {
    return categoryIcons[categoryName] || categoryIcons.default
  }

  // Get category color
  const getCategoryColor = (category: any) => {
    if (typeof category === 'object' && category.color) {
      return category.color
    }
    const foundCategory = categories.find(cat => cat.name === category)
    return foundCategory?.color || '#10b981'
  }

  // Format reading time
  const formatReadingTime = (minutes?: number) => {
    if (!minutes) return '5 dk okuma'
    return `${minutes} dk okuma`
  }

  // Format date
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Finansal Rehberiniz
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Kişisel finans, bütçe yönetimi, yatırım stratejileri ve daha fazlası. 
              Finansal okuryazarlığınızı artırın ve mali hedeflerinize ulaşın.
            </p>
            
            {/* Ana Sayfaya Dönüş Butonu */}
            <div className="flex justify-center mb-8">
              <Link href="/">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white px-6 py-3 text-lg font-medium transition-all duration-300 hover:scale-105 shadow-md"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Ana Sayfaya Dön
                  <Home className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Makalelerde ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 w-full lg:w-48">
                <SelectValue placeholder="Kategori seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="h-12 w-full lg:w-48">
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published_at">En Yeniler</SelectItem>
                <SelectItem value="view_count">En Popüler</SelectItem>
                <SelectItem value="title">Alfabetik</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Blog Grid with Ads */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Sidebar - Ad Space */}
            <div className="hidden lg:block lg:col-span-2">
              <div className="sticky top-8 space-y-6">
                {/* Ad Space 1 */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Reklam Alanı</div>
                  <div className="bg-white dark:bg-gray-700 rounded h-96 flex items-center justify-center">
                    <span className="text-gray-400">160x600</span>
                  </div>
                </div>
                
                {/* Ad Space 2 */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Reklam Alanı</div>
                  <div className="bg-white dark:bg-gray-700 rounded h-64 flex items-center justify-center">
                    <span className="text-gray-400">160x300</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-8">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Henüz makale bulunamadı
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    Filtrelerinizi değiştirmeyi deneyin veya farklı bir arama terimi kullanın.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPosts.map((post) => {
                    const Icon = getCategoryIcon(post.category)
                    const categoryColor = getCategoryColor(post.category_data || post.category)
                    
                    return (
                      <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <CardContent className="p-0">
                          {/* Featured Image */}
                          {post.featured_image && (
                            <div className="relative h-48 overflow-hidden">
                              <Image
                                src={post.featured_image}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-4 left-4">
                                <Badge 
                                  variant="secondary" 
                                  className="bg-white/90 text-black font-medium"
                                >
                                  <Icon className="w-3 h-3 mr-1" />
                                  {post.category_data?.name || post.category}
                                </Badge>
                              </div>
                            </div>
                          )}
                          
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" style={{ direction: 'ltr', textAlign: 'left' }}>
                              <Link href={`/blog/${post.slug}`}>
                                {post.title}
                              </Link>
                            </h3>
                            
                            {post.excerpt && (
                              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3" style={{ direction: 'ltr', textAlign: 'left' }}>
                                {post.excerpt}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>{post.author_name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatReadingTime(post.reading_time)}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{post.view_count}</span>
                              </div>
                            </div>
                            
                            {post.published_at && (
                              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(post.published_at)}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-12">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  >
                    {loading ? 'Yükleniyor...' : 'Daha Fazla Makale'}
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Right Sidebar - Ad Space */}
            <div className="hidden lg:block lg:col-span-2">
              <div className="sticky top-8 space-y-6">
                {/* Ad Space 3 */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Reklam Alanı</div>
                  <div className="bg-white dark:bg-gray-700 rounded h-96 flex items-center justify-center">
                    <span className="text-gray-400">160x600</span>
                  </div>
                </div>
                
                {/* Ad Space 4 */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Reklam Alanı</div>
                  <div className="bg-white dark:bg-gray-700 rounded h-64 flex items-center justify-center">
                    <span className="text-gray-400">160x300</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Banner Ad */}
      <section className="bg-gray-100 dark:bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Reklam Alanı</div>
            <div className="bg-white dark:bg-gray-700 rounded-lg h-24 flex items-center justify-center">
              <span className="text-gray-400">970x90</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Home Button */}
      <section className="bg-white dark:bg-gray-950 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <Link href="/">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <Home className="mr-2 w-5 h-5" />
                Ana Sayfaya Dön
                <ArrowLeft className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ButcApp
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            © 2024 ButcApp. Tüm hakları saklıdır.
          </p>
          
          {/* İletişim Linki */}
          <div className="flex justify-center">
            <Button 
              onClick={() => setShowContactDialog(true)}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105"
            >
              <Mail className="mr-2 w-4 h-4" />
              İletişim
            </Button>
          </div>
        </div>
      </footer>

      {/* İletişim Dialog */}
      {showContactDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  İletişim
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowContactDialog(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adınız
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="Adınızı girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    E-posta
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="eposta@adresiniz.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Konu
                  </label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="Mesajınızın konusu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mesajınız
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Mesajınızı buraya yazın..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {submitStatus === 'success' && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Mesajınız gönderildi!
                      </div>
                    )}
                    {submitStatus === 'error' && (
                      <div className="text-red-600">
                        Gönderim başarısız. Lütfen tekrar deneyin.
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 w-4 h-4" />
                        Gönder
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}