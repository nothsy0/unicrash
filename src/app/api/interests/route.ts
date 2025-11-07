import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const interests = await prisma.interest.findMany({
      orderBy: { category: 'asc' }
    })
    
    return NextResponse.json(interests)
  } catch (error) {
    console.error('Get interests error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}





