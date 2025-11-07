import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { message: 'Yetkisiz' },
        { status: 401 }
      )
    }

    // Eşleşme sayısı
    const matchCount = await prisma.match.count({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    })

    // Toplam mesaj sayısı
    const totalMessages = await prisma.message.count({
      where: {
        match: {
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      }
    })

    // Gönderilen beğeni sayısı
    const likesGiven = await prisma.swipe.count({
      where: {
        swiperId: userId,
        isLike: true
      }
    })

    // Alınan beğeni sayısı
    const likesReceived = await prisma.swipe.count({
      where: {
        swipedId: userId,
        isLike: true
      }
    })

    // Kalan ücretsiz beğeni
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        freeLikesUsed: true,
        paidLikesUsed: true
      }
    })

    const freeLikesLeft = user ? Math.max(0, 10 - user.freeLikesUsed) : 0
    const paidLikesLeft = user ? (3 - (user.paidLikesUsed % 3)) % 3 : 0
    const totalLikesLeft = freeLikesLeft + paidLikesLeft

    // Profil görüntüleme sayısı
    const profileViews = await prisma.profileView.count({
      where: { viewedId: userId }
    })

    return NextResponse.json({
      matches: matchCount,
      messages: totalMessages,
      likesGiven,
      likesReceived,
      freeLikesLeft,
      paidLikesLeft,
      totalLikesLeft,
      profileViews
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

