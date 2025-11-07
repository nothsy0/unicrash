import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { userId, index } = await request.json()

    if (!userId || index === undefined) {
      return NextResponse.json(
        { message: 'Kullanıcı ID ve index gerekli' },
        { status: 400 }
      )
    }

    // Kullanıcının mevcut fotoğraflarını al
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { photos: true }
    })

    let photosArray: string[] = []
    if (user?.photos) {
      try {
        photosArray = JSON.parse(user.photos)
      } catch {
        photosArray = Array(6).fill('')
      }
    } else {
      photosArray = Array(6).fill('')
    }

    // Fotoğraf dosyasını sil
    const photoUrl = photosArray[parseInt(index)]
    if (photoUrl) {
      try {
        const filePath = join(process.cwd(), 'public', photoUrl)
        await unlink(filePath)
      } catch (error) {
        console.error('File delete error:', error)
        // Dosya bulunamazsa devam et
      }
    }

    // Array'den kaldır
    photosArray[parseInt(index)] = ''

    // Veritabanında güncelle
    await prisma.user.update({
      where: { id: userId },
      data: { photos: JSON.stringify(photosArray) }
    })

    return NextResponse.json({ message: 'Fotoğraf kaldırıldı' })
  } catch (error) {
    console.error('Remove photo error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

