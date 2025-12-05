'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  FileText, 
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  ChevronDown
} from 'lucide-react'
import { RichTextEditor } from './RichTextEditor'

interface Category {
  name: string
  slug: string
  color: string
  icon: string
}

interface BlogPostFormProps {
  postId?: string
}

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  tags: string
  published: boolean
}

export default function BlogPostForm({ postId }: BlogPostFormProps) {
  const router = useRouter()
  const editorRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    tags: '',
    author_name: '',
    category: '',
    published: false,
    featured: false
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
    fetchCategories()
  }, [postId])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        setError('Admin oturumu bulunamadı. Lütfen giriş yapın.')
        setLoadingCategories(false)
        return
      }

      const response = await fetch('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.success && data.categories) {
        setCategories(data.categories)
      } else {
        // Default kategoriler
        setCategories([
          { name: 'Teknoloji', slug: 'teknoloji', color: '#3b82f6', icon: 'Cpu' },
          { name: 'Yazılım', slug: 'yazilim', color: '#10b981', icon: 'Code' },
          { name: 'İş', slug: 'is', color: '#f59e0b', icon: 'Briefcase' },
          { name: 'Kişisel', slug: 'kisisel', color: '#8b5cf6', icon: 'User' },
          { name: 'Genel', slug: 'genel', color: '#6b7280', icon: 'FileText' }
        ])
      }
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error)
      // Default kategoriler
      setCategories([
        { name: 'Teknoloji', slug: 'teknoloji', color: '#3b82f6', icon: 'Cpu' },
        { name: 'Yazılım', slug: 'yazilim', color: '#10b981', icon: 'Code' },
        { name: 'İş', slug: 'is', color: '#f59e0b', icon: 'Briefcase' },
        { name: 'Kişisel', slug: 'kisisel', color: '#8b5cf6', icon: 'User' },
        { name: 'Genel', slug: 'genel', color: '#6b7280', icon: 'FileText' }
      ])
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchPost = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        setError('Admin oturumu bulunamadı. Lütfen giriş yapın.')
        setLoading(false)
        return
      }

      const response = await fetch(`/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.success && data.post) {
        setFormData({
          title: data.post.title || '',
          slug: data.post.slug || '',
          content: data.post.content || '',
          excerpt: data.post.excerpt || '',
          tags: data.post.tags ? data.post.tags.join(', ') : '',
          author_name: data.post.author_name || '',
          category: data.post.category || '',
          published: data.post.published || false,
          featured: data.post.featured || false
        })
      }
    } catch (error) {
      setError('Blog yazısı yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()
      
      // Upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(progress)
        }
      })

      // Promise wrapper for XMLHttpRequest
      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText)
              if (response.success) {
                resolve(response.url)
              } else {
                reject(new Error(response.error))
              }
            } catch (e) {
              reject(new Error('Yanıt işlenemedi'))
            }
          } else {
            reject(new Error('Yükleme başarısız'))
          }
        }

        xhr.onerror = () => reject(new Error('Ağ hatası'))
        xhr.open('POST', '/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/upload')
        xhr.send(formData)
      })

      const imageUrl = await uploadPromise
      
      // Resmi editor'e ekle
      const imgHtml = `<img src="${imageUrl}" alt="${file.name}" class="max-w-full h-auto rounded-lg shadow-md my-4" />`
      document.execCommand('insertHTML', false, imgHtml)
      
      // Form verisini güncelle (content'i editor'den al)
      if (editorRef.current) {
        setFormData(prev => ({
          ...prev,
          content: editorRef.current.innerHTML
        }))
      }

    } catch (error) {
      console.error('Upload error:', error)
      setError(`Dosya yüklenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSave = async (publish = false) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        setError('Admin oturumu bulunamadı. Lütfen giriş yapın.')
        return
      }

      const url = postId 
        ? `/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/posts/${postId}`
        : '/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/posts'
      
      const method = postId ? 'PUT' : 'POST'
      
      // Form verisini hazırla
      const payload = { 
        ...formData, 
        published: publish,
        status: publish ? 'published' : 'draft'
      }

      console.log('Gönderilen veri:', payload)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      console.log('API yanıtı:', data)

      if (data.success) {
        setSuccess(publish ? 'Yazı başarıyla yayınlandı!' : 'Yazı başarıyla kaydedildi!')
        if (!postId) {
          setTimeout(() => {
            router.push('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/posts')
          }, 2000)
        }
      } else {
        setError(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error)
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSave(formData.published)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-slate-600 dark:text-slate-400">Yazı yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-slate-600 dark:text-slate-400">Sayfa yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri Dön
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {postId ? 'Yazıyı Düzenle' : 'Yeni Blog Yazısı'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {postId ? 'Mevcut yazıyı düzenleyin' : 'Yeni bir blog yazısı oluşturun'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Düzenle' : 'Önizle'}
              </Button>
              <Badge variant={formData.published ? "default" : "secondary"}>
                {formData.published ? "Yayında" : "Taslak"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
            </Alert>
          )}

          {previewMode ? (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Önizleme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <article className="prose prose-slate dark:prose-invert max-w-none" style={{ direction: 'ltr', textAlign: 'left' }}>
                  <h1>{formData.title || 'Başlık Yok'}</h1>
                  {formData.excerpt && (
                    <p className="text-xl text-slate-600 dark:text-slate-400 italic">{formData.excerpt}</p>
                  )}
                  {formData.tags && (
                    <div className="flex flex-wrap gap-2 my-4">
                      {formData.tags.split(',').map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag.trim()}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap" style={{ direction: 'ltr', textAlign: 'left' }}>{formData.content || 'İçerik yok...'}</div>
                </article>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Main Content */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Yazı Detayları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="title">Başlık *</Label>
                      <Input
                        id="title"
                        name="title"
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleTitleChange}
                        placeholder="Blog yazısı başlığı"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug">URL (Slug) *</Label>
                      <Input
                        id="slug"
                        name="slug"
                        type="text"
                        required
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="blog-yazisi-url"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Özet</Label>
                    <Input
                      id="excerpt"
                      name="excerpt"
                      type="text"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      placeholder="Blog yazısının kısa özeti"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Etiketler</Label>
                    <Input
                      id="tags"
                      name="tags"
                      type="text"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="etiket1, etiket2, etiket3"
                      className="mt-1"
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Etiketleri virgülle ayırın
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="author_name">Yazar Adı *</Label>
                      <Input
                        id="author_name"
                        name="author_name"
                        type="text"
                        required
                        value={formData.author_name}
                        onChange={handleInputChange}
                        placeholder="Yazarın adı"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Kategori *</Label>
                      <div className="relative mt-1">
                        <select
                          id="category"
                          name="category"
                          required
                          value={formData.category}
                          onChange={handleInputChange}
                          disabled={loadingCategories}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                        >
                          <option value="">Kategori seçin...</option>
                          {categories.map((category) => (
                            <option key={category.name} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                      {loadingCategories && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Kategoriler yükleniyor...
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        name="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, featured: checked }))
                        }
                      />
                      <Label htmlFor="featured" className="text-sm font-medium">
                        Öne Çıkan Yazı
                      </Label>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Bu yazıyı ana sayfada öne çıkar
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="content">İçerik *</Label>
                    <div className="mt-1">
                      <RichTextEditor
                        value={formData.content}
                        onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                        placeholder="Blog yazısının tam içeriği..."
                        height={500}
                      />
                    </div>
                  </div>

                  {/* Dosya Yükleme */}
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                        Dosya Yükle
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Resim dosyalarını sürükleyip bırakın veya seçin
                      </p>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file)
                        }}
                        disabled={isUploading}
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                            Yükleniyor %{uploadProgress}
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Dosya Seç
                          </>
                        )}
                      </Button>
                      {isUploading && (
                        <div className="mt-3">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      name="published"
                      checked={formData.published}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                    />
                    <Label htmlFor="published">Yayınla</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formData.published ? 'Yazı yayınlanacak' : 'Yazı taslak olarak kaydedilecek'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {formData.published 
                        ? 'Yazı yayınlanacak ve herkes tarafından görülebilecek.'
                        : 'Yazı taslak olarak kaydedilecek ve sadece siz görebileceksiniz.'
                      }
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSave(false)}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Taslak Olarak Kaydet
                      </Button>
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {formData.published ? 'Yayınla' : 'Kaydet ve Yayınla'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}