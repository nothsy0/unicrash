'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '@/components/Loading'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { DecorativeBackground } from '@/components/DecorativeBackground'

type Interest = {
  id: string
  name: string
  emoji: string
  category: string
}

type User = {
  id: string
  name: string
  age: number
  university: string
  department: string
  bio: string
  profileImage: string
  interests: Interest[]
}

type Stats = {
  matches: number
  messages: number
  likesGiven: number
  likesReceived: number
  totalLikesLeft: number
  profileViews: number
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [bio, setBio] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userId = document.cookie
      .split('; ')
      .find(row => row.startsWith('userId='))
      ?.split('=')[1]

    if (!userId) {
      router.push('/auth/login')
      return
    }

    fetchProfile(userId)
    fetchStats()
  }, [router])

  const fetchProfile = async (userId: string) => {
    try {
      const [userRes, interestsRes] = await Promise.all([
        fetch(`/api/user/${userId}`),
        fetch(`/api/user/${userId}/interests`)
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData)
        setBio(userData.bio || '')
        try {
          const photosArray = userData.photos ? JSON.parse(userData.photos) : []
          setPhotos(Array.isArray(photosArray) ? photosArray : [])
        } catch {
          setPhotos([])
        }
      }

      if (interestsRes.ok) {
        const interestsData = await interestsRes.json()
        setUser(prev => prev ? { ...prev, interests: interestsData } : null)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Profil yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/stats', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSaveBio = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/user/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bio })
      })

      if (response.ok) {
        toast.success('Biyografi güncellendi!')
        setUser(prev => prev ? { ...prev, bio } : null)
      } else {
        toast.error('Biyografi güncellenemedi')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/')
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 flex items-center justify-center">
        <div className="text-white text-xl">Kullanıcı bulunamadı</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 p-4 relative overflow-hidden">
      <DecorativeBackground />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">Profilim</h1>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push('/dashboard')}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
            >
              Çıkış Yap
            </Button>
          </div>
        </div>

        {/* İstatistikler */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <Card padding="sm" className="text-center">
              <div className="text-2xl mb-1">💕</div>
              <div className="text-2xl font-bold text-purple-600">{stats.matches}</div>
              <div className="text-xs text-gray-600">Eşleşme</div>
            </Card>
            <Card padding="sm" className="text-center">
              <div className="text-2xl mb-1">💬</div>
              <div className="text-2xl font-bold text-pink-600">{stats.messages}</div>
              <div className="text-xs text-gray-600">Mesaj</div>
            </Card>
            <Card padding="sm" className="text-center">
              <div className="text-2xl mb-1">❤️</div>
              <div className="text-2xl font-bold text-red-600">{stats.likesGiven}</div>
              <div className="text-xs text-gray-600">Beğeni</div>
            </Card>
            <Card padding="sm" className="text-center">
              <div className="text-2xl mb-1">👁️</div>
              <div className="text-2xl font-bold text-blue-600">{stats.profileViews}</div>
              <div className="text-xs text-gray-600">Görüntüleme</div>
            </Card>
            <Card padding="sm" className="text-center">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-2xl font-bold text-orange-600">{stats.totalLikesLeft}</div>
              <div className="text-xs text-gray-600">Kalan</div>
            </Card>
          </div>
        )}

        <Card className="mb-6">
          {/* Profil fotoğrafları grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300"
              >
                {photos[idx] ? (
                  <img src={photos[idx]} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-4xl text-gray-400">📸</span>
                )}
              </div>
            ))}
          </div>

          {/* Kullanıcı bilgileri */}
          <div className="space-y-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {user.name || 'İsimsiz'}
              </h2>
              <p className="text-gray-600">
                {user.age} yaşında · {user.university} · {user.department}
              </p>
            </div>

            {/* Biyografi */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Biyografi
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Kendin hakkında bir şeyler yaz..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder:text-gray-700 font-medium resize-none"
                rows={4}
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveBio}
                  isLoading={saving}
                  disabled={saving || bio === user.bio}
                >
                  Kaydet
                </Button>
              </div>
            </div>
          </div>

          {/* İlgi alanları */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                İlgi Alanlarım
              </h3>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => router.push('/profile-builder')}
              >
                Düzenle
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {user.interests && user.interests.length > 0 ? (
                user.interests.map(interest => (
                  <div
                    key={interest.id}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold shadow-md"
                  >
                    <span className="mr-2">{interest.emoji}</span>
                    {interest.name}
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-8">
                  <p className="text-gray-500 mb-4">Henüz ilgi alanı seçmemişsin</p>
                  <Button
                    onClick={() => router.push('/profile-builder')}
                  >
                    İlgi Alanları Seç
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}





