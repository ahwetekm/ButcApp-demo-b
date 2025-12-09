'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Cpu, HardDrive, MemoryStick, Activity } from 'lucide-react'

interface SystemInfo {
  cpu: { usage: number }
  memory: { total: number; used: number; free: number; active: number }
  disk: { size: number; used: number; available: number; percentage: number }
  timestamp: string
}

export default function ServerStatusPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchSystemInfo = async () => {
    try {
      console.log('🔍 Server Status: Fetch başlıyor...')
      
      // Token'ı localStorage'dan al
      const token = localStorage.getItem('adminToken')
      console.log('🔑 Server Status: Token durumu:', token ? 'mevcut' : 'yok')
      
      if (!token) {
        console.log('❌ Server Status: Token yok, login sayfasına yönlendiriliyor...')
        router.push('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login')
        return
      }

      console.log('📡 Server Status: API isteği gönderiliyor...')
      console.log('📡 Server Status: Token:', token.substring(0, 20) + '...')
      
      const response = await fetch('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/system-status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      })

      console.log('📡 Server Status: API yanıtı status:', response.status)
      console.log('📡 Server Status: API yanıtı headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('❌ Server Status: API hata yanıtı:', errorText)
        
        if (response.status === 401) {
          console.log('🔄 Server Status: 401 hatası, token siliniyor...')
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          router.push('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login')
          return
        }
        
        throw new Error(`API Hatası: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Server Status: API verisi alındı:', data)
      setSystemInfo(data)
      setError(null)
      setLoading(false)
    } catch (err) {
      console.error('❌ Server Status: Fetch hatası:', err)
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🚀 Server Status: Component mount edildi')
    
    // Token var mı diye kontrol et
    const token = localStorage.getItem('adminToken') || 
                   document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1]
    
    if (!token) {
      console.log('❌ Server Status: Token bulunamadı, fetch iptal ediliyor')
      return
    }
    
    console.log('📡 Server Status: Token bulundu, fetch başlatılıyor...')
    fetchSystemInfo()
    
    const interval = setInterval(fetchSystemInfo, 5000)
    console.log('⏰ Server Status: Interval ayarlandı (5 saniye)')

    return () => {
      console.log('🛑 Server Status: Component unmount edildi, interval temizleniyor')
      clearInterval(interval)
    }
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 animate-pulse" />
            <span>Yükleniyor...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <p className="text-destructive">Hata: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    )
  }

  if (!systemInfo) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">
          Sistem bilgileri mevcut değil
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sunucu Durumu</h1>
          <p className="text-muted-foreground">
            Son güncelleme: {new Date(systemInfo.timestamp).toLocaleString('tr-TR')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Kullanımı</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">{systemInfo.cpu?.usage || 0}%</div>
              <Progress value={systemInfo.cpu?.usage || 0} className="w-full" />
              <p className="text-xs text-muted-foreground">İşlemci yükü</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bellek Kullanımı</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">{systemInfo.memory.active}%</div>
              <Progress value={systemInfo.memory.active} className="w-full" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Toplam: {systemInfo.memory.total} GB</p>
                <p>Kullanılan: {systemInfo.memory.used} GB</p>
                <p>Boş: {systemInfo.memory.free} GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Kullanımı</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">{systemInfo.disk.percentage}%</div>
              <Progress value={systemInfo.disk.percentage} className="w-full" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Toplam: {systemInfo.disk.size} GB</p>
                <p>Kullanılan: {systemInfo.disk.used} GB</p>
                <p>Boş: {systemInfo.disk.available} GB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sistem Detayları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-primary">CPU Performansı</h4>
              <div className="space-y-1">
                <p className="text-muted-foreground">
                  Mevcut Yük: <span className="font-mono">{systemInfo.cpu.usage}%</span>
                </p>
                <p className="text-muted-foreground">
                  Durum: <span className={systemInfo.cpu.usage > 80 ? 'text-destructive' : 'text-green-600'}>
                    {systemInfo.cpu.usage > 80 ? 'Yüksek' : 'Normal'}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-primary">Bellek Durumu</h4>
              <div className="space-y-1">
                <p className="text-muted-foreground">
                  Kullanım: <span className="font-mono">{systemInfo.memory.used}/{systemInfo.memory.total} GB</span>
                </p>
                <p className="text-muted-foreground">
                  Durum: <span className={systemInfo.memory.active > 80 ? 'text-destructive' : 'text-green-600'}>
                    {systemInfo.memory.active > 80 ? 'Kritik' : 'Normal'}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-primary">Disk Durumu</h4>
              <div className="space-y-1">
                <p className="text-muted-foreground">
                  Kullanım: <span className="font-mono">{systemInfo.disk.used}/{systemInfo.disk.size} GB</span>
                </p>
                <p className="text-muted-foreground">
                  Durum: <span className={systemInfo.disk.percentage > 80 ? 'text-destructive' : 'text-green-600'}>
                    {systemInfo.disk.percentage > 80 ? 'Düşük Alan' : 'Normal'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}