'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, TrendingUp, Loader2, Activity, Eye, UserPlus, BarChart3 } from 'lucide-react'
import { AuthGuard } from '@/components/AuthGuard'
import { AdminLayout } from '../components/AdminLayout'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface RealTimeStats {
  totalUsers: number
  activeUsers: number
  todayRegistrations: number
  weeklyGrowth: number
  totalPosts: number
  todayPosts: number
  monthlyPosts: number
  totalViews: number
  weeklyViews: number
  userTrend: Array<{ date: string; count: number }>
  blogTrend: Array<{ date: string; count: number; views: number }>
  systemStats: Array<{ type: string; count: number; avgResponseTime: number }>
  userGrowthRate: string
  avgPostViews: string
  lastUpdated: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<RealTimeStats>({
    totalUsers: 0,
    activeUsers: 0,
    todayRegistrations: 0,
    weeklyGrowth: 0,
    totalPosts: 0,
    todayPosts: 0,
    monthlyPosts: 0,
    totalViews: 0,
    weeklyViews: 0,
    userTrend: [],
    blogTrend: [],
    systemStats: [],
    userGrowthRate: '0',
    avgPostViews: '0',
    lastUpdated: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchRealTimeStats = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1]
      
      if (!token) {
        console.log('Dashboard: No admin token found')
        setError('Admin token bulunamadı')
        return
      }
      
      console.log('Dashboard: Fetching real-time stats with token:', token.substring(0, 10) + '...')
      
      const response = await fetch('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/realtime-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Dashboard: Real-time API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Dashboard: Real-time API response data:', data)
        setStats(data.data)
        setLastUpdate(new Date())
      } else {
        console.error('Dashboard: Real-time API error response:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.error('Dashboard: Error data:', errorData)
        setError(`API Hatası: ${response.status}`)
      }
    } catch (error) {
      console.error('Dashboard: Real-time stats fetch error:', error)
      setError('Veri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  // Real-time verileri için WebSocket simülasyonu
  useEffect(() => {
    fetchRealTimeStats()
    
    // Her 30 saniyede bir veri güncelle
    const interval = setInterval(fetchRealTimeStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short'
    })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
          <p className="text-sm font-medium">{`${label}`}</p>
          <p className="text-sm text-blue-600">{`Değer: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                  Dashboard
                </h1>
                <p className="text-muted-foreground">
                  ButcApp yönetim merkezinin genel durumu (Real-time)
                </p>
              </div>
              <div className="flex items-center gap-4">
                {lastUpdate && (
                  <div className="text-sm text-muted-foreground">
                    Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
                  </div>
                )}
                <button
                  onClick={fetchRealTimeStats}
                  disabled={loading}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Yenile
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Real-time Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Toplam Kullanıcılar</CardTitle>
                <Users className="h-5 w-5 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatNumber(stats.totalUsers)}</div>
                <p className="text-xs opacity-80 mt-1">
                  Aktif: {formatNumber(stats.activeUsers)} (%{stats.userGrowthRate})
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Bugün Kayıt</CardTitle>
                <UserPlus className="h-5 w-5 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatNumber(stats.todayRegistrations)}</div>
                <p className="text-xs opacity-80 mt-1">Bu hafta: {formatNumber(stats.weeklyGrowth)}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Blog Yazıları</CardTitle>
                <FileText className="h-5 w-5 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatNumber(stats.totalPosts)}</div>
                <p className="text-xs opacity-80 mt-1">Bugün: {formatNumber(stats.todayPosts)}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Toplam Görüntülenme</CardTitle>
                <Eye className="h-5 w-5 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatNumber(stats.totalViews)}</div>
                <p className="text-xs opacity-80 mt-1">Ort: {stats.avgPostViews} görüntü</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Kullanıcı Trend Grafiği */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Kullanıcı Artış Trendi (30 Gün)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.userTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.userTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Veri bulunmuyor
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Blog Performans Grafiği */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                  Blog Performansı (30 Gün)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.blogTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.blogTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#8b5cf6" name="Yazı Sayısı" />
                      <Bar dataKey="views" fill="#f59e0b" name="Görüntülenme" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Veri bulunmuyor
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-l-2 border-dashed border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Aktif Kullanıcılar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.activeUsers)}</div>
                <p className="text-sm text-muted-foreground mt-1">Son 30 gün giriş yapan</p>
              </CardContent>
            </Card>

            <Card className="border-l-2 border-dashed border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Bu Ayki Yazılar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{formatNumber(stats.monthlyPosts)}</div>
                <p className="text-sm text-muted-foreground mt-1">Yayınlanan içerik</p>
              </CardContent>
            </Card>

            <Card className="border-l-2 border-dashed border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-orange-600" />
                  Haftalık Görüntülenme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{formatNumber(stats.weeklyViews)}</div>
                <p className="text-sm text-muted-foreground mt-1">Son 7 gün</p>
              </CardContent>
            </Card>
          </div>

          {/* System Performance */}
          {stats.systemStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                  Sistem Performansı (24 Saat)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.systemStats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{stat.type}</div>
                        <div className="text-sm text-muted-foreground">
                          Ortalama response time: {stat.avgResponseTime.toFixed(0)}ms
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatNumber(stat.count)}</div>
                        <div className="text-sm text-muted-foreground">istek</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle>Hoş Geldiniz!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Bu dashboard, gerçek zamanlı verilerle güncellenmektedir. 
                Sol menüden ilgili bölüme geçiş yaparak yönetim işlemlerinizi gerçekleştirebilirsiniz.
                Blog yazıları, kategoriler, kullanıcılar ve site ayarları için menüyü kullanın.
              </p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-blue-800">
                  <Activity className="h-4 w-4 mr-2 animate-pulse" />
                  <span className="text-sm font-medium">
                    Real-time mod aktif - Veriler her 30 saniyede bir güncellenmektedir
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}