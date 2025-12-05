'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-react'

interface MiniChartProps {
  type: 'bar' | 'trend' | 'pie'
  value: number
  maxValue?: number
  targetValue?: number
  trend?: 'up' | 'down' | 'neutral'
  color?: 'green' | 'blue' | 'purple' | 'red' | 'orange'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  showPercentage?: boolean
}

export function MiniChart({ 
  type, 
  value, 
  maxValue, 
  targetValue, 
  trend, 
  color = 'green', 
  size = 'sm',
  label,
  showPercentage = false 
}: MiniChartProps) {
  const getColorClasses = () => {
    const baseColors = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500',
      orange: 'bg-orange-500'
    }
    return baseColors[color]
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3 text-green-600" />
    if (trend === 'down') return <TrendingDown className="h-3 w-3 text-red-600" />
    return <Minus className="h-3 w-3 text-gray-400" />
  }

  const getSizeClasses = () => {
    const sizes = {
      sm: 'h-1 w-full',
      md: 'h-2 w-full',
      lg: 'h-3 w-full'
    }
    return sizes[size]
  }

  const getPercentage = () => {
    if (!maxValue || maxValue === 0) return 0
    return Math.round((value / maxValue) * 100)
  }

  const getTargetPercentage = () => {
    if (!targetValue || !maxValue || maxValue === 0) return 0
    return Math.round((targetValue / maxValue) * 100)
  }

  if (type === 'bar') {
    const percentage = getPercentage()
    const targetPercentage = getTargetPercentage()
    
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{label}</span>
          <span className="font-medium">{percentage}%</span>
        </div>
        <div className="relative">
          {/* Progress bar */}
          <div className={`w-full ${getSizeClasses()} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
            <div 
              className={`h-full ${getColorClasses()} transition-all duration-500 ease-out`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          {/* Target indicator */}
          {targetValue && (
            <div 
              className="absolute top-0 h-full w-0.5 bg-gray-400 dark:bg-gray-500"
              style={{ left: `${targetPercentage}%` }}
            />
          )}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">₺{value.toLocaleString()}</span>
          {maxValue && <span className="text-gray-400">/ ₺{maxValue.toLocaleString()}</span>}
        </div>
      </div>
    )
  }

  if (type === 'trend') {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">₺{value.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-400'
          }`}>
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
            {Math.abs(value).toLocaleString()}
          </span>
        </div>
      </div>
    )
  }

  if (type === 'pie') {
    const percentage = getPercentage()
    const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500']
    const colorIndex = Math.floor(Math.random() * colors.length)
    
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 ${colors[colorIndex]} rounded-full`} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">₺{value.toLocaleString()}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">({percentage}%)</span>
          )}
        </div>
      </div>
    )
  }

  return null
}