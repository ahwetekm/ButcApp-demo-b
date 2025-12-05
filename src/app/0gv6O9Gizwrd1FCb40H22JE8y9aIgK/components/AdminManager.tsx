'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
  Mail,
  Calendar,
  Key,
  UserPlus,
  UserMinus
} from 'lucide-react'

interface AdminUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
  lastLogin?: string
  active: boolean
  permissions?: string[]
}

export function AdminManager() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    role: 'admin' as 'admin' | 'user',
    password: '',
    permissions: [] as string[]
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/admins')
      const result = await response.json()
      
      if (result.success) {
        setAdmins(result.data || [])
      } else {
        setError('Adminler yüklenemedi: ' + result.error)
      }
    } catch (error) {
      console.error('Admin fetch error:', error)
      setError('Adminler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingAdmin) {
        // Admin güncelleme API çağrısı
        const response = await fetch(`/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/admins/${editingAdmin.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        
        const result = await response.json()
        
        if (result.success) {
          setSuccess('Admin güncellendi!')
          await fetchAdmins() // Listeyi yenile
        } else {
          setError('Admin güncellenemedi: ' + result.error)
          return
        }
      } else {
        // Yeni admin oluşturma API çağrısı
        const response = await fetch('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/admins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        
        const result = await response.json()
        
        if (result.success) {
          setSuccess('Admin oluşturuldu!')
          await fetchAdmins() // Listeyi yenile
        } else {
          setError('Admin oluşturulamadı: ' + result.error)
          return
        }
      }
      
      setShowDialog(false)
      setEditingAdmin(null)
      setFormData({ username: '', email: '', name: '', role: 'admin', password: '', permissions: [] })
    } catch (error) {
      console.error('Admin submit error:', error)
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  const handleEdit = (admin: AdminUser) => {
    setEditingAdmin(admin)
    setFormData({
      username: admin.username,
      email: admin.email,
      role: admin.role,
      password: '',
      permissions: admin.permissions || []
    })
    setShowDialog(true)
  }

  const handleDelete = async (adminId: string) => {
    if (!confirm('Bu admini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      return
    }

    try {
      // Ana admini koru
      if (adminId === 'test-admin-001') {
        setError('Ana admin silinemez!')
        return
      }

      const response = await fetch(`/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/admins/${adminId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSuccess('Admin silindi!')
        await fetchAdmins() // Listeyi yenile
      } else {
        setError('Admin silinemedi: ' + result.error)
      }
    } catch (error) {
      console.error('Admin delete error:', error)
      setError('Admin silinemedi')
    }
  }

  const handleToggleActive = async (adminId: string) => {
    try {
      setAdmins(admins.map(admin => 
        admin.id === adminId 
          ? { ...admin, active: !admin.active }
          : admin
      ))
    } catch (error) {
      setError('Durum güncellenemedi')
    }
  }

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const openDialog = () => {
    setEditingAdmin(null)
    setFormData({ username: '', email: '', name: '', role: 'admin', password: '', permissions: [] })
    setShowDialog(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const availablePermissions = [
    { id: 'blog', name: 'Blog Yönetimi', icon: '📝' },
    { id: 'users', name: 'Kullanıcı Yönetimi', icon: '👥' },
    { id: 'settings', name: 'Site Ayarları', icon: '⚙️' },
    { id: 'analytics', name: 'Analitik', icon: '📊' }
  ]

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
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Admin Yönetimi</h3>
        <Button onClick={openDialog} className="bg-gradient-to-r from-blue-500 to-purple-600">
          <UserPlus className="h-4 w-4 mr-2" />
          Yeni Admin
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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Tüm Adminler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Henüz admin bulunmuyor.</p>
              <Button className="mt-4" onClick={openDialog}>
                İlk Admini Oluştur
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>İzinler</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Son Giriş</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                          {admin.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{admin.username}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            <Mail className="h-3 w-3 inline mr-1" />
                            {admin.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {admin.permissions?.map((permission) => {
                          const perm = availablePermissions.find(p => p.id === permission)
                          return (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {perm?.icon} {perm?.name}
                            </Badge>
                          )
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant={admin.active ? "default" : "secondary"}>
                          {admin.active ? 'Aktif' : 'Pasif'}
                        </Badge>
                        {admin.id === '1' && (
                          <Badge variant="outline" className="text-xs">
                            Süper Admin
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {admin.lastLogin ? formatDate(admin.lastLogin) : 'Hiç giriş yapmadı'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(admin.id)}
                        >
                          {admin.active ? 'Pasif Yap' : 'Aktif Yap'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(admin)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(admin.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={admin.id === '1'}
                        >
                          <UserMinus className="h-4 w-4" />
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

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAdmin ? 'Admini Düzenle' : 'Yeni Admin Oluştur'}
            </DialogTitle>
            <DialogDescription>
              {editingAdmin 
                ? 'Admin bilgilerini güncellemek için aşağıdaki formu doldurun.' 
                : 'Yeni bir admin kullanıcısı oluşturmak için aşağıdaki formu doldurun.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Kullanıcı adı"
                />
              </div>
              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="E-posta adresi"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ad ve soyad"
              />
            </div>

            <div>
              <Label htmlFor="role">Rol</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
              >
                <option value="admin">Admin</option>
                <option value="user">Kullanıcı</option>
              </select>
            </div>

            {!editingAdmin && (
              <div>
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required={!editingAdmin}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Şifre"
                />
              </div>
            )}

            <div>
              <Label>İzinler</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`permission-${permission.id}`}
                      checked={formData.permissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="rounded border-slate-300"
                    />
                    <Label htmlFor={`permission-${permission.id}`} className="text-sm">
                      {permission.icon} {permission.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                İptal
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">
                {editingAdmin ? 'Güncelle' : 'Oluştur'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}