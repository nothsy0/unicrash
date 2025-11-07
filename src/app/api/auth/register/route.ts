import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const age = formData.get('age') as string
    const gender = formData.get('gender') as string
    const university = formData.get('university') as string
    const department = formData.get('department') as string
    const studentDocument = formData.get('studentDocument') as File

    if (!email || !password) {
      return NextResponse.json(
        { message: 'E-posta ve şifre gerekli' },
        { status: 400 }
      )
    }

    if (!studentDocument) {
      return NextResponse.json(
        { message: 'Öğrenci belgesi gerekli' },
        { status: 400 }
      )
    }

    // E-posta zaten kayıtlı mı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu e-posta adresi zaten kayıtlı' },
        { status: 400 }
      )
    }

    // Öğrenci belgesini kaydet
    const bytes = await studentDocument.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileName = `student_doc_${Date.now()}_${studentDocument.name}`
    // public altına kaydedelim ki /uploads/... ile servis edilebilsin
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'student_documents')
    
    // Upload dizinini oluştur (yoksa)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    // Kullanıcıyı oluştur
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        university: university || null,
        department: department || null,
        studentDocument: fileName,
        isVerified: false,
        isActive: true
      }
    })

    return NextResponse.json(
      { 
        message: 'Kayıt başarılı! Öğrenci belgeniz incelendikten sonra hesabınız onaylanacak.',
        userId: user.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
