'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.message || 'Bir hata oluştu')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 relative z-10 border-2 border-pink-200 text-center">
          <div className="text-purple-500 text-8xl mb-4">🔗</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Link Oluşturuldu!
          </h1>
          <p className="text-gray-600 mb-4 font-semibold">
            Şifre sıfırlama linkini görmek için terminale bak.
          </p>
          <p className="text-xs text-gray-500 mb-2 bg-gray-100 p-4 rounded-lg font-mono break-all">
            Terminalde "Şifre sıfırlama linki:" yazısını bul ve linki kopyala
          </p>
          <p className="text-sm text-gray-600 mb-6">
            NOT: Gerçek uygulamada bu link e-postana gönderilir.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg transition duration-200"
          >
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 flex items-center justify-center">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 relative z-10 border-2 border-pink-200">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🔒</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Şifremi Unuttum
          </h1>
          <p className="text-gray-600 font-semibold">E-posta adresini gir, şifre sıfırlama linki gönderelim</p>
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-700 font-medium"
              placeholder="ornek@universite.edu.tr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loading ? '⏳ Gönderiliyor...' : '📧 Link Gönder'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-bold underline">
            ← Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  )
}

