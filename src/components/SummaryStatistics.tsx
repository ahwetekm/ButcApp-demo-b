import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, PieChart } from 'lucide-react'

interface Investment {
  id: string
  currency: string
  currency_name: string
  amount: number
  buy_price: number
  buy_date: string
  sell_price?: number
  sell_date?: string
  current_value: number
  profit: number
  profit_percent: number
  status: 'active' | 'sold' | 'partial'
}

interface CurrencyStats {
  totalInvestment: number
  currentValue: number
  totalProfit: number
  profitPercentage: number
  investmentsCount: number
}

interface OverallStats {
  totalInvestment: number
  currentValue: number
  totalProfit: number
  profitPercentage: number
  investmentsCount: number
}

interface SummaryStatisticsProps {
  investments: Investment[]
}

// Format price function
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

// Modern currency color palette with gradients
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

// Summary Statistics Component
export const SummaryStatistics: React.FC<SummaryStatisticsProps> = ({ investments }: SummaryStatisticsProps) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('all')
  
  // Calculate currency-wise statistics
  const currencyStats: Record<string, CurrencyStats> = {}
  
  Array.from(new Set(investments.map(inv => inv.currency))).forEach(currency => {
    const currencyInvestments = investments.filter(inv => inv.currency === currency)
    const totalInvestment = currencyInvestments.reduce((sum, inv) => sum + (inv.amount * inv.buy_price), 0)
    const currentValue = currencyInvestments.reduce((sum, inv) => sum + inv.current_value, 0)
    const totalProfit = currencyInvestments.reduce((sum, inv) => sum + inv.profit, 0)
    const profitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0
    
    currencyStats[currency] = {
      totalInvestment,
      currentValue,
      totalProfit,
      profitPercentage,
      investmentsCount: currencyInvestments.length
    }
  })

  // Calculate overall statistics
  const totalInvestment = investments.reduce((sum, inv) => sum + (inv.amount * inv.buy_price), 0)
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.current_value, 0)
  const totalProfit = investments.reduce((sum, inv) => sum + inv.profit, 0)
  const profitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0
  const investmentsCount = investments.length

  const overallStats: OverallStats = {
    totalInvestment,
    currentValue: totalCurrentValue,
    totalProfit,
    profitPercentage,
    investmentsCount
  }

  // Get current display stats
  const getCurrentStats = () => {
    if (selectedCurrency === 'all') {
      return overallStats
    }
    return currencyStats[selectedCurrency] || {
      totalInvestment: 0,
      currentValue: 0,
      totalProfit: 0,
      profitPercentage: 0,
      investmentsCount: 0
    }
  }

  const currentStats = getCurrentStats()
  const currencyGradient = selectedCurrency !== 'all' ? getCurrencyGradient(selectedCurrency) : null

  // Return early if no investments
  if (investments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/20">
        <PieChart className="w-12 h-12 text-muted-foreground mb-4" />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-foreground">İstatistik Verisi Bulunamadı</h3>
          <p className="text-muted-foreground">Henüz yatırım verisi bulunmuyor</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Modern Currency Selector */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">Yatırım İstatistikleri</h3>
            <p className="text-sm text-muted-foreground">
              {selectedCurrency === 'all' 
                ? 'Tüm yatırımlarınızın genel durumu' 
                : `${selectedCurrency.split('/')[0]} yatırımlarınızın durumu`
              }
            </p>
          </div>
          
          <div className="w-full sm:w-auto">
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Döviz seçin..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    <span>Tüm Yatırımlar</span>
                  </div>
                </SelectItem>
                {Object.keys(currencyStats).map(currency => {
                  const gradient = getCurrencyGradient(currency)
                  return (
                    <SelectItem key={currency} value={currency}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{gradient.icon}</span>
                        <span>{currency.split('/')[0]}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Selected Currency Badge */}
        {selectedCurrency !== 'all' && (
          <div className="mt-4 flex items-center gap-2">
            <Badge className={`bg-gradient-to-r ${currencyGradient?.from} ${currencyGradient?.to} text-white border-0`}>
              <span className="mr-2">{currencyGradient?.icon}</span>
              {selectedCurrency}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {currentStats.investmentsCount} yatırım
            </span>
          </div>
        )}
      </div>

      {/* Modern Stats Card */}
      <div className={`relative overflow-hidden rounded-xl border shadow-sm ${
        selectedCurrency === 'all' 
          ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200' 
          : `bg-gradient-to-br ${currencyGradient?.from}/10 ${currencyGradient?.to}/10 border-${currencyGradient?.from}/20`
      }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute inset-0 bg-gradient-to-br ${
            selectedCurrency === 'all' 
              ? 'from-slate-400 to-slate-600' 
              : `${currencyGradient?.from} ${currencyGradient?.to}`
          }`} />
        </div>
        
        <div className="relative p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Investment */}
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 text-blue-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                ₺{formatPrice(currentStats.totalInvestment)}
              </div>
              <div className="text-sm text-muted-foreground">Toplam Yatırım</div>
            </div>
            
            {/* Current Value */}
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 text-green-600">
                <Target className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                ₺{formatPrice(currentStats.currentValue)}
              </div>
              <div className="text-sm text-muted-foreground">Mevcut Değer</div>
            </div>
            
            {/* Total Profit */}
            <div className="text-center">
              <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full ${
                currentStats.totalProfit >= 0 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {currentStats.totalProfit >= 0 ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
              </div>
              <div className={`text-2xl font-bold mb-1 ${
                currentStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentStats.totalProfit >= 0 ? '+' : ''}₺{formatPrice(currentStats.totalProfit)}
              </div>
              <div className="text-sm text-muted-foreground">Kar/Zarar</div>
            </div>
            
            {/* Profit Percentage */}
            <div className="text-center">
              <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full ${
                currentStats.profitPercentage >= 0 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                <Activity className="w-6 h-6" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${
                currentStats.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentStats.profitPercentage >= 0 ? '+' : ''}{currentStats.profitPercentage.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">Yüzde Değişim</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Summary Cards */}
      {selectedCurrency === 'all' && Object.keys(currencyStats).length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-4 text-foreground">Döviz Bazında Özet</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(currencyStats).map(([currency, stats]) => {
              const gradient = getCurrencyGradient(currency)
              const isProfit = stats.totalProfit >= 0
              
              return (
                <Card key={currency} className="hover:shadow-md transition-all duration-200 hover:scale-105">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{gradient.icon}</span>
                        <span className="font-bold text-lg">{currency.split('/')[0]}</span>
                      </div>
                      <Badge variant={isProfit ? 'default' : 'destructive'} className="text-xs">
                        {isProfit ? 'Kâr' : 'Zarar'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Değer:</span>
                        <span className="font-medium">₺{formatPrice(stats.currentValue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Kar:</span>
                        <span className={`font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                          {isProfit ? '+' : ''}₺{formatPrice(stats.totalProfit)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Yüzde:</span>
                        <span className={`font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                          {isProfit ? '+' : ''}{stats.profitPercentage.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default SummaryStatistics