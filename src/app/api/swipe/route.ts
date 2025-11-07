import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { userId, swipedUserId, isLike, isSuperLike } = await request.json()

    if (!userId || !swipedUserId || isLike === undefined) {
      return NextResponse.json(
        { message: 'Geçersiz istek' },
        { status: 400 }
      )
    }

    // Super Like kontrolü
    if (isSuperLike) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          superLikesUsed: true, 
          superLikesResetAt: true 
        }
      })

      if (!user) {
        return NextResponse.json(
          { message: 'Kullanıcı bulunamadı' },
          { status: 404 }
        )
      }

      // Super Like reset kontrolü (günlük limit)
      const now = new Date()
      const resetAt = user.superLikesResetAt ? new Date(user.superLikesResetAt) : null
      
      let superLikesUsed = user.superLikesUsed
      if (!resetAt || now > resetAt) {
        // Reset zamanı geçmiş, sıfırla
        superLikesUsed = 0
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            superLikesUsed: 0,
            superLikesResetAt: tomorrow
          }
        })
      }

      // Günlük limit kontrolü (5 Super Like)
      if (superLikesUsed >= 5) {
        return NextResponse.json(
          { 
            message: 'Günlük Super Like hakkınız doldu. Yarın tekrar deneyin.',
            code: 'SUPER_LIKE_LIMIT_REACHED'
          },
          { status: 403 }
        )
      }
    }

    // Eğer beğeni yapılıyorsa, beğeni hakkı kontrolü yap
    if (isLike) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { freeLikesUsed: true, paidLikesUsed: true }
      })

      if (!user) {
        return NextResponse.json(
          { message: 'Kullanıcı bulunamadı' },
          { status: 404 }
        )
      }

      const freeLikesLeft = 10 - user.freeLikesUsed
      const paidLikesLeft = user.paidLikesUsed % 3 // Her reklam 3 beğeni verir
      const totalLikesLeft = freeLikesLeft + (3 - paidLikesLeft)

      if (freeLikesLeft <= 0 && paidLikesLeft === 0) {
        // Beğeni hakkı yok, reklam izlemesi gerekiyor
        return NextResponse.json(
          { 
            message: 'Beğeni hakkınız kalmadı. 3 beğeni için reklam izlemeniz gerekiyor.',
            code: 'AD_REQUIRED_FOR_LIKES',
            needsAd: true
          },
          { status: 403 }
        )
      }

      // Beğeni hakkı var, swipe kaydını oluştur ve sayacı güncelle
      await prisma.swipe.create({
        data: {
          swiperId: userId,
          swipedId: swipedUserId,
          isLike,
          isSuperLike: isSuperLike || false
        }
      })

      // Super Like sayacını güncelle
      if (isSuperLike) {
        await prisma.user.update({
          where: { id: userId },
          data: { superLikesUsed: { increment: 1 } }
        })
      }

      // Beğeni sayacını güncelle
      if (freeLikesLeft > 0) {
        // Ücretsiz beğeni kullan
        await prisma.user.update({
          where: { id: userId },
          data: { freeLikesUsed: { increment: 1 } }
        })
      } else {
        // Reklam beğenisi kullan
        await prisma.user.update({
          where: { id: userId },
          data: { paidLikesUsed: { increment: 1 } }
        })
      }
    } else {
      // Reddetme sınırsız, direkt swipe kaydı oluştur
      await prisma.swipe.create({
        data: {
          swiperId: userId,
          swipedId: swipedUserId,
          isLike
        }
      })
    }

    // Eğer beğenildiyse, karşılıklı beğeni kontrolü yap
    if (isLike) {
      const mutualSwipe = await prisma.swipe.findUnique({
        where: {
          swiperId_swipedId: {
            swiperId: swipedUserId,
            swipedId: userId
          }
        }
      })

      // Karşılıklı beğeni varsa match oluştur
      if (mutualSwipe && mutualSwipe.isLike) {
        // Match zaten var mı kontrol et
        const existingMatch = await prisma.match.findFirst({
          where: {
            OR: [
              { user1Id: userId, user2Id: swipedUserId },
              { user1Id: swipedUserId, user2Id: userId }
            ]
          }
        })

        if (!existingMatch) {
          await prisma.match.create({
            data: {
              user1Id: userId,
              user2Id: swipedUserId
            }
          })

          return NextResponse.json({
            message: 'Eşleşme!',
            isMatch: true
          })
        }
      }
    }

    return NextResponse.json({
      message: isLike ? 'Beğenildi' : 'Beğenilmedi',
      isMatch: false
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Zaten swipe yapılmış
      return NextResponse.json(
        { message: 'Bu kullanıcıya zaten swipe yaptınız' },
        { status: 400 }
      )
    }
    console.error('Swipe error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

