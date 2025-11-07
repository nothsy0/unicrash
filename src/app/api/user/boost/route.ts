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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { boostExpiresAt: true, boostCount: true }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Boost aktif mi kontrol et
    const now = new Date()
    if (user.boostExpiresAt && new Date(user.boostExpiresAt) > now) {
      return NextResponse.json(
        { message: 'Boost zaten aktif' },
        { status: 400 }
      )
    }

    // Boost'u etkinleştir (30 dakika)
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000)

    await prisma.user.update({
      where: { id: userId },
      data: {
        boostExpiresAt: expiresAt,
        boostCount: { increment: 1 }
      }
    })

    return NextResponse.json({
      message: 'Boost aktifleştirildi',
      expiresAt: expiresAt.toISOString()
    })
  } catch (error) {
    console.error('Boost error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

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
      select: { boostExpiresAt: true, boostCount: true }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    const now = new Date()
    const isActive = user.boostExpiresAt && new Date(user.boostExpiresAt) > now

    return NextResponse.json({
      isActive,
      expiresAt: user.boostExpiresAt,
      boostCount: user.boostCount
    })
  } catch (error) {
    console.error('Get boost error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}



