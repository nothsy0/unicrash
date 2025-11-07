'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DecorativeBackground } from '@/components/DecorativeBackground'

type Message = {
  id: string
  content: string
  senderId: string
  createdAt: string
  isRead: boolean
  readAt: string | null
  sender: {
    id: string
    name: string
  }
}

type MatchUser = {
  id: string
  name: string
  age: number
  university: string
  department: string
  photos: string[]
  lastSeen: string | null
}

export default function ChatPage() {
  const params = useParams()
  const matchId = params.matchId as string
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [otherUser, setOtherUser] = useState<MatchUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [adWatched, setAdWatched] = useState(false)
  const [showAdModal, setShowAdModal] = useState(false)
  const [adProgress, setAdProgress] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchMatchData = useCallback(async () => {
    if (!matchId) return
    try {
      const response = await fetch('/api/matches', {
        credentials: 'include'
      })

      if (response.ok) {
        const matches = await response.json()
        const match = matches.find((m: any) => m.id === matchId)
        if (match) {
          setOtherUser(match.user)
          setAdWatched(match.adWatched || false)
          if (!match.adWatched) {
            setShowAdModal(true)
          }
        } else {
          // Eşleşme bulunamadı
          router.push('/matches')
        }
      }
    } catch (error) {
      console.error('Error fetching match data:', error)
    } finally {
      setLoading(false)
    }
  }, [matchId, router])

  const fetchMessages = useCallback(async () => {
    if (!matchId) return
    try {
      const response = await fetch(`/api/messages/${matchId}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      } else if (response.status === 404) {
        // Eşleşme bulunamadı, matches sayfasına yönlendir
        router.push('/matches')
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }, [matchId, router])

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
    if (matchId) {
      fetchMatchData()
      fetchMessages()
      
      // Her 2 saniyede bir mesajları yenile
      const interval = setInterval(fetchMessages, 2000)
      return () => clearInterval(interval)
    }
  }, [matchId, router, fetchMatchData, fetchMessages])

  const watchAd = async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}/watch-ad`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        setAdWatched(true)
        setShowAdModal(false)
        setAdProgress(0)
      }
    } catch (error) {
      console.error('Error watching ad:', error)
    }
  }

  const startAd = () => {
    setAdProgress(0)
    const duration = 5 // 5 saniye
    const interval = setInterval(() => {
      setAdProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          watchAd()
          return 100
        }
        return prev + (100 / (duration * 10)) // 10 frame per second
      })
    }, 100) // Her 100ms'de bir güncelle
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !userId) return

    if (!adWatched) {
      setShowAdModal(true)
      return
    }

    try {
      const response = await fetch(`/api/messages/${matchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: message })
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages([...messages, newMessage])
        setMessage('')
      } else {
        const error = await response.json()
        if (error.code === 'AD_REQUIRED') {
          setShowAdModal(true)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    )
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-pink-200">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Eşleşme Bulunamadı
          </h2>
          <button
            onClick={() => router.push('/matches')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg transition duration-200"
          >
            Eşleşmelere Dön
          </button>
        </div>
      </div>
    )
  }

  const firstPhoto = otherUser.photos && otherUser.photos.length > 0
    ? otherUser.photos[0]
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 flex flex-col relative overflow-hidden">
      <DecorativeBackground />
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-lg p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => router.push('/matches')}
            className="text-gray-600 hover:text-gray-800 active:text-gray-900 font-semibold text-base sm:text-lg px-2 py-1 touch-manipulation"
          >
            ←
          </button>
          {firstPhoto && (
            <img
              src={firstPhoto}
              alt={otherUser.name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
              {otherUser.name || 'İsimsiz'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {otherUser.age} yaşında · {otherUser.university}
            </p>
            {otherUser.lastSeen && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                Son görülme: {(() => {
                  const lastSeen = new Date(otherUser.lastSeen)
                  const now = new Date()
                  const diff = now.getTime() - lastSeen.getTime()
                  const minutes = Math.floor(diff / 60000)
                  const hours = Math.floor(diff / 3600000)
                  const days = Math.floor(diff / 86400000)

                  if (minutes < 1) return 'Şimdi çevrimiçi'
                  if (minutes < 60) return `${minutes} dk önce`
                  if (hours < 24) return `${hours} saat önce`
                  if (days < 7) return `${days} gün önce`
                  return lastSeen.toLocaleDateString('tr-TR')
                })()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-white/80 mt-8">
              <p className="text-sm sm:text-base">Henüz mesaj yok. İlk mesajı sen gönder! 💬</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === userId
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white text-gray-800'
                    }`}
                  >
                    <p className="text-sm sm:text-base break-words">{msg.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <p
                        className={`text-xs ${
                          isOwn ? 'text-white/70' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {isOwn && (
                        <span className={`text-xs ${
                          msg.isRead ? 'text-blue-400' : 'text-white/50'
                        }`}>
                          {msg.isRead ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white/95 backdrop-blur-md shadow-lg p-3 sm:p-4 relative z-10">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={adWatched ? "Mesaj yaz..." : "Reklam izlemeniz gerekiyor"}
            disabled={!adWatched}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={!message.trim() || !adWatched}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg text-sm sm:text-base touch-manipulation min-w-[80px] sm:min-w-[100px]"
          >
            Gönder
          </button>
        </form>
      </div>

      {/* Reklam Modal */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-pink-200">
            <div className="text-6xl mb-4">📺</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Reklam İzle
            </h2>
            <p className="text-gray-600 mb-6">
              Mesaj göndermek için {otherUser?.name} ile eşleşmeniz için reklam izlemeniz gerekiyor.
            </p>
            
            {/* Reklam Simülasyonu */}
            <div className="bg-gradient-to-br from-purple-200 to-pink-200 rounded-xl p-8 mb-6 relative overflow-hidden">
              <div className="text-4xl mb-2">🎬</div>
              <p className="text-gray-700 font-semibold">Reklam İzleniyor...</p>
              
              {/* Progress Bar */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-100"
                  style={{ width: `${adProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {Math.round(adProgress)}% tamamlandı
              </p>
            </div>

            {adProgress === 0 ? (
              <button
                onClick={startAd}
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
    </div>
  )
}

