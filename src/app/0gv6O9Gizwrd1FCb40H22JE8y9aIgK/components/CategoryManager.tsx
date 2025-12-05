'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  postCount?: number
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        setError('Admin oturumu bulunamadı. Lütfen giriş yapın.')
        setLoading(false)
        return
      }

      const response = await fetch('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.categories || [])
      } else {
        setError('Kategoriler yüklenemedi: ' + (data.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      setError('Kategoriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        setError('Admin oturumu bulunamadı. Lütfen giriş yapın.')
        return
      }

      const url = editingCategory 
        ? `/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/categories/${editingCategory.id}`
        : '/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(editingCategory ? 'Kategori güncellendi!' : 'Kategori oluşturuldu!')
        setShowDialog(false)
        setEditingCategory(null)
        setFormData({ name: '', slug: '', description: '' })
        fetchCategories()
      } else {
        setError(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    })
    setShowDialog(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      
      if (!token) {
        setError('Admin oturumu bulunamadı. Lütfen giriş yapın.')
        return
      }

      const response = await fetch(`/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()

      if (data.success) {
        setCategories(categories.filter(cat => cat.id !== categoryId))
        setSuccess('Kategori silindi!')
      } else {
        setError(data.error || 'Kategori silinemedi')
      }
    } catch (error) {
      setError('Kategori silinemedi')
    }
  }

  const openDialog = () => {
    setEditingCategory(null)
    setFormData({ name: '', slug: '', description: '' })
    setShowDialog(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Kategori Yönetimi</h3>
        <Button onClick={openDialog} className="bg-gradient-to-r from-blue-500 to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
        </Alert>
      )}

      {categories.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Tag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Henüz kategori bulunmuyor.</p>
            <Button className="mt-4" onClick={openDialog}>
              İlk Kategoriyi Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <Badge variant="secondary">{category.postCount || 0} yazı</Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{category.slug}</p>
              </CardHeader>
              <CardContent>
                {category.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{category.description}</p>
                )}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Oluştur'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Kategori bilgilerini güncellemek için aşağıdaki formu doldurun.' 
                : 'Yeni bir kategori oluşturmak için aşağıdaki formu doldurun.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Kategori Adı</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Kategori adı"
              />
            </div>
            <div>
              <Label htmlFor="slug">URL (Slug)</Label>
              <Input
                id="slug"
                name="slug"
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="kategori-url"
              />
            </div>
            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Input
                id="description"
                name="description"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Kategori açıklaması"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                İptal
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">
                {editingCategory ? 'Güncelle' : 'Oluştur'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}