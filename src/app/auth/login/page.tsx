'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hearts, setHearts] = useState<Array<{ id: number; left: number }>>([])
  const router = useRouter()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Giriş başarılı! 🎉')
        // Cookie'nin set edilmesi için kısa bir bekleme
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 100)
      } else {
        const errorMsg = data.message || 'Giriş başarısız'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (err) {
      const errorMsg = 'Bir hata oluştu'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

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

      <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 relative z-10 border-2 border-pink-200">
        <div className="text-center mb-4 sm:mb-6">
          <div className="text-5xl sm:text-6xl mb-2 sm:mb-3 animate-pulse">💕</div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
            UniCrash
          </h1>
          <p className="text-gray-600 font-semibold text-sm sm:text-base">Giriş Yap ve Aşkı Keşfet! 🔥</p>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
              📧 E-posta
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 placeholder:text-gray-700 font-medium"
              placeholder="ornek@universite.edu.tr"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
              🔒 Şifre
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 placeholder:text-gray-700 font-medium"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 disabled:bg-gray-300 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 touch-manipulation text-sm sm:text-base"
          >
            {loading ? '⏳ Giriş yapılıyor...' : '💕 Giriş Yap ve Aşkı Bul'}
          </button>
        </form>

        <div className="text-center mt-6 space-y-3">
          <Link href="/auth/forgot-password" className="block text-purple-600 hover:text-purple-700 font-semibold underline text-sm">
            🔒 Şifremi Unuttum
          </Link>
          <p className="text-gray-600 font-medium">
            Hesabın yok mu?{' '}
            <Link href="/auth/register" className="text-purple-600 hover:text-purple-700 font-bold underline">
              ✨ Kayıt ol
            </Link>
          </p>
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
