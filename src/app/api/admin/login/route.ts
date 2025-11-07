import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    if (!password) {
      return NextResponse.json({ message: 'Şifre gerekli' }, { status: 400 })
    }

    const adminSecret = process.env.ADMIN_SECRET
    if (!adminSecret) {
      return NextResponse.json({ message: 'ADMIN_SECRET tanımlı değil' }, { status: 500 })
    }

    if (password !== adminSecret) {
      return NextResponse.json({ message: 'Geçersiz admin şifresi' }, { status: 401 })
    }

    const res = NextResponse.json({ message: 'Admin giriş başarılı' })
    res.cookies.set('adminAuth', '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 2
    })
    return res
  } catch (e) {
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 })
  }
}







