'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [hearts, setHearts] = useState<Array<{ id: number; left: number }>>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setHearts((prev) => {
        const newHeart = { id: Date.now(), left: Math.random() * 100 }
        if (prev.length > 10) {
          return [newHeart]
        }
        return [...prev, newHeart]
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 flex items-center justify-center relative overflow-hidden">
      {/* Uçan kalpler */}
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-4xl opacity-30 animate-float"
          style={{ left: `${heart.left}%`, top: '100%' }}
        >
          ❤️
        </div>
      ))}

      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 relative z-10 border-2 border-pink-200">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-6">
            <div className="text-8xl mb-2 animate-bounce">🔥</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
              UniCrash
            </h1>
            <p className="text-xl text-gray-700 font-semibold">
              Üniversite Aşkını Bul ❤️
            </p>
          </div>

          {/* Açıklama */}
          <p className="text-gray-600 mb-8 text-lg">
            Üniversiteliler için ateşli dating deneyimi
          </p>

          {/* Butonlar */}
          <div className="space-y-4">
            <Link 
              href="/auth/login"
              className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              💕 Giriş Yap ve Aşkı Bul
            </Link>
            
            <Link 
              href="/auth/register"
              className="block w-full border-3 border-purple-600 bg-white text-purple-600 hover:bg-purple-50 font-bold py-4 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ✨ Yeni Hesap Oluştur
            </Link>
          </div>

          {/* Alt metin */}
          <div className="mt-8 flex items-center justify-center space-x-2">
            <span className="text-2xl">❤️</span>
            <p className="text-sm text-gray-600 font-medium">
              Sadece üniversite öğrencileri katılabilir
            </p>
            <span className="text-2xl">🔥</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) scale(0.5);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float 5s linear forwards;
        }
      `}</style>
    </div>
  )
}