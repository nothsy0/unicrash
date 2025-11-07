'use client'

import { useEffect, useState } from 'react'

interface FloatingElement {
  id: number
  emoji: string
  left: number
  delay: number
  duration: number
  size: number
}

export function DecorativeBackground() {
  const [elements, setElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    const emojis = ['💕', '💖', '✨', '🌟', '💫', '🌸', '🌺', '🌷', '🦋', '⭐', '💝', '💗']
    
    const initialElements: FloatingElement[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
      size: 20 + Math.random() * 30
    }))

    setElements(initialElements)

    // Her 3 saniyede bir yeni element ekle
    const interval = setInterval(() => {
      const newElement: FloatingElement = {
        id: Date.now(),
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: Math.random() * 100,
        delay: 0,
        duration: 15 + Math.random() * 10,
        size: 20 + Math.random() * 30
      }
      setElements(prev => [...prev.slice(-14), newElement])
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating Elements */}
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute animate-float-up opacity-20"
          style={{
            left: `${element.left}%`,
            bottom: '-50px',
            fontSize: `${element.size}px`,
            animationDelay: `${element.delay}s`,
            animationDuration: `${element.duration}s`,
          }}
        >
          {element.emoji}
        </div>
      ))}

      {/* Geometric Shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-pink-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-20 w-36 h-36 bg-purple-200/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-40 right-10 w-28 h-28 bg-rose-200/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      
      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-white/5 via-transparent to-transparent"></div>
      
      {/* Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      ></div>
    </div>
  )
}


