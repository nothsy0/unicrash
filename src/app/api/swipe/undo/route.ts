import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { message: 'Geçersiz istek' },
        { status: 400 }
      )
    }

    // Son swipe'ı bul (5 dakika içinde)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const lastSwipe = await prisma.swipe.findFirst({
      where: {
        swiperId: userId,
        createdAt: {
          gte: fiveMinutesAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!lastSwipe) {
      return NextResponse.json(
        { message: 'Geri alınacak swipe bulunamadı' },
        { status: 404 }
      )
    }

    // Swipe'ı sil
    await prisma.swipe.delete({
      where: { id: lastSwipe.id }
    })

    // Eğer beğeni ise, sayacı geri al
    if (lastSwipe.isLike) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { freeLikesUsed: true, paidLikesUsed: true, superLikesUsed: true }
      })

      if (user) {
        if (lastSwipe.isSuperLike) {
          await prisma.user.update({
            where: { id: userId },
            data: { superLikesUsed: Math.max(0, user.superLikesUsed - 1) }
          })
        } else if (user.freeLikesUsed > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: { freeLikesUsed: Math.max(0, user.freeLikesUsed - 1) }
          })
        } else if (user.paidLikesUsed > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: { paidLikesUsed: Math.max(0, user.paidLikesUsed - 1) }
          })
        }
      }

      // Eğer match varsa, onu da sil
      const match = await prisma.match.findFirst({
        where: {
          OR: [
            { user1Id: userId, user2Id: lastSwipe.swipedId },
            { user1Id: lastSwipe.swipedId, user2Id: userId }
          ]
        }
      })

      if (match) {
        await prisma.match.delete({
          where: { id: match.id }
        })
      }
    }

    return NextResponse.json({
      message: 'Swipe geri alındı',
      swipedUserId: lastSwipe.swipedId
    })
  } catch (error) {
    console.error('Undo swipe error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}



