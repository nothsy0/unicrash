import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const photo = formData.get('photo') as File
    const userId = formData.get('userId') as string
    const index = formData.get('index') as string

    if (!photo || !userId || index === null) {
      return NextResponse.json(
        { message: 'Fotoğraf, kullanıcı ID ve index gerekli' },
        { status: 400 }
      )
    }

    // Fotoğrafı kaydet
    const bytes = await photo.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileExtension = photo.name.split('.').pop()
    const fileName = `photo_${userId}_${index}_${Date.now()}.${fileExtension}`
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
    
    // Upload dizinini oluştur (yoksa)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    const photoUrl = `/uploads/profiles/${fileName}`

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

    // Fotoğrafı array'e ekle
    photosArray[parseInt(index)] = photoUrl

    // Veritabanında güncelle
    await prisma.user.update({
      where: { id: userId },
      data: { photos: JSON.stringify(photosArray) }
    })

    return NextResponse.json({ url: photoUrl })
  } catch (error) {
    console.error('Upload photo error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

