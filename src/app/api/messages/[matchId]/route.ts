import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(
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

    // Match'in kullanıcıya ait olduğunu kontrol et
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

    // Kullanıcının lastSeen zamanını güncelle
    await prisma.user.update({
      where: { id: userId },
      data: { lastSeen: new Date() }
    })

    // Karşı tarafın ID'sini bul
    const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id

    // Bu kullanıcıya gönderilen okunmamış mesajları işaretle
    await prisma.message.updateMany({
      where: {
        matchId,
        senderId: otherUserId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    const messages = await prisma.message.findMany({
      where: { matchId },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> | { matchId: string } }
) {
  try {
    const userId = request.cookies.get('userId')?.value
    const resolvedParams = await Promise.resolve(params)
    const matchId = resolvedParams.matchId
    const { content } = await request.json()

    if (!userId || !content) {
      return NextResponse.json(
        { message: 'Geçersiz istek' },
        { status: 400 }
      )
    }

    // Match'in kullanıcıya ait olduğunu kontrol et
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

    // Reklam izlenme kontrolü
    let adWatched: Record<string, boolean> = {}
    if (match.adWatched) {
      try {
        adWatched = JSON.parse(match.adWatched)
      } catch {
        adWatched = {}
      }
    }

    if (!adWatched[userId]) {
      return NextResponse.json(
        { message: 'Mesaj göndermek için önce reklam izlemeniz gerekiyor', code: 'AD_REQUIRED' },
        { status: 403 }
      )
    }

    const message = await prisma.message.create({
      data: {
        matchId,
        senderId: userId,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

