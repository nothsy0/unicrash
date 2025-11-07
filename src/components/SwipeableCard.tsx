'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onSwipeUp?: () => void // Super Like için
  disabled?: boolean
}

export function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight,
  onSwipeUp,
  disabled = false 
}: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-300, 300], [-15, 15])
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return

    const threshold = 100

    if (info.offset.x > threshold) {
      // Sağa kaydırma (Like)
      onSwipeRight()
    } else if (info.offset.x < -threshold) {
      // Sola kaydırma (Pass)
      onSwipeLeft()
    } else if (info.offset.y < -threshold && onSwipeUp) {
      // Yukarı kaydırma (Super Like)
      onSwipeUp()
    } else {
      // Geri dön
      x.set(0)
      y.set(0)
    }
  }

  useEffect(() => {
    if (!isDragging) {
      x.set(0)
      y.set(0)
    }
  }, [isDragging, x, y])

  return (
    <motion.div
      drag={!disabled ? (onSwipeUp ? ['x', 'y'] : 'x') : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(event, info) => {
        handleDragEnd(event as any, info)
        setIsDragging(false)
      }}
      style={{
        x,
        y: onSwipeUp ? y : 0,
        rotate,
        opacity,
        cursor: disabled ? 'default' : 'grab'
      }}
      whileDrag={{ cursor: 'grabbing' }}
      className="w-full relative"
    >
      {children}
      
      {/* Swipe Indicator Overlays */}
      {!disabled && isDragging && (
        <>
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            style={{
              opacity: useTransform(x, [0, 150], [0, 1]),
            }}
          >
            <div className="bg-green-500/20 border-4 border-green-500 rounded-3xl w-full h-full flex items-center justify-center">
              <span className="text-6xl">❤️</span>
            </div>
          </motion.div>
          
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            style={{
              opacity: useTransform(x, [-150, 0], [1, 0]),
            }}
          >
            <div className="bg-red-500/20 border-4 border-red-500 rounded-3xl w-full h-full flex items-center justify-center">
              <span className="text-6xl">✕</span>
            </div>
          </motion.div>
          
          {onSwipeUp && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              style={{
                opacity: useTransform(y, [-150, 0], [1, 0]),
              }}
            >
              <div className="bg-blue-500/20 border-4 border-blue-500 rounded-3xl w-full h-full flex items-center justify-center">
                <span className="text-6xl">⭐</span>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}

