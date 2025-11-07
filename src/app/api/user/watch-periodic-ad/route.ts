import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { message: 'Yetkisiz' },
        { status: 401 }
      )
    }

    // Son reklam zamanını kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastAdShown: true }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const now = new Date()
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)

    // 15 dakika geçmemişse hata döndür
    if (user.lastAdShown && user.lastAdShown >= fifteenMinutesAgo) {
      const timeLeft = Math.ceil((user.lastAdShown.getTime() + 15 * 60 * 1000 - now.getTime()) / 1000 / 60)
      return NextResponse.json(
        { 
          message: `Bir sonraki reklam için ${timeLeft} dakika beklemeniz gerekiyor`,
          code: 'TOO_SOON'
        },
        { status: 400 }
      )
    }

    // Son reklam zamanını güncelle
    await prisma.user.update({
      where: { id: userId },
      data: { lastAdShown: now }
    })

    return NextResponse.json({ 
      message: 'Reklam izlendi',
      success: true,
      nextAdTime: new Date(now.getTime() + 15 * 60 * 1000)
    })
  } catch (error) {
    console.error('Watch periodic ad error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

