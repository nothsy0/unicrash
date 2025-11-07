import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { message: 'Yetkisiz' },
        { status: 401 }
      )
    }

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

    // Eğer son reklam 15 dakikadan önce gösterildiyse veya hiç gösterilmediyse
    const shouldShowAd = !user.lastAdShown || user.lastAdShown < fifteenMinutesAgo

    return NextResponse.json({
      shouldShowAd,
      lastAdShown: user.lastAdShown,
      nextAdTime: user.lastAdShown 
        ? new Date(user.lastAdShown.getTime() + 15 * 60 * 1000)
        : null
    })
  } catch (error) {
    console.error('Check ad error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

