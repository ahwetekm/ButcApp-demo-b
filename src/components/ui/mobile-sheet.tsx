'use client'

import React, { useState, useRef } from 'react'
import { MoreHorizontal, MoreVertical, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useMobile } from '@/hooks/useMobile'

interface MobileSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  position?: 'bottom' | 'top' | 'left' | 'right'
  size?: 'sm' | 'md' | 'lg' | 'full'
  showCloseButton?: boolean
  className?: string
}

export function MobileSheet({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  position = 'bottom',
  size = 'md',
  showCloseButton = true,
  className = ''
}: MobileSheetProps) {
  const { isMobile } = useMobile()
  const sheetRef = useRef<HTMLDivElement>(null)

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === sheetRef.current) {
      onClose()
    }
  }

  // Handle escape key to close
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getPositionClasses = () => {
    const positions = {
      bottom: 'fixed bottom-0 left-0 right-0 transform translate-y-full transition-transform duration-300 ease-out',
      top: 'fixed top-0 left-0 right-0 transform -translate-y-full transition-transform duration-300 ease-out',
      left: 'fixed left-0 top-0 bottom-0 transform -translate-x-full transition-transform duration-300 ease-out',
      right: 'fixed right-0 top-0 bottom-0 transform translate-x-full transition-transform duration-300 ease-out'
    }
    return positions[position]
  }

  const getSizeClasses = () => {
    const sizes = {
      sm: 'h-1/2 w-11/12',
      md: 'h-3/4 w-3/4',
      lg: 'h-1/2 w-5/6',
      full: 'h-screen w-full'
    }
    return sizes[size]
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div 
        ref={sheetRef}
        className={`bg-white dark:bg-gray-800 ${getSizeClasses()} ${getPositionClasses()} ${className}`}
        onClick={handleBackdropClick}
      >
        <Card className="h-full max-w-md mx-auto">
          <CardHeader className="flex items-center justify-between border-b pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {isMobile ? 'Swipe down to close' : 'Click outside to close'}
              </Badge>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {position === 'bottom' ? <MoreHorizontal className="h-4 w-4" /> : <MoreVertical className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="max-h-96 overflow-y-auto">
              {children}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}