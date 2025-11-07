import { DecorativeBackground } from './DecorativeBackground'

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 flex items-center justify-center relative overflow-hidden">
      <DecorativeBackground />
      <div className="flex flex-col items-center gap-4 relative z-10">
        <div className="w-16 h-16 border-4 border-white border-t-purple-600 rounded-full animate-spin"></div>
        <p className="text-white text-lg font-semibold drop-shadow-lg">Yükleniyor...</p>
      </div>
    </div>
  )
}

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-gray-200"></div>
      <div className="p-6 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  )
}

