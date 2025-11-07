import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { email, token, password } = await request.json()

    if (!email || !token || !password) {
      return NextResponse.json(
        { message: 'Tüm alanlar gerekli' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Basit token kontrolü (gerçek uygulamada daha güvenli yap)
    // Şimdilik password field'ını kontrol ediyoruz
    if (!user.password.includes(token)) {
      return NextResponse.json(
        { message: 'Geçersiz veya süresi dolmuş link' },
        { status: 400 }
      )
    }

    // Yeni şifreyi hash'le ve kaydet
    const hashedPassword = await bcrypt.hash(password, 12)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      message: 'Şifre başarıyla değiştirildi'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}






