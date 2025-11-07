import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, interestIds } = await request.json()

    if (!userId || !interestIds || !Array.isArray(interestIds)) {
      return NextResponse.json(
        { message: 'Geçersiz istek' },
        { status: 400 }
      )
    }

    // Kullanıcının mevcut ilgi alanlarını sil
    await prisma.userInterest.deleteMany({
      where: { userId }
    })

    // Yeni ilgi alanlarını ekle
    if (interestIds.length > 0) {
      await prisma.userInterest.createMany({
        data: interestIds.map((interestId: string) => ({
          userId,
          interestId
        }))
      })
    }

    return NextResponse.json({ message: 'İlgi alanları kaydedildi' })
  } catch (error) {
    console.error('Save interests error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}





