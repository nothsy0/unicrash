import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'E-posta gerekli' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Güvenlik: Kullanıcı yoksa da başarı mesajı gönder
      return NextResponse.json({
        message: 'Eğer bu e-posta adresi kayıtlı ise, şifre sıfırlama linki gönderildi'
      })
    }

    // Reset token oluştur
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 saat geçerli

    // Token'ı veritabanına kaydet (gerçek uygulamada ayrı tablo kullan)
    // Şimdilik basit string olarak
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: `${resetToken}:${resetTokenExpiry.toISOString()}`
      }
    })

    // E-posta gönder (gerçek uygulamada email servisi kullan)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
    
    console.log('Şifre sıfırlama linki:', resetUrl)
    console.log('E-posta gönderiliyor:', email)
    
    // Gerçek uygulamada burada email gönderilir:
    // await sendEmail({
    //   to: email,
    //   subject: 'Şifre Sıfırlama',
    //   html: `Şifreni sıfırlamak için linke tıkla: ${resetUrl}`
    // })

    return NextResponse.json({
      message: 'Eğer bu e-posta adresi kayıtlı ise, şifre sıfırlama linki gönderildi'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}






