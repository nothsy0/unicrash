'use client'

import { useEffect, useState } from 'react'

type PendingUser = {
  id: string
  email: string
  name: string | null
  university: string | null
  department: string | null
  studentDocument: string | null
  createdAt: string
}

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<PendingUser[]>([])

  const fetchPending = async () => {
    const res = await fetch('/api/admin/pending-users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
  }

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Giriş başarısız')
        setIsAuthed(false)
        return
      }
      setIsAuthed(true)
      await fetchPending()
    } catch (e) {
      setError('Sunucu hatası')
    } finally {
      setLoading(false)
    }
  }

  const act = async (userId: string, approve: boolean) => {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, approve })
    })
    if (res.ok) {
      await fetchPending()
    }
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-4">Admin Girişi</h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={login} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Şifresi</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 placeholder:text-gray-700 font-medium"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold py-2 rounded-lg"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Bekleyen Kullanıcılar</h1>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-700">Ad / E-posta</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Üniversite / Bölüm</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Belge</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Kayıt</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">
                    <div className="font-semibold text-gray-900">{u.name || 'İsimsiz'}</div>
                    <div className="text-sm text-gray-600">{u.email}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-gray-900">{u.university || '-'}</div>
                    <div className="text-sm text-gray-600">{u.department || '-'}</div>
                  </td>
                  <td className="p-3">
                    {u.studentDocument ? (
                      <a
                        href={`/uploads/student_documents/${u.studentDocument}`}
                        target="_blank"
                        className="text-pink-600 hover:underline"
                      >
                        Belgeyi Gör
                      </a>
                    ) : (
                      <span className="text-gray-500">Yok</span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(u.createdAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => act(u.id, true)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => act(u.id, false)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reddet
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-600">Bekleyen kullanıcı yok</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}








