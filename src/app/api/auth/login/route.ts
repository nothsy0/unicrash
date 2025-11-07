import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'E-posta ve şifre gerekli' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json(
        { message: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      )
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { message: 'Hesabınız henüz onaylanmamış. Lütfen bekleyin.' },
        { status: 403 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Hesabınız deaktif edilmiş' },
        { status: 403 }
      )
    }

    // Basit session yönetimi (gerçek uygulamada JWT veya NextAuth kullanın)
    const response = NextResponse.json(
      { message: 'Giriş başarılı', user: { id: user.id, email: user.email, name: user.name } },
      { status: 200 }
    )

    // Cookie'ye user ID'yi kaydet (httpOnly: false çünkü client-side'da okunması gerekiyor)
    response.cookies.set('userId', user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 gün
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}





