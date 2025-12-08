'use client'

import { useMemo, useState } from 'react'
import { Investment } from '@/app/app/investments/page'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, BarChart3, Calendar, Target, DollarSign } from 'lucide-react'

// Format price function
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

// Modern currency gradient function
const getCurrencyGradient = (currency: string) => {
  const gradients: Record<string, { from: string; to: string; icon: string }> = {
    'USD/TRY': { from: 'from-blue-500', to: 'to-blue-600', icon: '🇺🇸' },
    'EUR/TRY': { from: 'from-green-500', to: 'to-green-600', icon: '🇪🇺' },
    'GBP/TRY': { from: 'from-purple-500', to: 'to-purple-600', icon: '🇬🇧' },
    'CHF/TRY': { from: 'from-yellow-500', to: 'to-yellow-600', icon: '🇨🇭' },
    'SEK/TRY': { from: 'from-orange-500', to: 'to-orange-600', icon: '🇸🇪' },
    'DKK/TRY': { from: 'from-red-500', to: 'to-red-600', icon: '🇩🇰' },
    'NOK/TRY': { from: 'from-indigo-500', to: 'to-indigo-600', icon: '🇳🇴' },
    'CAD/TRY': { from: 'from-pink-500', to: 'to-pink-600', icon: '🇨🇦' },
    'AUD/TRY': { from: 'from-teal-500', to: 'to-teal-600', icon: '🇦🇺' },
    'JPY/TRY': { from: 'from-cyan-500', to: 'to-cyan-600', icon: '🇯🇵' },
    'KWD/TRY': { from: 'from-amber-500', to: 'to-amber-600', icon: '🇰🇼' },
    'SAR/TRY': { from: 'from-lime-500', to: 'to-lime-600', icon: '🇸🇦' },
    'BGN/TRY': { from: 'from-emerald-500', to: 'to-emerald-600', icon: '🇧🇬' },
    'RON/TRY': { from: 'from-violet-500', to: 'to-violet-600', icon: '🇷🇴' },
    'RUB/TRY': { from: 'from-rose-500', to: 'to-rose-600', icon: '🇷🇺' },
    'CNY/TRY': { from: 'from-zinc-500', to: 'to-zinc-600', icon: '🇨🇳' },
    'PKR/TRY': { from: 'from-stone-500', to: 'to-stone-600', icon: '🇵🇰' },
    'QAR/TRY': { from: 'from-fuchsia-500', to: 'to-fuchsia-600', icon: '🇶🇦' },
    'AZN/TRY': { from: 'from-gray-500', to: 'to-gray-600', icon: '🇦🇿' }
  }
  return gradients[currency] || { from: 'from-gray-500', to: 'to-gray-600', icon: '💱' }
}

interface ProfitChartProps {
  investments: Investment[]
  selectedCurrency: string
}

