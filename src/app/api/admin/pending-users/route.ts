import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

function isAdmin(req: NextRequest): boolean {
  const cookie = req.cookies.get('adminAuth')?.value
  return cookie === '1'
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ message: 'Yetkisiz' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    where: { isVerified: false },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      university: true,
      department: true,
      studentDocument: true,
      createdAt: true
    }
  })

  return NextResponse.json(users)
}







