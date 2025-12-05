import { useState, useEffect, useRef } from 'react'

interface TouchHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: () => void
  onDoubleTap?: () => void
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  velocity: number
}

export function useTouchGestures(elementRef: React.RefObject<HTMLElement>, handlers: TouchHandlers) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null)
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null)

  const threshold = 50 // Minimum swipe mesafesi
  const velocityThreshold = 0.3 // Minimum hız
  const timeLimit = 300 // Maksimum swipe süresi

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    let touchEndTimeout: NodeJS.Timeout | null

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      })
      setIsSwiping(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart || !isSwiping) return
      
      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y
      
      // Swipe yönünü belirle
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          setSwipeDirection('right')
        } else {
          setSwipeDirection('left')
        }
      } else {
        if (deltaY > 0) {
          setSwipeDirection('down')
        } else {
          setSwipeDirection('up')
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart || !isSwiping) return

      const touch = e.changedTouches[0]
      const deltaTime = Date.now() - touchStart.time
      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const velocity = distance / deltaTime

      // Clear any existing timeout
      if (touchEndTimeout) {
        clearTimeout(touchEndTimeout)
      }

      // Check if it's a valid swipe
      if (
        distance > threshold &&
        velocity > velocityThreshold &&
        deltaTime < timeLimit &&
        swipeDirection
      ) {
        // Trigger the appropriate handler
        switch (swipeDirection) {
          case 'left':
            handlers.onSwipeLeft?.()
            break
          case 'right':
            handlers.onSwipeRight?.()
            break
          case 'up':
            handlers.onSwipeUp?.()
            break
          case 'down':
            handlers.onSwipeDown?.()
            break
        }
      }

      // Reset state
      setTouchStart(null)
      setIsSwiping(false)
      setSwipeDirection(null)

      // Set timeout to reset state if no action is taken
      touchEndTimeout = setTimeout(() => {
        setTouchStart(null)
        setIsSwiping(false)
        setSwipeDirection(null)
      }, 100)
    }

    // Double tap detection
    let lastTap = 0
    const handleTouchEndForDoubleTap = (e: TouchEvent) => {
      const currentTime = Date.now()
      if (currentTime - lastTap < 300) {
        handlers.onDoubleTap?.()
      }
      lastTap = currentTime
    }

    // Pinch detection
    let initialDistance = 0
    const handleTouchStartForPinch = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          2
        )
      }
    }

    const handleTouchMoveForPinch = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          2
        )
        
        if (initialDistance > 0) {
          const scale = currentDistance / initialDistance
          if (scale < 0.8) {
            handlers.onPinch?.()
          }
        }
      }
    }

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })
    element.addEventListener('touchend', handleTouchEndForDoubleTap, { passive: false })
    element.addEventListener('touchstart', handleTouchStartForPinch, { passive: false })
    element.addEventListener('touchmove', handleTouchMoveForPinch, { passive: false })

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('end', handleTouchEndForDoubleTap)
      element.removeEventListener('touchstart', handleTouchStartForPinch)
      element.removeEventListener('move', handleTouchMoveForPinch)
      if (touchEndTimeout) {
        clearTimeout(touchEndTimeout)
      }
    }
  }, [elementRef, handlers, touchStart, isSwiping, swipeDirection])

  return {
    isSwiping,
    swipeDirection
  }
}