export function ProfitChart({ investments, selectedCurrency }: ProfitChartProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'timeline'>('overview')
  
  const chartData = useMemo(() => {
    if (!investments || investments.length === 0) {
      return {
        investments: [],
        totalInvestment: 0,
        currentValue: 0,
        totalProfit: 0,
        profitPercentage: 0
      }
    }

    // Filter investments based on selected currency
    const filteredInvestments = selectedCurrency === 'all' 
      ? investments 
      : investments.filter(inv => inv.currency === selectedCurrency)

    if (!filteredInvestments || filteredInvestments.length === 0) {
      return {
        investments: [],
        totalInvestment: 0,
        currentValue: 0,
        totalProfit: 0,
        profitPercentage: 0
      }
    }

    // Sort by buy date and validate data
    const sortedInvestments = filteredInvestments
      .filter(inv => inv && inv.buy_price && inv.current_value && inv.amount && inv.buy_date)
      .sort((a, b) => {
        const dateA = new Date(a.buy_date).getTime()
        const dateB = new Date(b.buy_date).getTime()
        return dateA - dateB
      })

    // Calculate totals with extensive validation
    const totals = sortedInvestments.reduce((acc, inv) => {
      const buyPrice = Number(inv.buy_price) || 0
      const currentValue = Number(inv.current_value) || 0
      const amount = Number(inv.amount) || 0
      
      if (isNaN(buyPrice) || isNaN(currentValue) || isNaN(amount)) {
        return acc
      }
      
      const buyValue = buyPrice * amount
      // currentValue zaten tekil yatırımın toplam mevcut değeri, tekrar çarpma yok!
      const currentVal = currentValue
      
      acc.totalInvestment += buyValue
      acc.currentValue += currentVal
      acc.profit += (currentVal - buyValue)
      
      return acc
    }, {
      totalInvestment: 0,
      currentValue: 0,
      totalProfit: 0,
      profitPercentage: 0
    })

    const { totalInvestment, currentValue, totalProfit } = totals
    const profitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0

    return {
      investments: sortedInvestments,
      totalInvestment,
      currentValue,
      totalProfit,
      profitPercentage
    }
  }, [investments, selectedCurrency])

  // Render chart only if we have valid data
  if (!chartData || !chartData.investments || chartData.investments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/20">
        <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-foreground">Grafik Verisi Bulunamadı</h3>
          <p className="text-muted-foreground">
            {selectedCurrency === 'all' ? 'Henüz yatırım verisi bulunmuyor' : `${selectedCurrency} için yatırım verisi bulunmuyor`}
          </p>
        </div>
      </div>
    )
  }

  // Extract data from chartData for easier access
  const { investments: investmentData, totalInvestment, currentValue, totalProfit, profitPercentage } = chartData
  const currencyGradient = selectedCurrency !== 'all' ? getCurrencyGradient(selectedCurrency) : null

  return (
    <div className="space-y-6">
      {/* Modern Header with View Mode Selector */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">Kar/Zarar Analizi</h3>
            <p className="text-sm text-muted-foreground">
              {selectedCurrency === 'all' 
                ? 'Tüm yatırımlarınızın kar/zarar durumu' 
                : `${selectedCurrency.split('/')[0]} yatırımlarınızın durumu`
              }
            </p>
          </div>
          
          <div className="flex gap-2">
            <Select value={viewMode} onValueChange={(value: 'overview' | 'timeline') => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Görünüm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Özet</span>
                  </div>
                </SelectItem>
                <SelectItem value="timeline">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Zaman Çizelgesi</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {selectedCurrency !== 'all' && (
              <Badge className={`bg-gradient-to-r ${currencyGradient?.from} ${currencyGradient?.to} text-white border-0`}>
                <span className="mr-2">{currencyGradient?.icon}</span>
                {selectedCurrency}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Investment Details */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h4 className="text-lg font-semibold mb-4 text-foreground">Yatırım Detayları</h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {investmentData.map((investment) => {
            const buyValue = (Number(investment.buy_price) || 0) * (Number(investment.amount) || 0)
            // currentValue zaten tekil yatırımın toplam mevcut değeri, tekrar çarpma yok!
            const currentValue = Number(investment.current_value) || 0
            const profit = currentValue - buyValue
            const profitPercentage = buyValue > 0 ? (profit / buyValue) * 100 : 0
            const gradient = getCurrencyGradient(investment.currency)
            const isProfit = profit >= 0
            
            return (
              <Card key={investment.id} className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-lg">
                        {gradient.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">{investment.currency}</span>
                          <Badge variant={isProfit ? 'default' : 'destructive'} className="text-xs">
                            {isProfit ? 'Kâr' : 'Zarar'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(investment.buy_date).toLocaleDateString('tr-TR')} • {investment.amount} adet
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Alış</div>
                        <div className="font-medium">₺{formatPrice(buyValue)}</div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Mevcut</div>
                        <div className="font-medium">₺{formatPrice(currentValue)}</div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Kar/Zarar</div>
                        <div className={`font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                          {isProfit ? '+' : ''}₺{formatPrice(profit)}
                        </div>
                        <div className={`text-xs ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                          ({isProfit ? '+' : ''}{profitPercentage.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}