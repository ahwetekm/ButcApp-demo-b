'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTouchGestures } from '@/hooks/useTouchGestures'
import { useMobile } from '@/hooks/useMobile'

interface MobileCarouselProps {
  children: React.ReactNode[]
  className?: string
  autoPlay?: boolean
  autoPlayInterval?: number
  showIndicators?: boolean
  showArrows?: boolean
  onSlideChange?: (index: number) => void
}

export function MobileCarousel({ 
  children, 
  className = '',
  autoPlay = false,
  autoPlayInterval = 5000,
  showIndicators = true,
  showArrows = true,
  onSlideChange 
}: MobileCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay)
  const [isPaused, setIsPaused] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const { isMobile } = useMobile()

  const handleSwipeLeft = () => {
    if (children.length > 0) {
      const newIndex = currentIndex === 0 ? children.length - 1 : currentIndex - 1
      setCurrentIndex(newIndex)
      onSlideChange?.(newIndex)
    }
  }

  const handleSwipeRight = () => {
    if (children.length > 0) {
      const newIndex = (currentIndex + 1) % children.length
      setCurrentIndex(newIndex)
      onSlideChange?.(newIndex)
    }
  }

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
    onSlideChange?.(index)
  }

  const handlePrev = () => {
    if (children.length > 0) {
      const newIndex = currentIndex === 0 ? children.length - 1 : currentIndex - 1
      setCurrentIndex(newIndex)
      onSlideChange?.(newIndex)
    }
  }

  const handleNext = () => {
    if (children.length > 0) {
      const newIndex = (currentIndex + 1) % children.length
      setCurrentIndex(newIndex)
      onSlideChange?.(newIndex)
    }
  }

  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsPaused(true)
      setIsAutoPlaying(false)
    } else {
      setIsAutoPlaying(true)
      setIsPaused(false)
    }
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isPaused || !autoPlay) return

    const interval = setInterval(() => {
      handleNext()
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, isPaused, autoPlay, autoPlayInterval, handleNext])

  // Touch gesture handlers
  const touchHandlers = {
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onDoubleTap: () => {
      // Double tap to pause/resume
      toggleAutoPlay()
    }
  }

  const { isSwiping } = useTouchGestures(carouselRef, touchHandlers)

  if (!isMobile) {
    return null // Don't render carousel on desktop
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={carouselRef}
        className="overflow-hidden rounded-lg"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isSwiping ? 'none' : 'transform 0.5s ease-in-out'
        }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0"
            style={{
              flex: '0 0 auto',
              minWidth: '100%'
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="absolute left-2 top-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-lg"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="absolute right-2 top-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-lg"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && (
        <div className="flex justify-center space-x-2 mt-4">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Slide ${index + 1} of ${children.length}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play Controls */}
      {autoPlay && (
        <div className="flex justify-center mt-4 space-x-2">
          <Button
            variant={isPaused ? "default" : "outline"}
            size="sm"
            onClick={toggleAutoPlay}
          >
            {isPaused ? '▶' : '⏸'}
          </Button>
        </div>
      )}
    </div>
  )
}