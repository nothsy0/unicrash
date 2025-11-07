'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DecorativeBackground } from '@/components/DecorativeBackground'

type Match = {
  id: string
  user: {
    id: string
    name: string
    age: number
    university: string
    department: string
    bio: string
    photos: string[]
    lastSeen: string | null
  }
  adWatched: boolean
  lastMessage: {
    content: string
    senderId: string
    senderName: string
    createdAt: string
    isRead: boolean
  } | null
  createdAt: string
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

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
    fetchMatches()
  }, [router])

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setMatches(data)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 p-2 sm:p-4 relative overflow-hidden">
      <DecorativeBackground />
      <div className="max-w-4xl mx-auto pt-4 sm:pt-8 relative z-10">
        <div className="flex justify-between items-center mb-4 sm:mb-6 px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Eşleşmelerim</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-white hover:text-gray-200 active:text-gray-300 font-semibold text-sm sm:text-base px-2 py-2 touch-manipulation"
          >
            ← Geri
          </button>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md mx-auto text-center border-2 border-pink-200">
            <div className="text-5xl sm:text-6xl mb-4">💔</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
              Henüz Eşleşmen Yok
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Keşfet sayfasına gidip insanları beğenmeye başla!
            </p>
            <button
              onClick={() => router.push('/discover')}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 shadow-lg transition duration-200 text-sm sm:text-base touch-manipulation"
            >
              Keşfetmeye Başla
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {matches.map((match) => {
              const firstPhoto = match.user.photos && match.user.photos.length > 0
                ? match.user.photos[0]
                : null

              return (
                <div
                  key={match.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 touch-manipulation"
                  onClick={() => router.push(`/chat/${match.id}`)}
                >
                  <div className="aspect-[4/3] bg-gray-100 relative">
                    {firstPhoto ? (
                      <img
                        src={firstPhoto}
                        alt={match.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-200 to-pink-200">
                        <span className="text-6xl">📸</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate flex-1 min-w-0">
                        {match.user.name || 'İsimsiz'}
                      </h3>
                      {!match.adWatched && (
                        <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                          📺 Reklam
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2 truncate">
                      {match.user.age} yaşında · {match.user.university}
                    </p>
                    {match.user.lastSeen && (
                      <p className="text-xs text-gray-400 mb-1">
                        Son görülme: {(() => {
                          const lastSeen = new Date(match.user.lastSeen)
                          const now = new Date()
                          const diff = now.getTime() - lastSeen.getTime()
                          const minutes = Math.floor(diff / 60000)
                          const hours = Math.floor(diff / 3600000)

                          if (minutes < 1) return 'Çevrimiçi'
                          if (minutes < 60) return `${minutes} dk önce`
                          if (hours < 24) return `${hours} saat önce`
                          return lastSeen.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                        })()}
                      </p>
                    )}
                    {match.lastMessage ? (
                      <div className="mb-2">
                        <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-1">
                          {match.lastMessage.senderId === userId ? 'Sen: ' : `${match.user.name}: `}
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm line-clamp-1 mb-1">
                          {match.lastMessage.content}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(match.lastMessage.createdAt).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    ) : match.user.bio ? (
                      <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-2">
                        {match.user.bio}
                      </p>
                    ) : null}
                    <button className="mt-2 sm:mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 sm:py-2.5 rounded-lg hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 transition duration-200 text-xs sm:text-sm touch-manipulation relative">
                      {match.adWatched ? 'Mesaj Gönder 💬' : 'Sohbet Et 📺'}
                      {match.lastMessage && !match.lastMessage.isRead && match.lastMessage.senderId !== userId && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                          !
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

