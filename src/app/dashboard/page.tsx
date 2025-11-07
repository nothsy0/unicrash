'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DecorativeBackground } from '@/components/DecorativeBackground'

interface User {
  id: string
  email: string
  name: string
  age: number
  university: string
  department: string
  bio: string
  profileImage: string
  photos: string | null
  isVerified: boolean
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [matchCount, setMatchCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Cookie'yi oku
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
      return null
    }

    const userId = getCookie('userId')

    if (!userId) {
      router.push('/auth/login')
      return
    }

    // Kullanıcı bilgilerini al
    fetchUserData(userId)
    fetchMatchCount(userId)
  }, [router])

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/${userId}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchMatchCount = async (userId: string) => {
    try {
      const response = await fetch('/api/matches', {
        credentials: 'include'
      })
      if (response.ok) {
        const matches = await response.json()
        setMatchCount(matches.length)
      }
    } catch (error) {
      console.error('Error fetching match count:', error)
    }
  }

  const handleLogout = () => {
    document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-white text-lg font-semibold">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 flex items-center justify-center">
        <div className="text-white text-xl">Kullanıcı bulunamadı</div>
      </div>
    )
  }

  // Profil tamamlanma yüzdesi hesapla
  const calculateProfileCompletion = () => {
    if (!user) return 0
    let completed = 0
    let total = 6
    
    if (user.name) completed++
    if (user.age) completed++
    if (user.university) completed++
    if (user.department) completed++
    if (user.bio) completed++
    if (user.photos) {
      try {
        const photos = JSON.parse(user.photos)
        if (photos && photos.length > 0) completed++
      } catch {}
    }
    
    return Math.round((completed / total) * 100)
  }

  const profileCompletion = calculateProfileCompletion()

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 relative overflow-hidden">
      <DecorativeBackground />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">UniCrash</h1>
            <p className="text-white/80 text-xs sm:text-sm">Üniversite Aşkını Bul 💕</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/90 backdrop-blur-sm text-pink-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-white active:bg-white/80 transition duration-200 shadow-lg hover:scale-105 transform text-sm sm:text-base touch-manipulation w-full sm:w-auto"
          >
            Çıkış Yap
          </button>
        </div>

        {/* Profil Kartı */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6 border border-white/20">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
            {(() => {
              let firstPhoto: string | null = null
              if (user.photos) {
                try {
                  const photosArray = JSON.parse(user.photos)
                  if (Array.isArray(photosArray) && photosArray.length > 0 && photosArray[0]) {
                    firstPhoto = photosArray[0]
                  }
                } catch {
                  firstPhoto = null
                }
              }
              
              return (
                <div className="relative mx-auto md:mx-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-pink-400 shadow-2xl ring-4 ring-purple-300">
                    {firstPhoto ? (
                      <img
                        src={firstPhoto}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                        <span className="text-4xl sm:text-5xl">👤</span>
                      </div>
                    )}
                  </div>
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-green-500 rounded-full p-1.5 sm:p-2 shadow-lg border-2 sm:border-4 border-white">
                      <span className="text-white text-base sm:text-xl">✓</span>
                    </div>
                  )}
                </div>
              )
            })()}
            
            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{user.name || 'İsimsiz'}</h2>
                {user.isVerified && (
                  <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
                    Onaylı Hesap ✓
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-1 sm:mb-2">
                <span className="text-base sm:text-lg">🎓</span>
                <p className="text-base sm:text-lg font-medium">{user.university}</p>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-1 sm:mb-2">
                <span className="text-base sm:text-lg">📚</span>
                <p className="text-base sm:text-lg font-medium">{user.department}</p>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mb-2">
                <span className="text-base sm:text-lg">🎂</span>
                <p className="text-sm sm:text-base">{user.age} yaşında</p>
              </div>
              {user.bio && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border-l-4 border-pink-400">
                  <p className="text-gray-700 italic text-sm sm:text-base">{user.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Profil Tamamlanma */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">Profil Tamamlanma</span>
              <span className="text-sm font-bold text-pink-600">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        {user.isVerified && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 text-white transform hover:scale-105 active:scale-95 transition duration-200 touch-manipulation">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm opacity-90 mb-1">Eşleşmeler</p>
                  <p className="text-3xl sm:text-4xl font-bold">{matchCount}</p>
                </div>
                <div className="text-4xl sm:text-5xl opacity-50">💕</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 text-white transform hover:scale-105 active:scale-95 transition duration-200 touch-manipulation">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm opacity-90 mb-1">Profil Görünümü</p>
                  <p className="text-3xl sm:text-4xl font-bold">-</p>
                </div>
                <div className="text-4xl sm:text-5xl opacity-50">👁️</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 text-white transform hover:scale-105 active:scale-95 transition duration-200 touch-manipulation">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm opacity-90 mb-1">Beğeni Hakkı</p>
                  <p className="text-3xl sm:text-4xl font-bold">∞</p>
                </div>
                <div className="text-4xl sm:text-5xl opacity-50">🔥</div>
              </div>
            </div>
          </div>
        )}

        {!user.isVerified ? (
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 text-yellow-800 px-6 py-4 rounded-2xl mb-6 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-3xl">⏳</span>
              <div>
                <p className="font-bold text-lg mb-1">Hesabınız onay bekliyor</p>
                <p className="text-sm">Öğrenci belgeniz incelendikten sonra hesabınız aktif olacak. Bu süreç genellikle 24 saat içinde tamamlanır.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Profilini Tamamla Kartı */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20 hover:shadow-2xl transform hover:scale-105 active:scale-95 transition duration-200 touch-manipulation">
              <div className="text-center mb-3 sm:mb-4">
                <div className="inline-block bg-gradient-to-r from-purple-400 to-pink-400 rounded-full p-3 sm:p-4 mb-2 sm:mb-3">
                  <span className="text-3xl sm:text-4xl">✨</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">Profilini Tamamla</h3>
                <p className="text-gray-600 text-xs sm:text-sm">İlgi alanlarını seç ve daha iyi eşleşmeler bul!</p>
              </div>
              <button 
                onClick={() => router.push('/profile-builder')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 text-white font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl transition duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base touch-manipulation"
              >
                Profili Oluştur
              </button>
            </div>

            {/* Keşfet Kartı */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transform hover:scale-105 transition duration-200">
              <div className="text-center mb-4">
                <div className="inline-block bg-gradient-to-r from-red-400 to-orange-400 rounded-full p-4 mb-3">
                  <span className="text-4xl">🔥</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Keşfet</h3>
                <p className="text-gray-600 text-sm">Yeni insanlarla tanış ve eşleş!</p>
              </div>
              <button 
                onClick={() => router.push('/discover')}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg hover:shadow-xl"
              >
                Keşfetmeye Başla
              </button>
            </div>

            {/* Eşleşmelerim Kartı */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transform hover:scale-105 transition duration-200">
              <div className="text-center mb-4">
                <div className="inline-block bg-gradient-to-r from-pink-400 to-rose-400 rounded-full p-4 mb-3 relative">
                  <span className="text-4xl">💬</span>
                  {matchCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {matchCount}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Eşleşmelerim</h3>
                <p className="text-gray-600 text-sm">Eşleştiğin kişilerle sohbet et!</p>
              </div>
              <button 
                onClick={() => router.push('/matches')}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg hover:shadow-xl"
              >
                Eşleşmeleri Gör {matchCount > 0 && `(${matchCount})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

