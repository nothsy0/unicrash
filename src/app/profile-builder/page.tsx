'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DecorativeBackground } from '@/components/DecorativeBackground'

type Interest = {
  id: string
  name: string
  emoji: string
  category: string
}

export default function ProfileBuilderPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [interests, setInterests] = useState<Interest[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState<boolean[]>(Array(6).fill(false))
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('userId='))
      ?.split('=')[1]
    
    if (!cookie) {
      router.push('/auth/login')
      return
    }

    setUserId(cookie)
    fetchInterests()
    fetchUserData(cookie)
  }, [router])

  const fetchInterests = async () => {
    try {
      const res = await fetch('/api/interests')
      const data = await res.json()
      setInterests(data)
    } catch (error) {
      console.error('Error fetching interests:', error)
    }
  }

  const fetchUserData = async (id: string) => {
    try {
      const [userRes, interestsRes] = await Promise.all([
        fetch(`/api/user/${id}`),
        fetch(`/api/user/${id}/interests`)
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setBio(userData.bio || '')
        
        // Fotoğrafları yükle
        if (userData.photos) {
          try {
            const photosArray = JSON.parse(userData.photos)
            setPhotos(photosArray)
          } catch {
            setPhotos(Array(6).fill(''))
          }
        } else {
          setPhotos(Array(6).fill(''))
        }
      }

      if (interestsRes.ok) {
        const interestsData = await interestsRes.json()
        setSelectedInterests(interestsData.map((i: Interest) => i.id))
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId)
      } else if (prev.length >= 27) {
        return prev
      }
      return [...prev, interestId]
    })
  }

  const handlePhotoUpload = async (index: number, file: File) => {
    if (!userId) return
    
    setUploadingPhotos(prev => {
      const newArr = [...prev]
      newArr[index] = true
      return newArr
    })

    try {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('userId', userId)
      formData.append('index', index.toString())

      const response = await fetch('/api/user/upload-photo', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setPhotos(prev => {
          const newPhotos = [...prev]
          newPhotos[index] = data.url
          return newPhotos
        })
      } else {
        alert('Fotoğraf yüklenemedi')
      }
    } catch (error) {
      console.error('Photo upload error:', error)
      alert('Fotoğraf yüklenirken hata oluştu')
    } finally {
      setUploadingPhotos(prev => {
        const newArr = [...prev]
        newArr[index] = false
        return newArr
      })
    }
  }

  const handlePhotoRemove = async (index: number) => {
    if (!userId) return

    try {
      await fetch('/api/user/remove-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, index })
      })

      setPhotos(prev => {
        const newPhotos = [...prev]
        newPhotos[index] = ''
        return newPhotos
      })
    } catch (error) {
      console.error('Photo remove error:', error)
    }
  }

  const handleSave = async () => {
    if (!userId) return

    setLoading(true)
    try {
      // İlgi alanlarını kaydet
      await fetch('/api/user/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, interestIds: selectedInterests })
      })

      // Bio'yu güncelle
      await fetch(`/api/user/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio })
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const organizedInterests = interests.reduce((acc, interest) => {
    if (!acc[interest.category]) {
      acc[interest.category] = []
    }
    acc[interest.category].push(interest)
    return acc
  }, {} as Record<string, Interest[]>)

  const categoryNames: Record<string, string> = {
    'hayvanlar': '🐾 Hayvanlar',
    'müzik': '🎵 Müzik',
    'spor': '⚽ Spor',
    'diziler': '📺 Diziler',
    'yemek': '☕ İçecekler & Yemek',
    'seyahat': '✈️ Seyahat & Aktivite'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 p-4 relative overflow-hidden">
      <DecorativeBackground />
      <div className="max-w-4xl mx-auto py-8 relative z-10">
        <h1 className="text-4xl font-bold text-white mb-6">Profilini Oluştur</h1>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-2 border-pink-200 space-y-8">
          {/* İlgi Alanları */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              İlgi Alanlarını Seç (Maksimum 27)
            </h2>
            <div className="space-y-6">
              {Object.entries(organizedInterests).map(([category, categoryInterests]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    {categoryNames[category] || category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categoryInterests.map(interest => (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                          selectedInterests.includes(interest.id)
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300'
                        } ${
                          !selectedInterests.includes(interest.id) && selectedInterests.length >= 27
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        disabled={!selectedInterests.includes(interest.id) && selectedInterests.length >= 27}
                      >
                        <span className="mr-2">{interest.emoji}</span>
                        {interest.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {selectedInterests.length}/27 seçildi
            </p>
          </div>

          {/* Biyografi */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Biyografi
            </h2>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Kendin hakkında bir şeyler yaz..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-700 font-medium resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              {bio.length}/500 karakter
            </p>
          </div>

          {/* Fotoğraflar */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Fotoğraflar (Maksimum 6)
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden group"
                >
                  {photos[idx] ? (
                    <>
                      <img 
                        src={photos[idx]} 
                        alt={`Foto ${idx + 1}`} 
                        className="w-full h-full object-cover rounded-xl" 
                      />
                      <button
                        onClick={() => handlePhotoRemove(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Fotoğrafı Kaldır"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      {uploadingPhotos[idx] ? (
                        <span className="text-gray-500">Yükleniyor...</span>
                      ) : (
                        <>
                          <span className="text-4xl text-gray-400 mb-2">📸</span>
                          <span className="text-xs text-gray-500">Fotoğraf Ekle</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('Fotoğraf maksimum 5MB olmalı')
                              return
                            }
                            handlePhotoUpload(idx, file)
                          }
                        }}
                        disabled={uploadingPhotos[idx]}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Her fotoğraf maksimum 5MB olmalıdır
            </p>
          </div>

          {/* Kaydet Butonu */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? 'Kaydediliyor...' : '✓ Profili Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}






