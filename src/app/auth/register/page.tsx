'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    university: '',
    department: '',
    gender: ''
  })
  const [studentDocument, setStudentDocument] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [kvkkAccepted, setKvkkAccepted] = useState(false)
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

  const validatePassword = (password: string) => {
    if (password.length === 0) return null // Henüz yazılmamış
    
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('En az 8 karakter olmalıdır')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('En az 1 büyük harf içermelidir')
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('En az 1 özel karakter içermelidir')
    }
    
    return errors.length > 0 ? errors : null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStudentDocument(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Şifre validasyonu
    const passwordErrors = validatePassword(formData.password)
    if (passwordErrors) {
      setError(passwordErrors.join(', '))
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    if (!kvkkAccepted) {
      setError('KVKK koşullarını kabul etmelisiniz')
      setLoading(false)
      return
    }

    if (!studentDocument) {
      setError('Öğrenci belgesi yüklemelisiniz')
      setLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('name', formData.name)
      formDataToSend.append('age', formData.age)
      formDataToSend.append('university', formData.university)
      formDataToSend.append('department', formData.department)
      formDataToSend.append('gender', formData.gender)
      formDataToSend.append('studentDocument', studentDocument)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formDataToSend
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      } else {
        setError(data.message || 'Kayıt başarısız')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 flex items-center justify-center relative overflow-hidden">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute text-4xl opacity-30 animate-float"
            style={{ left: `${heart.left}%`, top: '100%' }}
          >
            ❤️
          </div>
        ))}
        
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 relative z-10 border-2 border-pink-200 text-center">
          <div className="text-green-500 text-8xl mb-4 animate-bounce">✓</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-4">
            🎉 Kayıt Başarılı!
          </h1>
          <p className="text-gray-600 mb-4 font-semibold">
            Öğrenci belgeniz incelendikten sonra hesabınız onaylanacak.
          </p>
          <p className="text-sm text-gray-500 font-medium">
            Giriş sayfasına yönlendiriliyorsunuz... ⏳
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 flex items-center justify-center py-8 relative overflow-hidden">
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
        <div className="text-center mb-6">
          <div className="text-6xl mb-3 animate-pulse">✨</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Kayıt Ol
          </h1>
          <p className="text-gray-600 font-semibold">🔥 Üniversite öğrencisi olduğunu kanıtla!</p>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-posta *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 placeholder:text-gray-500 font-medium"
              placeholder="ornek@universite.edu.tr"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Ad Soyad
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Yaş
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="18"
                max="30"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 font-medium"
              />
            </div>
            <div>
              <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                Üniversite
              </label>
              <input
                type="text"
                id="university"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Bölüm
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 font-medium"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Cinsiyet *
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 font-medium"
            >
              <option value="">Cinsiyet Seçin</option>
              <option value="erkek">Erkek</option>
              <option value="kadın">Kadın</option>
              <option value="diğer">Diğer</option>
            </select>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 text-gray-900 font-medium ${
                formData.password && validatePassword(formData.password)
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-pink-500'
              }`}
            />
            {formData.password && validatePassword(formData.password) ? (
              <div className="mt-1">
                {validatePassword(formData.password)?.map((error, index) => (
                  <p key={index} className="text-xs text-red-600 font-medium">
                    ⚠️ {error}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Şifre en az 8 karakter olmalı, 1 büyük harf ve 1 özel karakter içermelidir.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Şifre Tekrar *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 font-medium"
            />
          </div>

          <div>
            <label htmlFor="studentDocument" className="block text-sm font-medium text-gray-700 mb-1">
              Öğrenci Belgesi * (PDF, JPG, PNG)
            </label>
            <input
              type="file"
              id="studentDocument"
              onChange={handleFileChange}
              required
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 font-medium"
            />
            <p className="text-xs text-gray-500 mt-1">
              Öğrenci belgenizi yükleyerek üniversite öğrencisi olduğunuzu kanıtlayın
            </p>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <input
              type="checkbox"
              id="kvkk"
              checked={kvkkAccepted}
              onChange={(e) => setKvkkAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500 cursor-pointer"
            />
            <label htmlFor="kvkk" className="text-sm text-gray-700 cursor-pointer flex-1">
              <span className="font-semibold">KVKK Aydınlatma Metni</span>'ni okudum ve{' '}
              <span className="font-semibold text-pink-600">Kişisel Verilerin Korunması Kanunu</span> kapsamında
              kişisel verilerimin işlenmesine izin veriyorum. *
            </label>
          </div>
          {error && !kvkkAccepted && error.includes('KVKK') && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg font-semibold">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !kvkkAccepted}
            className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              !kvkkAccepted ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? '⏳ Kayıt yapılıyor...' : '💕 Kayıt Ol ve Aşkı Başlat'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600 font-medium">
            Zaten hesabın var mı?{' '}
            <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-bold underline">
              ✨ Giriş yap
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
