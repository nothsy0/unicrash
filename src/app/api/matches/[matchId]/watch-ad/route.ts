import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> | { matchId: string } }
) {
  try {
    const userId = request.cookies.get('userId')?.value
    const resolvedParams = await Promise.resolve(params)
    const matchId = resolvedParams.matchId

    if (!userId) {
      return NextResponse.json(
        { message: 'Yetkisiz' },
        { status: 401 }
      )
    }

    // Match'i bul ve kullanıcının bu match'e ait olduğunu kontrol et
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    })

    if (!match) {
      return NextResponse.json(
        { message: 'Eşleşme bulunamadı' },
        { status: 404 }
      )
    }

    // Mevcut reklam izlenme durumunu al
    let adWatched: Record<string, boolean> = {}
    if (match.adWatched) {
      try {
        adWatched = JSON.parse(match.adWatched)
      } catch {
        adWatched = {}
      }
    }

    // Kullanıcının reklam izlediğini işaretle
    adWatched[userId] = true

    // Güncelle
    await prisma.match.update({
      where: { id: matchId },
      data: {
        adWatched: JSON.stringify(adWatched)
      }
    })

    return NextResponse.json({ 
      message: 'Reklam izlendi',
      success: true 
    })
  } catch (error) {
    console.error('Watch ad error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

