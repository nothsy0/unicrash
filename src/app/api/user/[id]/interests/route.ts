import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    const userInterests = await prisma.userInterest.findMany({
      where: { userId },
      include: {
        interest: true
      }
    })

    const interests = userInterests.map(ui => ({
      id: ui.interest.id,
      name: ui.interest.name,
      emoji: ui.interest.emoji,
      category: ui.interest.category
    }))

    return NextResponse.json(interests)
  } catch (error) {
    console.error('Get user interests error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}





