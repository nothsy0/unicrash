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

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            age: true,
            university: true,
            department: true,
            photos: true,
            bio: true,
            lastSeen: true
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            age: true,
            university: true,
            department: true,
            photos: true,
            bio: true,
            lastSeen: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Son mesajları al (her match için en son mesaj)
    const matchIds = matches.map(m => m.id)
    const allMessages = await prisma.message.findMany({
      where: {
        matchId: { in: matchIds }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Her match için en son mesajı bul
    const messagesByMatch = new Map<string, typeof allMessages[0]>()
    for (const msg of allMessages) {
      if (!messagesByMatch.has(msg.matchId)) {
        messagesByMatch.set(msg.matchId, msg)
      }
    }

    const formattedMatches = matches.map(match => {
      const otherUser = match.user1Id === userId ? match.user2 : match.user1
      let photosArray: string[] = []
      if (otherUser.photos) {
        try {
          photosArray = JSON.parse(otherUser.photos)
        } catch {
          photosArray = []
        }
      }
      // Reklam izlenme durumunu kontrol et
      let adWatched: Record<string, boolean> = {}
      if (match.adWatched) {
        try {
          adWatched = JSON.parse(match.adWatched)
        } catch {
          adWatched = {}
        }
      }

      const lastMessage = messagesByMatch.get(match.id)

      return {
        id: match.id,
        user: {
          ...otherUser,
          photos: photosArray.filter(p => p)
        },
        adWatched: adWatched[userId] || false,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          senderName: lastMessage.sender.name,
          createdAt: lastMessage.createdAt,
          isRead: lastMessage.isRead
        } : null,
        createdAt: match.createdAt
      }
    })

    return NextResponse.json(formattedMatches)
  } catch (error) {
    console.error('Get matches error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

