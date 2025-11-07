import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { message: 'Yetkisiz' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { paidLikesUsed: true }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Mevcut reklam beğenilerini kontrol et
    // Eğer paidLikesUsed % 3 === 0 ise, yeni bir reklam izlenmiş demektir ve 3 beğeni hakkı verilir
    // paidLikesUsed'ı artırmak yerine, direkt olarak 3 beğeni hakkı eklenecek şekilde güncelle
    // Ancak mantık şu: paidLikesUsed, kullanılan reklam beğenilerini sayar
    // Her reklam 3 beğeni verir, bu yüzden paidLikesUsed'ı 3'ün katına çıkarırsak
    // Kullanıcı 3 yeni beğeni hakkı kazanır

    // Önceki reklam beğenilerini kullanılmış say, sonra 3 ekle
    const currentPaidLikes = user.paidLikesUsed
    const newPaidLikesUsed = Math.ceil((currentPaidLikes + 1) / 3) * 3

    await prisma.user.update({
      where: { id: userId },
      data: { paidLikesUsed: newPaidLikesUsed }
    })

    return NextResponse.json({ 
      message: 'Reklam izlendi, 3 beğeni hakkı kazandınız!',
      success: true,
      likesAdded: 3
    })
  } catch (error) {
    console.error('Watch ad for likes error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

