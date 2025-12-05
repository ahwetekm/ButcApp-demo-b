'use client'

import React, { useState, useRef } from 'react'
import { X, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useMobile } from '@/hooks/useMobile'

interface MobileModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  showCloseButton?: boolean
  size?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

export function MobileModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showCloseButton = true,
  size = 'md',
  className = ''
}: MobileModalProps) {
  const { isMobile } = useMobile()
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
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

  const getSizeClasses = () => {
    const sizes = {
      sm: 'w-11/12 h-5/6',
      md: 'w-3/4 h-1/2',
      lg: 'w-5/6 h-2/3',
      full: 'w-11/12 h-5/6'
    }
    return sizes[size]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl ${getSizeClasses()} ${className}`}
        onClick={handleBackdropClick}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="flex items-center justify-between border-b pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </CardTitle>
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