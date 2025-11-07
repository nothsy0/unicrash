'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DecorativeBackground } from '@/components/DecorativeBackground'

type Interest = {
  id: string
  name: string
  category: string
  emoji: string
}

export default function OnboardingPage() {
  const [interests, setInterests] = useState<Interest[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<string>('hayvanlar')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/interests')
      .then(res => res.json())
      .then(data => setInterests(data))
      .catch(err => console.error('Error fetching interests:', err))
  }, [])

  const categories = ['hayvanlar', 'müzik', 'spor', 'diziler', 'yemek', 'seyahat']
  const categoryTitles: Record<string, string> = {
    'hayvanlar': '🐾 Hangi hayvanları seversin?',
    'müzik': '🎵 Hangi müzik türlerini seversin?',
    'spor': '⚽ Hangi sporları seversin?',
    'diziler': '📺 Hangi dizileri seversin?',
    'yemek': '☕ Ne içmeyi seversin?',
    'seyahat': '✈️ Ne yapmayı seversin?'
  }

  const currentInterests = interests.filter(i => i.category === currentCategory)
  const currentIndex = categories.indexOf(currentCategory)

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => {
      const categorySelected = prev.filter(id => {
        const interest = interests.find(i => i.id === id)
        return interest?.category === currentCategory
      })
      
      if (categorySelected.includes(interestId)) {
        return prev.filter(id => id !== interestId)
      } else if (categorySelected.length >= 2) {
        return prev
      }
      return [...prev, interestId]
    })
  }

  const handleNext = () => {
    if (currentIndex < categories.length - 1) {
      setCurrentCategory(categories[currentIndex + 1])
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentCategory(categories[currentIndex - 1])
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const userId = document.cookie
        .split('; ')
        .find(row => row.startsWith('userId='))
        ?.split('=')[1]

      if (!userId) {
        alert('Oturum bulunamadı')
        return
      }

      const response = await fetch('/api/user/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, interestIds: selectedInterests })
      })

      if (response.ok) {
        router.push('/profile')
      } else {
        alert('Kayıt başarısız')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const categorySelectedCount = selectedInterests.filter(id => {
    const interest = interests.find(i => i.id === id)
    return interest?.category === currentCategory
  }).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 p-4 relative overflow-hidden">
      <DecorativeBackground />
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-2 border-pink-200">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
              İlgi Alanlarını Seç
            </h1>
            <p className="text-gray-600 font-semibold">
              {categoryTitles[currentCategory]}
            </p>
            <div className="mt-4 flex items-center gap-2">
              {categories.map((cat, idx) => (
                <div
                  key={cat}
                  className={`h-2 flex-1 rounded-full ${
                    idx <= currentIndex ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {categorySelectedCount}/2 seçildi
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {currentInterests.map(interest => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                disabled={!selectedInterests.includes(interest.id) && categorySelectedCount >= 2}
                className={`px-4 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                  selectedInterests.includes(interest.id)
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300 opacity-60'
                } ${
                  !selectedInterests.includes(interest.id) && categorySelectedCount >= 2
                    ? 'cursor-not-allowed'
                    : ''
                }`}
              >
                <span className="mr-2">{interest.emoji}</span>
                {interest.name}
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Önceki
            </button>

            {currentIndex < categories.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={categorySelectedCount < 2}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={categorySelectedCount < 2 || loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Kaydediliyor...' : '✓ Kaydet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}





