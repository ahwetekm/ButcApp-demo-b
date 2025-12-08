'use client'

import React from 'react'
import { DollarSign, ShoppingCart, Home, Car, Heart, Coffee, Utensils, Zap, Gift, Shield, Briefcase, Plane, Gamepad2, Smartphone, Laptop, ShoppingBag, FileText } from 'lucide-react'

interface CategorySummaryProps {
  category: string
  amount: number
  percentage: number
  color: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendAmount?: number
  size?: 'sm' | 'md'
}

const defaultCategories = {
  'Gıda': { icon: <ShoppingCart className="h-3 w-3" />, color: 'text-orange-600' },
  'Ulaşım': { icon: <Car className="h-3 w-3" />, color: 'text-blue-600' },
  'Eğlence': { icon: <Gamepad2 className="h-3 w-3" />, color: 'text-purple-600' },
  'Sağlık': { icon: <Heart className="h-3 w-3" />, color: 'text-red-600' },
  'Alışveriş': { icon: <ShoppingBag className="h-3 w-3" />, color: 'text-green-600' },
  'Faturalar': { icon: <FileText className="h-3 w-3" />, color: 'text-indigo-600' },
  'Teknoloji': { icon: <Laptop className="h-3 w-3" />, color: 'text-cyan-600' },
  'Eğitim': { icon: <Briefcase className="h-3 w-3" />, color: 'text-yellow-600' },
  'Seyahat': { icon: <Plane className="h-3 w-3" />, color: 'text-pink-600' },
  'Kira': { icon: <Home className="h-3 w-3" />, color: 'text-gray-600' },
  'Sigorta': { icon: <Shield className="h-3 w-3" />, color: 'text-teal-600' },
  'Eğlence': { icon: <Coffee className="h-3 w-3" />, color: 'text-amber-600' },
  'Diğer': { icon: <Utensils className="h-3 w-3" />, color: 'text-gray-500' },
  'Hediye': { icon: <Gift className="h-3 w-3" />, color: 'text-rose-600' },
  'Yakıt': { icon: <Zap className="h-3 w-3" />, color: 'text-emerald-600' },
  'Telefon': { icon: <Smartphone className="h-3 w-3" />, color: 'text-sky-600' }
}

export function CategorySummary({ 
  category, 
  amount, 
  percentage, 
  color, 
  icon, 
  trend, 
  trendAmount,
  size = 'md' 
}: CategorySummaryProps) {
  const categoryInfo = defaultCategories[category as keyof typeof defaultCategories] || {
    icon: <DollarSign className="h-3 w-3" />,
    color: 'text-gray-600'
  }

  const getSizeClasses = () => {
    const sizes = {
      sm: 'p-2',
      md: 'p-3'
    }
    return sizes[size]
  }

  const getTrendIcon = () => {
    if (trend === 'up') return '↑'
    if (trend === 'down') return '↓'
    return '→'
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-400'
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${getSizeClasses()} hover:shadow-md transition-all duration-200 hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            {icon || categoryInfo.icon}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{category}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{percentage}%</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-bold text-gray-900 dark:text-white">₺{amount.toLocaleString()}</div>
            {trendAmount && (
              <div className={`text-xs ${getTrendColor()} flex items-center gap-1`}>
                <span>{getTrendIcon()}</span>
                <span>₺{Math.abs(trendAmount).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}