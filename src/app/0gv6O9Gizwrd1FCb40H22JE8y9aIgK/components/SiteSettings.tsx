'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Save, 
  Settings, 
  BarChart3,
  TrendingUp,
  Activity,
  Globe,
  Mail,
  Phone,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  contactEmail: string
  contactPhone: string
  address: string
  maintenanceMode: boolean
  enableRegistration: boolean
  enableComments: boolean
  postsPerPage: number
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  googleAnalytics: string
  facebookPixel: string
}

export function SiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'ButcApp',
    siteDescription: 'Modern finansal yönetim platformu',
    siteUrl: 'https://butcapp.com',
    contactEmail: 'info@butcapp.com',
    contactPhone: '+90 555 123 45 67',
    address: 'İstanbul, Türkiye',
    maintenanceMode: false,
    enableRegistration: true,
    enableComments: true,
    postsPerPage: 10,
    metaTitle: 'ButcApp - Finansal Yönetim Platformu',
    metaDescription: 'ButcApp ile finansal yönetiminizi kolaylaştırın',
    metaKeywords: 'finans, bütçe, yatırım, ekonomi',
    googleAnalytics: '',
    facebookPixel: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      // Simüle edilmiş ayarları getirme
      // const response = await fetch('/api/settings')
      // const data = await response.json()
      // if (data.success) {
      //   setSettings(data.settings)
      // }
    } catch (error) {
      setError('Ayarlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSave = async (category: string) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Simüle edilmiş kaydetme işlemi
      // const response = await fetch('/api/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // })
      
      // if (response.ok) {
      setSuccess(`${category} ayarları başarıyla kaydedildi!`)
      // }
    } catch (error) {
      setError('Ayarlar kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Tüm ayarları varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
      return
    }

    try {
      // Varsayılan ayarlara sıfırlama
      setSettings({
        siteName: 'ButcApp',
        siteDescription: 'Modern finansal yönetim platformu',
        siteUrl: 'https://butcapp.com',
        contactEmail: 'info@butcapp.com',
        contactPhone: '+90 555 123 45 67',
        address: 'İstanbul, Türkiye',
        maintenanceMode: false,
        enableRegistration: true,
        enableComments: true,
        postsPerPage: 10,
        metaTitle: 'ButcApp - Finansal Yönetim Platformu',
        metaDescription: 'ButcApp ile finansal yönetiminizi kolaylaştırın',
        metaKeywords: 'finans, bütçe, yatırım, ekonomi',
        googleAnalytics: '',
        facebookPixel: ''
      })
      setSuccess('Ayarlar varsayılan değerlere sıfırlandı!')
    } catch (error) {
      setError('Ayarlar sıfırlanamadı')
    }
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
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Site Ayarları</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sıfırla
          </Button>
          <Button 
            onClick={() => handleSave('Tüm')}
            disabled={saving}
            className="bg-gradient-to-r from-blue-500 to-purple-600"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Tümünü Kaydet
          </Button>
        </div>
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

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="general" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <Settings className="h-4 w-4 mr-2" />
            Genel
          </TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <TrendingUp className="h-4 w-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analitik
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <Activity className="h-4 w-4 mr-2" />
            Gelişmiş
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Genel Site Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="siteName">Site Adı</Label>
                  <Input
                    id="siteName"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleInputChange}
                    placeholder="Site adı"
                  />
                </div>
                <div>
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    name="siteUrl"
                    value={settings.siteUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="siteDescription">Site Açıklaması</Label>
                <Textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleInputChange}
                  placeholder="Site açıklaması"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contactEmail" className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    İletişim E-postası
                  </Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={handleInputChange}
                    placeholder="info@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone" className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    İletişim Telefonu
                  </Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={settings.contactPhone}
                    onChange={handleInputChange}
                    placeholder="+90 555 123 45 67"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Adres
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={settings.address}
                  onChange={handleInputChange}
                  placeholder="Adres bilgileri"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenanceMode"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                  <Label htmlFor="maintenanceMode">Bakım Modu</Label>
                </div>
                <Badge variant={settings.maintenanceMode ? "destructive" : "default"}>
                  {settings.maintenanceMode ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableRegistration"
                    name="enableRegistration"
                    checked={settings.enableRegistration}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableRegistration: checked }))}
                  />
                  <Label htmlFor="enableRegistration">Kullanıcı Kaydı</Label>
                </div>
                <Badge variant={settings.enableRegistration ? "default" : "secondary"}>
                  {settings.enableRegistration ? 'Açık' : 'Kapalı'}
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableComments"
                    name="enableComments"
                    checked={settings.enableComments}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableComments: checked }))}
                  />
                  <Label htmlFor="enableComments">Yorumlar</Label>
                </div>
                <Badge variant={settings.enableComments ? "default" : "secondary"}>
                  {settings.enableComments ? 'Açık' : 'Kapalı'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                SEO Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="metaTitle">Meta Başlık</Label>
                <Input
                  id="metaTitle"
                  name="metaTitle"
                  value={settings.metaTitle}
                  onChange={handleInputChange}
                  placeholder="SEO başlığı"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Google arama sonuçlarında görünecek başlık (60 karakter önerilir)
                </p>
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Açıklaması</Label>
                <Textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={settings.metaDescription}
                  onChange={handleInputChange}
                  placeholder="SEO açıklaması"
                  rows={3}
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Google arama sonuçlarında görünecek açıklama (160 karakter önerilir)
                </p>
              </div>

              <div>
                <Label htmlFor="metaKeywords">Meta Anahtar Kelimeler</Label>
                <Input
                  id="metaKeywords"
                  name="metaKeywords"
                  value={settings.metaKeywords}
                  onChange={handleInputChange}
                  placeholder="anahtar1, anahtar2, anahtar3"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Virgülle ayrılmış anahtar kelimeler
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Analitik ve Takip
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                <Input
                  id="googleAnalytics"
                  name="googleAnalytics"
                  value={settings.googleAnalytics}
                  onChange={handleInputChange}
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Google Analytics 4 ölçüm kimliği
                </p>
              </div>

              <div>
                <Label htmlFor="facebookPixel">Facebook Pixel ID</Label>
                <Input
                  id="facebookPixel"
                  name="facebookPixel"
                  value={settings.facebookPixel}
                  onChange={handleInputChange}
                  placeholder="XXXXXXXXXXXXXXXX"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Facebook Pixel kimliği
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Gelişmiş Ayarlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="postsPerPage">Sayfa Başına Yazı Sayısı</Label>
                <Input
                  id="postsPerPage"
                  name="postsPerPage"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.postsPerPage}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Blog sayfalarında gösterilecek yazı sayısı
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                  ⚠️ Dikkat
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Gelişmiş ayarları değiştirmeden önce ne yaptığınızdan emin olun. 
                  Yanlış ayarlar site performansını etkileyebilir.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}