import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// Profil görüntüleme kaydı
export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value
    const { viewedId } = await request.json()

    if (!userId || !viewedId) {
      return NextResponse.json(
        { message: 'Geçersiz istek' },
        { status: 400 }
      )
    }

    // Profil görüntüleme kaydı oluştur (zaten varsa oluşturma)
    await prisma.profileView.upsert({
      where: {
        viewerId_viewedId: {
          viewerId: userId,
          viewedId: viewedId
        }
      },
      create: {
        viewerId: userId,
        viewedId: viewedId
      },
      update: {}
    })

    return NextResponse.json({ message: 'OK' })
  } catch (error) {
    console.error('Profile view error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

// Profil görüntüleme istatistikleri
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { message: 'Yetkisiz' },
        { status: 401 }
      )
    }

    const views = await prisma.profileView.count({
      where: { viewedId: userId }
    })

    return NextResponse.json({ views })
  } catch (error) {
    console.error('Get profile views error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}



