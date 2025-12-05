'use client'

import { useState, useEffect } from 'react'

export default function TokenTestPage() {
  const [token, setToken] = useState<string | null>(null)
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Browser'da token kontrol et
    const storedToken = localStorage.getItem('adminToken')
    console.log('🔑 Token Test: Stored token:', storedToken ? 'mevcut' : 'yok')
    setToken(storedToken)
    
    if (storedToken) {
      fetchSystemInfo(storedToken)
    }
  }, [])

  const fetchSystemInfo = async (authToken: string) => {
    try {
      setLoading(true)
      console.log('📡 Token Test: API isteği gönderiliyor...')
      console.log('📡 Token Test: Token:', authToken.substring(0, 20) + '...')
      
      const response = await fetch('/api/system-status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      })

      console.log('📡 Token Test: API yanıtı status:', response.status)
      console.log('📡 Token Test: API yanıtı headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('❌ Token Test: API hata yanıtı:', errorText)
        throw new Error(`API Hatası: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Token Test: API verisi alındı:', data)
      setSystemInfo(data)
      setError(null)
    } catch (err) {
      console.error('❌ Token Test: Fetch hatası:', err)
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const login = async () => {
    try {
      setLoading(true)
      console.log('🔐 Token Test: Login başlatılıyor...')
      
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'Admin123!'
        })
      })

      const data = await response.json()
      console.log('🔐 Token Test: Login yanıtı:', data)
      
      if (data.success && data.token) {
        localStorage.setItem('adminToken', data.token)
        setToken(data.token)
        console.log('✅ Token Test: Token kaydedildi:', data.token.substring(0, 20) + '...')
        fetchSystemInfo(data.token)
      } else {
        setError(data.error || 'Giriş başarısız')
        console.log('❌ Token Test: Login hatası:', data.error)
      }
    } catch (err) {
      console.error('❌ Token Test: Login hatası:', err)
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log('🚪 Token Test: Logout yapılıyor...')
    localStorage.removeItem('adminToken')
    setToken(null)
    setSystemInfo(null)
    setError(null)
  }

  const clearCache = () => {
    console.log('🧹 Token Test: Cache temizleniyor...')
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">🔑 Token Test Sayfası</h1>
        
        {/* Token Durumu */}
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">🔑 Token Durumu</h2>
          {token ? (
            <div className="space-y-3">
              <p className="text-green-600 font-medium">✅ Token mevcut</p>
              <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                Token: {token.substring(0, 50)}...
              </p>
              <div className="flex space-x-2">
                <button 
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🚪 Çıkış Yap
                </button>
                <button 
                  onClick={clearCache}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  🧹 Cache Temizle
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-red-600 font-medium">❌ Token bulunamadı</p>
              <button 
                onClick={login}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                🔐 Admin Girişi Yap
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-4 border rounded-lg bg-blue-50">
            <p className="text-blue-800">⏳ İşlem yapılıyor...</p>
          </div>
        )}

        {/* Hata Mesajı */}
        {error && (
          <div className="p-4 border rounded-lg bg-red-50 border-red-200">
            <p className="text-red-800">❌ Hata: {error}</p>
          </div>
        )}

        {/* Sistem Bilgileri */}
        {systemInfo && (
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">📊 Sistem Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800">💻 CPU</h3>
                <p className="text-2xl font-bold text-blue-600">{systemInfo.cpu.usage}%</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800">🧠 Memory</h3>
                <p className="text-2xl font-bold text-green-600">{systemInfo.memory.active}%</p>
                <p className="text-sm text-green-700">{systemInfo.memory.used}/{systemInfo.memory.total} GB</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-medium text-orange-800">💾 Disk</h3>
                <p className="text-2xl font-bold text-orange-600">{systemInfo.disk.percentage}%</p>
                <p className="text-sm text-orange-700">{systemInfo.disk.used}/{systemInfo.disk.size} GB</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
              <p>🕐 Son güncelleme: {new Date(systemInfo.timestamp).toLocaleString('tr-TR')}</p>
            </div>
          </div>
        )}

        {/* Linkler */}
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">🔗 Hızlı Linkler</h2>
          <div className="space-y-2">
            <a href="/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/login" className="block p-3 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
              🔐 Admin Login
            </a>
            <a href="/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/dashboard" className="block p-3 bg-green-50 text-green-600 rounded hover:bg-green-100">
              📊 Admin Dashboard
            </a>
            <a href="/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/dashboard/server-status" className="block p-3 bg-orange-50 text-orange-600 rounded hover:bg-orange-100">
              🖥️ Server Status
            </a>
          </div>
        </div>

        {/* Debug Bilgileri */}
        <div className="p-6 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">🐛 Debug Bilgileri</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Browser:</strong> {typeof window !== 'undefined' ? '✅' : '❌'}</p>
            <p><strong>LocalStorage:</strong> {typeof localStorage !== 'undefined' ? '✅' : '❌'}</p>
            <p><strong>Token:</strong> {token ? '✅' : '❌'}</p>
            <button 
              onClick={() => console.log('🔍 Debug bilgileri console\'a yazdırıldı')}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
            >
              🐛 Console'a Yazdır
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}