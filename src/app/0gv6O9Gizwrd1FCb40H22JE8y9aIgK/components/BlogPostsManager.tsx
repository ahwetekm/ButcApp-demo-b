'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Activity,
  Loader2
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  published: boolean
  createdAt: string
  updatedAt: string
}

export function BlogPostsManager() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      // Get admin token from cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1]
      
      if (!token) {
        setError('Admin oturumu bulunamadı. Lütfen giriş yapın.')
        setLoading(false)
        return
      }

      const response = await fetch('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setPosts(data.data)
      } else {
        setError('Blog yazıları yüklenemedi: ' + (data.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      console.error('Posts fetch error:', error)
      setError('Blog yazıları yüklenemedi: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      // Get admin token from cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1]
      
      if (!token) {
        setError('Admin oturumu bulunamadı. Lütfen giriş yapın.')
        return
      }

      const response = await fetch(`/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setPosts(posts.filter(post => post.id !== postId))
      } else {
        setError('Blog yazısı silinemedi: ' + (data.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      console.error('Delete post error:', error)
      setError('Blog yazısı silinemedi: ' + error.message)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Blog Yazıları</h1>
          <p className="text-muted-foreground mt-1">
            Tüm blog yazılarını buradan yönetebilirsiniz
          </p>
        </div>
        <Button onClick={() => router.push('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/blog/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Yazı Ekle
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tüm Yazılar</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                Henüz blog yazısı bulunmuyor.
              </div>
              <Button 
                className="mt-4"
                onClick={() => router.push('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/blog/new')}
              >
                İlk Yazıyı Oluştur
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Oluşturulma</TableHead>
                  <TableHead>Güncelleme</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{post.title}</p>
                        <p className="text-sm text-muted-foreground">{post.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Yayında" : "Taslak"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(post.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Activity className="h-4 w-4 mr-1" />
                        {formatDate(post.updatedAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/blog/${post.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}