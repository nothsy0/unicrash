import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

function isAdmin(req: NextRequest): boolean {
  const cookie = req.cookies.get('adminAuth')?.value
  return cookie === '1'
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ message: 'Yetkisiz' }, { status: 401 })
  }

  const { userId, approve } = await request.json()
  if (!userId || approve === undefined) {
    return NextResponse.json({ message: 'Geçersiz istek' }, { status: 400 })
  }

  try {
    if (approve) {
      // Onaylama
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true }
      })
      return NextResponse.json({ message: 'Onaylandı', user })
    } else {
      // Reddetme - kullanıcıyı sil
      await prisma.user.delete({
        where: { id: userId }
      })
      return NextResponse.json({ message: 'Kullanıcı reddedildi ve silindi' })
    }
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ message: 'Hata oluştu' }, { status: 500 })
  }
}


