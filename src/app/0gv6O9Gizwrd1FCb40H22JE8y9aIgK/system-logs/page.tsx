'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Users, 
  Globe, 
  TrendingUp,
  Filter,
  RefreshCw,
  Trash2,
  Download,
  Calendar
} from 'lucide-react'
import { AuthGuard } from '@/components/AuthGuard'
import { AdminLayout } from '../components/AdminLayout'

interface LogEntry {
  id: string
  type: string
  level: string
  action: string
  description?: string
  metadata?: any
  ipAddress?: string
  userAgent?: string
  endpoint?: string
  method?: string
  statusCode?: number
  responseTime?: number
  error?: string
  createdAt: string
  user?: {
    id: string
    email: string
    fullName?: string
  }
}

const logTypes = [
  { value: 'user_login', label: 'Kullanıcı Girişi', icon: Users, color: 'bg-blue-500' },
  { value: 'admin_action', label: 'Admin İşlemi', icon: Shield, color: 'bg-purple-500' },
  { value: 'api_request', label: 'API İsteği', icon: Globe, color: 'bg-green-500' },
  { value: 'error', label: 'Hata', icon: XCircle, color: 'bg-red-500' },
  { value: 'security', label: 'Güvenlik', icon: AlertTriangle, color: 'bg-orange-500' },
  { value: 'performance', label: 'Performans', icon: TrendingUp, color: 'bg-cyan-500' }
]

const logLevels = [
  { value: 'debug', label: 'Debug', color: 'bg-gray-500' },
  { value: 'info', label: 'Info', color: 'bg-blue-500' },
  { value: 'warn', label: 'Warning', color: 'bg-yellow-500' },
  { value: 'error', label: 'Error', color: 'bg-red-500' },
  { value: 'fatal', label: 'Fatal', color: 'bg-red-700' }
]

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: 'all',
    level: 'all',
    startDate: '',
    endDate: ''
  })
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    hasMore: false
  })

  const fetchLogs = async (resetOffset = false) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: resetOffset ? '0' : pagination.offset.toString(),
        ...(filters.type && filters.type !== 'all' && { type: filters.type }),
        ...(filters.level && filters.level !== 'all' && { level: filters.level }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      })

      const response = await fetch(`/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (resetOffset) {
          setLogs(data.data)
          setPagination(prev => ({ ...prev, offset: 0, hasMore: data.pagination.hasMore }))
        } else {
          setLogs(prev => [...prev, ...data.data])
          setPagination(prev => ({ ...prev, hasMore: data.pagination.hasMore }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))
    fetchLogs()
  }

  const clearLogs = async () => {
    if (!confirm('Eski logları silmek istediğinizden emin misiniz? (Son 30 gün korunacak)')) {
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch('/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/logs?days=30', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchLogs(true)
      }
    } catch (error) {
      console.error('Failed to clear logs:', error)
    }
  }

  const exportLogs = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      const params = new URLSearchParams({
        limit: '10000',
        ...(filters.type && filters.type !== 'all' && { type: filters.type }),
        ...(filters.level && filters.level !== 'all' && { level: filters.level }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      })

      const response = await fetch(`/0gv6O9Gizwrd1FCb40H22JE8y9aIgK/api/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export logs:', error)
    }
  }

  useEffect(() => {
    fetchLogs(true)
  }, [filters])

  const getLogTypeInfo = (type: string) => {
    return logTypes.find(t => t.value === type) || logTypes[0]
  }

  const getLogLevelInfo = (level: string) => {
    return logLevels.find(l => l.value === level) || logLevels[1]
  }

  const formatMetadata = (metadata: any) => {
    if (!metadata) return null
    try {
      return typeof metadata === 'string' ? JSON.parse(metadata) : metadata
    } catch {
      return metadata
    }
  }

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              Sistem Logları
            </h1>
            <p className="text-muted-foreground">
              Sistemdeki tüm aktiviteleri ve olayları görüntüleyin
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtreler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Log Tipi</label>
                  <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tümü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {logTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Seviye</label>
                  <Select value={filters.level} onValueChange={(value) => setFilters(prev => ({ ...prev, level: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tümü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {logLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Başlangıç Tarihi</label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bitiş Tarihi</label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={() => fetchLogs(true)} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Yenile
                </Button>
                <Button variant="outline" onClick={exportLogs}>
                  <Download className="h-4 w-4 mr-2" />
                  Dışa Aktar
                </Button>
                <Button variant="destructive" onClick={clearLogs}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eski Logları Temizle
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logs List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Log Kayıtları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {logs.map((log) => {
                    const typeInfo = getLogTypeInfo(log.type)
                    const levelInfo = getLogLevelInfo(log.level)
                    const Icon = typeInfo.icon
                    
                    return (
                      <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${typeInfo.color} bg-opacity-20`}>
                              <Icon className={`h-4 w-4 ${typeInfo.color.replace('bg-', 'text-')}`} />
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {typeInfo.label}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${levelInfo.color.replace('bg-', 'border- text-')}`}>
                              {levelInfo.label}
                            </Badge>
                            {log.statusCode && (
                              <Badge variant={log.statusCode >= 400 ? 'destructive' : 'default'} className="text-xs">
                                {log.statusCode}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString('tr-TR')}
                          </div>
                        </div>

                        <div className="mb-2">
                          <div className="font-medium text-sm">{log.action}</div>
                          {log.description && (
                            <div className="text-sm text-muted-foreground mt-1">{log.description}</div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {log.user && (
                            <div>
                              <span className="font-medium">Kullanıcı:</span> {log.user.fullName || log.user.email}
                            </div>
                          )}
                          {log.endpoint && (
                            <div>
                              <span className="font-medium">Endpoint:</span> {log.method} {log.endpoint}
                            </div>
                          )}
                          {log.responseTime && (
                            <div>
                              <span className="font-medium">Response Time:</span> {log.responseTime}ms
                            </div>
                          )}
                          {log.ipAddress && (
                            <div>
                              <span className="font-medium">IP:</span> {log.ipAddress}
                            </div>
                          )}
                        </div>

                        {log.error && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                            <div className="font-medium">Hata:</div>
                            <div>{log.error}</div>
                          </div>
                        )}

                        {log.metadata && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                              Metadata
                            </summary>
                            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(formatMetadata(log.metadata), null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    )
                  })}
                </div>

                {loading && (
                  <div className="flex justify-center py-4">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                )}

                {!loading && logs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Log kaydı bulunamadı
                  </div>
                )}

                {!loading && pagination.hasMore && (
                  <div className="flex justify-center py-4">
                    <Button onClick={loadMore} variant="outline">
                      Daha Fazla Yükle
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}