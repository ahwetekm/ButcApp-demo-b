'use client'

import { AdminLayout } from '../components/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Download, 
  Upload, 
  Database, 
  FileText, 
  Shield, 
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Trash2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AdminAuthContext'
import React from 'react'

interface BackupInfo {
  id: string
  type: 'full' | 'database' | 'posts' | 'users' | 'complete'
  name: string
  size: number
  createdAt: string
  status: 'completed' | 'processing' | 'failed'
  filePath?: string
}

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { token } = useAuth()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchBackups()
  }, [])

  const fetchBackups = async () => {
    try {
      const response = await fetch('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/backup', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBackups(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching backups:', error)
    }
  }

  const handleCreateBackup = async (type: 'full' | 'database' | 'posts' | 'users' | 'complete') => {
    setIsCreatingBackup(true)
    setMessage(null)
    
    try {
      const response = await fetch('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: `${type} yedeği başarıyla oluşturuldu` })
        fetchBackups()
      } else {
        setMessage({ type: 'error', text: data.error || 'Yedekleme başarısız' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Yedekleme sırasında hata oluştu' })
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Bu yedeği geri yüklemek istediğinizden emin misiniz? Bu işlem mevcut verilerin üzerine yazabilir.')) {
      return
    }

    setIsRestoring(backupId)
    setMessage(null)

    try {
      const response = await fetch('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ backupId })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Yedek başarıyla geri yüklendi!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Geri yükleme başarısız' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Geri yükleme sırasında hata oluştu' })
    } finally {
      setIsRestoring(null)
    }
  }

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Bu yedeği silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/backup/restore?backupId=${backupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Yedek başarıyla silindi' })
        fetchBackups()
      } else {
        setMessage({ type: 'error', text: data.error || 'Silme işlemi başarısız' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Silme sırasında hata oluştu' })
    }
  }

  const handleDownloadBackup = async (backupId: string) => {
    try {
      console.log('🔥 İndirme başlatılıyor:', backupId)
      console.log('🔥 Token:', token ? 'Mevcut' : 'Yok')
      
      // Önce popup ile dene
      const downloadUrl = `/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/backup/download?backupId=${backupId}&token=${token}`
      
      const newWindow = window.open(downloadUrl, '_blank')
      
      if (newWindow) {
        setMessage({ type: 'success', text: 'Yedek dosyası indiriliyor...' })
        setTimeout(() => {
          newWindow.close()
        }, 2000)
      } else {
        // Popup engellenirse, fetch ile devam et
        console.log('🔥 Popup engellendi, fetch ile devam ediliyor')
        await downloadWithFetch(backupId)
      }
      
    } catch (error) {
      console.error('🔥 Download exception:', error)
      setMessage({ type: 'error', text: 'İndirme sırasında hata oluştu' })
    }
  }

  const downloadWithFetch = async (backupId: string) => {
    try {
      const response = await fetch(`/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/backup/download?backupId=${backupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('🔥 Response status:', response.status)
      console.log('🔥 Response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const blob = await response.blob()
        console.log('🔥 Blob size:', blob.size)
        console.log('🔥 Blob type:', blob.type)
        
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        // Get filename from response headers or create one
        const contentDisposition = response.headers.get('content-disposition')
        let filename = `backup_${backupId}.json`
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }
        
        console.log('🔥 Filename:', filename)
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        setMessage({ type: 'success', text: 'Yedek dosyası indirildi' })
      } else {
        const errorData = await response.json()
        console.error('🔥 Download error:', errorData)
        setMessage({ type: 'error', text: errorData.error || 'İndirme başarısız' })
      }
    } catch (error) {
      console.error('🔥 Download fetch exception:', error)
      setMessage({ type: 'error', text: 'İndirme sırasında hata oluştu' })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      setMessage({ type: 'error', text: 'Sadece JSON dosyaları yüklenebilir' })
      return
    }

    setIsUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('backupFile', file)

      const response = await fetch('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/backup/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Yedek dosyası başarıyla yüklendi ve geri yüklendi!' })
        fetchBackups()
      } else {
        setMessage({ type: 'error', text: data.error || 'Yükleme başarısız' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Yükleme sırasında hata oluştu' })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return Database
      case 'database': return Database
      case 'posts': return FileText
      case 'users': return FileText
      case 'complete': return Database
      default: return FileText
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full': return 'Tam Yedek'
      case 'database': return 'Veritabanı'
      case 'posts': return 'Blog Yazıları'
      case 'users': return 'Kullanıcılar'
      case 'complete': return 'Tam Veri Yedeği'
      default: return 'Bilinmeyen'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Tamamlandı</Badge>
      case 'processing': return <Badge variant="secondary"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />İşleniyor</Badge>
      case 'failed': return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Başarısız</Badge>
      default: return <Badge variant="outline">Bilinmeyen</Badge>
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              Yedekleme ve Geri Yükleme
            </h1>
            <p className="text-muted-foreground">
              Sitenizin verilerini yedekleyebilir ve geri yükleyebilirsiniz.
            </p>
          </div>

          {/* Message Alert */}
          {message && (
            <Alert className={message.type === 'error' ? 'border-destructive' : 'border-green-200'}>
              {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-2 border-dashed border-muted">
              <CardHeader className="text-center">
                <Database className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <CardTitle className="text-lg">Tam Veri Yedeği</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Tüm tabloları tek dosyada yedekler
                </p>
                <Button 
                  onClick={() => handleCreateBackup('complete')}
                  disabled={isCreatingBackup}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isCreatingBackup ? 'Oluşturuluyor...' : 'Tam Veri Yedeği'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-muted">
              <CardHeader className="text-center">
                <Database className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <CardTitle className="text-lg">Tam Yedek</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Tüm sistem verilerini yedekler
                </p>
                <Button 
                  onClick={() => handleCreateBackup('full')}
                  disabled={isCreatingBackup}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Tam Yedek Al
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-muted">
              <CardHeader className="text-center">
                <Database className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <CardTitle className="text-lg">Veritabanı</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Sadece veritabanını yedekler
                </p>
                <Button 
                  onClick={() => handleCreateBackup('database')}
                  disabled={isCreatingBackup}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Veritabanı Yedekle
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-muted">
              <CardHeader className="text-center">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <CardTitle className="text-lg">Blog Yazıları</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Sadece blog yazılarını yedekler
                </p>
                <Button 
                  onClick={() => handleCreateBackup('posts')}
                  disabled={isCreatingBackup}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Yazıları Yedekle
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-muted">
              <CardHeader className="text-center">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <CardTitle className="text-lg">Kullanıcılar</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Kullanıcı verilerini yedekler
                </p>
                <Button 
                  onClick={() => handleCreateBackup('users')}
                  disabled={isCreatingBackup}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Kullanıcıları Yedekle
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-muted">
              <CardHeader className="text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <CardTitle className="text-lg">Yedek Yükle</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  JSON yedek dosyası yükle
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="backup-upload"
                />
                <Button 
                  onClick={() => document.getElementById('backup-upload')?.click()}
                  disabled={isUploading}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Yükleniyor...' : 'Yedek Yükle'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Alert */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Önemli:</strong> Yedekleme işlemi sırasında sistemde kesinti olabilir. 
              Lütfen yedekleme işlemini düşük trafik saatlerinde yapınız.
            </AlertDescription>
          </Alert>

          {/* Backup History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Yedek Geçmişi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {backups.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Henüz yedek bulunmuyor.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {backups.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-muted rounded-lg">
                          {React.createElement(getTypeIcon(backup.type), { className: "h-5 w-5" })}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{backup.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{getTypeLabel(backup.type)}</span>
                            <span>{formatFileSize(backup.size)}</span>
                            <span>{new Date(backup.createdAt).toLocaleString('tr-TR')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(backup.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadBackup(backup.id)}
                          disabled={backup.status !== 'completed'}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreBackup(backup.id)}
                          disabled={isRestoring === backup.id || backup.status !== 'completed'}
                        >
                          {isRestoring === backup.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}