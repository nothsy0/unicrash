'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { DecorativeBackground } from '@/components/DecorativeBackground'
import { SwipeableCard } from '@/components/SwipeableCard'
import { Button } from '@/components/Button'

type DiscoverUser = {
  id: string
  name: string
  age: number
  university: string
  department: string
  bio: string
  photos: string[]
  gender: string
  matchPercentage: number
}

export default function DiscoverPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [users, setUsers] = useState<DiscoverUser[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [swiping, setSwiping] = useState(false)
  const [showMatch, setShowMatch] = useState(false)
  const [showPeriodicAd, setShowPeriodicAd] = useState(false)
  const [periodicAdProgress, setPeriodicAdProgress] = useState(0)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [showLikeAnimation, setShowLikeAnimation] = useState(false)
  const [showRejectAnimation, setShowRejectAnimation] = useState(false)
  const [superLikesLeft, setSuperLikesLeft] = useState(5)
  const [canUndo, setCanUndo] = useState(false)
  const [boostActive, setBoostActive] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 30,
    university: '',
    department: ''
  })
  const router = useRouter()

  const checkPeriodicAd = async () => {
    try {
      const response = await fetch('/api/user/check-ad', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.shouldShowAd) {
          setShowPeriodicAd(true)
        }
      }
    } catch (error) {
      console.error('Error checking periodic ad:', error)
    }
  }

  const watchPeriodicAd = async () => {
    try {
      const response = await fetch('/api/user/watch-periodic-ad', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        setShowPeriodicAd(false)
        setPeriodicAdProgress(0)
      } else {
        const error = await response.json()
        if (error.code === 'TOO_SOON') {
          setShowPeriodicAd(false)
          setPeriodicAdProgress(0)
        }
      }
    } catch (error) {
      console.error('Error watching periodic ad:', error)
    }
  }

  const startPeriodicAd = () => {
    setPeriodicAdProgress(0)
    const duration = 5 // 5 saniye
    const interval = setInterval(() => {
      setPeriodicAdProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          watchPeriodicAd()
          return 100
        }
        return prev + (100 / (duration * 10)) // 10 frame per second
      })
    }, 100) // Her 100ms'de bir güncelle
  }

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
      return null
    }

    const id = getCookie('userId')
    if (!id) {
      router.push('/auth/login')
      return
    }

    setUserId(id)
    fetchUsers(id)
    checkPeriodicAd()
    
    // Her 30 saniyede bir reklam kontrolü yap
    const adCheckInterval = setInterval(checkPeriodicAd, 30 * 1000)
    
    return () => clearInterval(adCheckInterval)
  }, [router])

  // Yeni kullanıcıya geçildiğinde animasyonları sıfırla
  useEffect(() => {
    setShowLikeAnimation(false)
    setShowRejectAnimation(false)
  }, [currentIndex])

  // Klavye navigasyonu (fotoğraf geçişi için)
  useEffect(() => {
    if (!showProfileModal || users.length === 0 || currentIndex >= users.length) return

    const currentUserForKeyboard = users[currentIndex]

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && selectedPhotoIndex > 0) {
        setSelectedPhotoIndex(selectedPhotoIndex - 1)
      } else if (e.key === 'ArrowRight' && currentUserForKeyboard.photos && selectedPhotoIndex < currentUserForKeyboard.photos.length - 1) {
        setSelectedPhotoIndex(selectedPhotoIndex + 1)
      } else if (e.key === 'Escape') {
        setShowProfileModal(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showProfileModal, selectedPhotoIndex, users, currentIndex])

  const fetchUsers = async (id: string) => {
    try {
      const params = new URLSearchParams()
      if (filters.minAge) params.append('minAge', filters.minAge.toString())
      if (filters.maxAge) params.append('maxAge', filters.maxAge.toString())
      if (filters.university) params.append('university', filters.university)
      if (filters.department) params.append('department', filters.department)

      const response = await fetch(`/api/discover?${params.toString()}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        console.error('Kullanıcı bulunamadı')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (isLike: boolean, isSuperLike: boolean = false) => {
    if (!userId || swiping || currentIndex >= users.length) return

    setSwiping(true)
    const currentUser = users[currentIndex]

    // Animasyonu göster
    if (isLike) {
      setShowLikeAnimation(true)
    } else {
      setShowRejectAnimation(true)
    }

    try {
      const response = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          swipedUserId: currentUser.id,
          isLike,
          isSuperLike
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Animasyon süresi (1 saniye)
        setTimeout(() => {
          // Animasyonları kapat
          setShowLikeAnimation(false)
          setShowRejectAnimation(false)
          
          // Kartı değiştir
          if (data.isMatch) {
            toast.success('Eşleşme! 🎉')
            setShowMatch(true)
            setTimeout(() => {
              setShowMatch(false)
              setCurrentIndex(prev => prev + 1)
              setSwiping(false)
            }, 2000)
          } else {
            setCurrentIndex(prev => prev + 1)
            setSwiping(false)
            setCanUndo(true)
            // 5 dakika sonra undo'yu devre dışı bırak
            setTimeout(() => setCanUndo(false), 5 * 60 * 1000)
          }
        }, 1000) // 1 saniye bekle
      } else {
        // Hata durumunda animasyonları kapat
        setShowLikeAnimation(false)
        setShowRejectAnimation(false)
        setSwiping(false)
        
        if (data.code === 'AD_REQUIRED_FOR_LIKES') {
          toast.error('Beğeni hakkın kalmadı. Reklam izle!')
        } else {
          toast.error(data.message || 'Bir hata oluştu')
        }
      }
    } catch (error) {
      console.error('Swipe error:', error)
      // Hata durumunda animasyonları kapat
      setShowLikeAnimation(false)
      setShowRejectAnimation(false)
      setSwiping(false)
      toast.error('Bir hata oluştu')
    }
  }

  const handleSuperLike = async () => {
    await handleSwipe(true, true)
    if (superLikesLeft > 0) {
      setSuperLikesLeft(prev => prev - 1)
    }
  }

  const handleUndo = async () => {
    if (!canUndo || !userId) return

    try {
      const response = await fetch('/api/swipe/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentIndex(prev => Math.max(0, prev - 1))
        setCanUndo(false)
        toast.success('Swipe geri alındı!')
        // Kullanıcı listesini yeniden yükle
        fetchUsers(userId!)
      } else {
        toast.error('Geri alınamadı')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    }
  }

  const handleBoost = async () => {
    try {
      const response = await fetch('/api/user/boost', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Boost aktif! Profilin öncelikli gösterilecek 🚀')
        setBoostActive(true)
        // 30 dakika sonra boost'u kapat
        setTimeout(() => setBoostActive(false), 30 * 60 * 1000)
      } else {
        toast.error('Boost aktifleştirilemedi')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    }
  }

  useEffect(() => {
    // Super Like ve Boost durumunu kontrol et
    const checkStatus = async () => {
      if (!userId) return
      
      // Super Like sayısını kontrol et (API'den gelecek)
      // Şimdilik varsayılan değer
      
      // Boost durumunu kontrol et
      try {
        const response = await fetch('/api/user/boost', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setBoostActive(data.isActive)
        }
      } catch (error) {
        console.error('Boost check error:', error)
      }
    }
    
    checkStatus()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  if (users.length === 0 || currentIndex >= users.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-pink-200">
          <div className="text-6xl mb-4">💔</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Daha Fazla Kullanıcı Yok
          </h1>
          <p className="text-gray-600 mb-6">
            Şimdilik keşfedilecek daha fazla kişi yok. Daha sonra tekrar bak!
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg transition duration-200"
          >
            Dashboard'a Dön
          </button>
        </div>
      </div>
    )
  }

  const currentUser = users[currentIndex]
  const firstPhoto = currentUser.photos && currentUser.photos.length > 0 
    ? currentUser.photos[0] 
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 p-2 sm:p-4 relative overflow-hidden">
      <DecorativeBackground />
      <div className="max-w-md mx-auto pt-4 sm:pt-8 relative z-10">
        <div className="flex justify-between items-center mb-4 sm:mb-6 px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">UniCrash</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-white hover:text-gray-200 font-semibold text-sm sm:text-base px-2 py-2 touch-manipulation"
          >
            ← Geri
          </button>
        </div>

        {/* Match Popup */}
        {showMatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center">
              <div className="text-6xl sm:text-8xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Eşleşme!</h2>
              <p className="text-sm sm:text-base text-gray-600">İkiniz de birbirinizi beğendiniz! 💕</p>
            </div>
          </div>
        )}

        {/* Top Bar - Boost, Filters, Undo */}
        <div className="flex justify-between items-center mb-4 px-2 gap-2">
          <Button
            size="sm"
            variant={boostActive ? "primary" : "secondary"}
            onClick={handleBoost}
            disabled={boostActive}
          >
            {boostActive ? '🚀 Boost Aktif' : '🚀 Boost'}
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 Filtreler
          </Button>
          
          {canUndo && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleUndo}
            >
              ↶ Geri Al
            </Button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 mb-4 shadow-lg">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Min Yaş</label>
                <input
                  type="number"
                  value={filters.minAge}
                  onChange={(e) => setFilters({...filters, minAge: parseInt(e.target.value) || 18})}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="18"
                  max="100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Max Yaş</label>
                <input
                  type="number"
                  value={filters.maxAge}
                  onChange={(e) => setFilters({...filters, maxAge: parseInt(e.target.value) || 30})}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="18"
                  max="100"
                />
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setShowFilters(false)
                fetchUsers(userId!)
              }}
              className="w-full"
            >
              Filtrele
            </Button>
          </div>
        )}

        {/* Kullanıcı Kartı */}
        <SwipeableCard
          onSwipeLeft={() => handleSwipe(false)}
          onSwipeRight={() => handleSwipe(true)}
          onSwipeUp={superLikesLeft > 0 ? handleSuperLike : undefined}
          disabled={swiping}
        >
        <div 
          className={`bg-white rounded-3xl shadow-2xl overflow-hidden relative transition-all duration-1000 ease-in-out ${
            showLikeAnimation ? 'translate-x-full opacity-0' : 
            showRejectAnimation ? '-translate-x-full opacity-0' : 
            'translate-x-0 opacity-100'
          }`}
        >
          {/* Fotoğraf */}
          <div 
            className="aspect-[3/4] bg-gray-100 relative cursor-pointer"
            onClick={() => {
              setSelectedPhotoIndex(0)
              setShowProfileModal(true)
            }}
          >
            {firstPhoto ? (
              <img
                src={firstPhoto}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-200 to-pink-200">
                <span className="text-8xl">📸</span>
              </div>
            )}
            
            {/* Kullanıcı Bilgileri Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
              <h2 
                className="text-xl sm:text-3xl font-bold text-white mb-1 cursor-pointer hover:text-pink-200 transition-colors touch-manipulation"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedPhotoIndex(0)
                  setShowProfileModal(true)
                }}
              >
                {currentUser.name || 'İsimsiz'}
              </h2>
              <p className="text-white/90 mb-1 sm:mb-2 text-sm sm:text-base">
                {currentUser.age} yaşında
              </p>
              <p className="text-white/80 text-xs sm:text-sm">
                {currentUser.university} · {currentUser.department}
              </p>
              {currentUser.bio && (
                <p className="text-white/90 mt-2 text-xs sm:text-sm line-clamp-2">
                  {currentUser.bio}
                </p>
              )}
            </div>

            {/* Eşleşme Yüzdesi */}
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg">
              {currentUser.matchPercentage}% Eşleşme
            </div>

            {/* Fotoğraf Sayacı */}
            {currentUser.photos && currentUser.photos.length > 1 && (
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {currentUser.photos.length} fotoğraf
              </div>
            )}

            {/* Beğenme Animasyonu (Alev) */}
            {showLikeAnimation && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="text-9xl animate-pulse-fire">
                  🔥
                </div>
              </div>
            )}

            {/* Reddetme Animasyonu (Çarpı) */}
            {showRejectAnimation && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-32 h-32 bg-white/90 rounded-full flex items-center justify-center animate-pulse-reject shadow-2xl">
                  <div className="text-7xl text-red-500 font-bold">✕</div>
                </div>
              </div>
            )}
          </div>

          {/* Butonlar */}
          <div className="p-4 sm:p-6 flex justify-center items-center gap-3 sm:gap-4">
            <button
              onClick={() => handleSwipe(false)}
              disabled={swiping}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 shadow-lg touch-manipulation"
            >
              <span className="text-2xl sm:text-3xl">✕</span>
            </button>
            
            {superLikesLeft > 0 && (
              <button
                onClick={handleSuperLike}
                disabled={swiping}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 shadow-lg touch-manipulation relative"
                title="Super Like"
              >
                <span className="text-xl sm:text-2xl">⭐</span>
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {superLikesLeft}
                </span>
              </button>
            )}
            
            <button
              onClick={() => handleSwipe(true)}
              disabled={swiping}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 shadow-lg touch-manipulation"
            >
              <span className="text-2xl sm:text-3xl">❤️</span>
            </button>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="px-6 pb-4">
            <div className="flex gap-1">
              {users.slice(0, 10).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full ${
                    idx === currentIndex
                      ? 'bg-purple-500'
                      : idx < currentIndex
                      ? 'bg-gray-300'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              {currentIndex + 1} / {users.length}
            </p>
          </div>
        </div>
        </SwipeableCard>
      </div>

      {/* Profil Detay Modal */}
      {showProfileModal && currentUser && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto"
          onClick={() => setShowProfileModal(false)}
        >
          <div 
            className="bg-white rounded-0 sm:rounded-3xl shadow-2xl max-w-2xl w-full h-full sm:h-auto sm:my-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapatma Butonu */}
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-black/70 active:bg-black/90 transition-colors touch-manipulation"
            >
              ✕
            </button>

            {/* Fotoğraf Galerisi */}
            <div className="relative">
              {currentUser.photos && currentUser.photos.length > 0 ? (
                <>
                  <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                    <img
                      src={currentUser.photos[selectedPhotoIndex]}
                      alt={`${currentUser.name} - Fotoğraf ${selectedPhotoIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Fotoğraf Navigasyonu */}
                  {currentUser.photos.length > 1 && (
                    <>
                      {selectedPhotoIndex > 0 && (
                        <button
                          onClick={() => setSelectedPhotoIndex(selectedPhotoIndex - 1)}
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-black/70 active:bg-black/90 transition-colors touch-manipulation"
                        >
                          ←
                        </button>
                      )}
                      {selectedPhotoIndex < currentUser.photos.length - 1 && (
                        <button
                          onClick={() => setSelectedPhotoIndex(selectedPhotoIndex + 1)}
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-black/70 active:bg-black/90 transition-colors touch-manipulation"
                        >
                          →
                        </button>
                      )}
                      
                      {/* Fotoğraf Noktaları */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {currentUser.photos.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedPhotoIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === selectedPhotoIndex
                                ? 'bg-white w-6'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                          />
                        ))}
                      </div>
                      
                      {/* Fotoğraf Sayacı */}
                      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {selectedPhotoIndex + 1} / {currentUser.photos.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="aspect-[4/5] bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                  <span className="text-8xl">📸</span>
                </div>
              )}
            </div>

            {/* Kullanıcı Bilgileri */}
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                    {currentUser.name || 'İsimsiz'}
                  </h2>
                  <p className="text-gray-600 text-base sm:text-lg mb-2">
                    {currentUser.age} yaşında
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm mb-2">
                    {currentUser.university} · {currentUser.department}
                  </p>
                  <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold mt-2">
                    {currentUser.matchPercentage}% Eşleşme
                  </div>
                </div>
              </div>

              {/* Biyografi */}
              {currentUser.bio && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Hakkında</h3>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {currentUser.bio}
                  </p>
                </div>
              )}

              {/* Küçük Fotoğraf Önizlemeleri */}
              {currentUser.photos && currentUser.photos.length > 1 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Fotoğraflar</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {currentUser.photos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPhotoIndex(idx)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          idx === selectedPhotoIndex
                            ? 'border-purple-500 scale-105'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`Fotoğraf ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Periyodik Reklam Modal (15 dakikada bir) */}
      {showPeriodicAd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-pink-200">
            <div className="text-6xl mb-4">📺</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Periyodik Reklam
            </h2>
            <p className="text-gray-600 mb-6">
              Her 15 dakikada bir reklam izlemeniz gerekiyor. Devam etmek için reklamı izleyin.
            </p>
            
            {/* Reklam Simülasyonu */}
            <div className="bg-gradient-to-br from-purple-200 to-pink-200 rounded-xl p-8 mb-6 relative overflow-hidden">
              <div className="text-4xl mb-2">🎬</div>
              <p className="text-gray-700 font-semibold">Reklam İzleniyor...</p>
              
              {/* Progress Bar */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-100"
                  style={{ width: `${periodicAdProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {Math.round(periodicAdProgress)}% tamamlandı
              </p>
            </div>

            {periodicAdProgress === 0 ? (
              <button
                onClick={startPeriodicAd}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg transition duration-200"
              >
                Reklamı İzle
              </button>
            ) : (
              <div className="text-sm text-gray-500">
                Reklam izleniyor, lütfen bekleyin...
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse-fire {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          20% {
            transform: scale(1.2);
            opacity: 1;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
          60% {
            transform: scale(1.1);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes pulse-reject {
          0% {
            transform: scale(0.3) rotate(0deg);
            opacity: 0;
          }
          20% {
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
          }
          40% {
            transform: scale(1) rotate(360deg);
            opacity: 1;
          }
          60% {
            transform: scale(1.1) rotate(360deg);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.4) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-pulse-fire {
          animation: pulse-fire 1s ease-out forwards;
        }
        
        .animate-pulse-reject {
          animation: pulse-reject 1s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

