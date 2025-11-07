import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { message: 'Yetkisiz' },
        { status: 401 }
      )
    }

    // Kullanıcının bilgilerini ve ilgi alanlarını al
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        gender: true,
        interests: {
          include: {
            interest: true
          }
        }
      }
    })

    if (!currentUser || !currentUser.gender) {
      return NextResponse.json(
        { message: 'Cinsiyet bilgisi eksik' },
        { status: 400 }
      )
    }

    // Karşı cinsiyeti belirle
    let targetGender: string
    if (currentUser.gender === 'erkek') {
      targetGender = 'kadın'
    } else if (currentUser.gender === 'kadın') {
      targetGender = 'erkek'
    } else {
      // Diğer için her iki cinsiyeti de göster
      targetGender = ''
    }

    // Kullanıcının daha önce swipe yaptığı kişileri al
    const swipedUserIds = await prisma.swipe.findMany({
      where: { swiperId: userId },
      select: { swipedId: true }
    })
    const swipedIds = swipedUserIds.map(s => s.swipedId)

    // Kullanıcının eşleştiği kişileri al
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      select: {
        user1Id: true,
        user2Id: true
      }
    })
    const matchedIds = matches.flatMap(m => 
      m.user1Id === userId ? m.user2Id : m.user1Id
    )

    // Tüm swipe edilen ve eşleşilen kullanıcıları hariç tut
    const excludeIds = [userId, ...swipedIds, ...matchedIds]

    // URL parametrelerini al
    const searchParams = request.nextUrl.searchParams

    // Karşı cinsiyetten kullanıcıları getir
    const whereClause: any = {
      id: { notIn: excludeIds },
      isVerified: true,
      isActive: true
    }

    if (targetGender) {
      whereClause.gender = targetGender
    }

    // Filtreler
    const minAge = searchParams.get('minAge')
    const maxAge = searchParams.get('maxAge')
    const university = searchParams.get('university')
    const department = searchParams.get('department')

    if (minAge || maxAge) {
      whereClause.age = {}
      if (minAge) whereClause.age.gte = parseInt(minAge)
      if (maxAge) whereClause.age.lte = parseInt(maxAge)
    }
    if (university) {
      // SQLite için contains yerine string araması
      whereClause.university = { contains: university }
    }
    if (department) {
      whereClause.department = { contains: department }
    }

    // Debug: Kaç kullanıcı bulunduğunu kontrol et
    const totalAvailableUsers = await prisma.user.count({
      where: {
        gender: targetGender,
        isVerified: true,
        isActive: true,
        id: { notIn: excludeIds }
      }
    })

    console.log(`[Discover] User: ${userId}, Gender: ${currentUser.gender}, Target: ${targetGender}`)
    console.log(`[Discover] Swiped: ${swipedIds.length}, Matched: ${matchedIds.length}, Excluded: ${excludeIds.length}`)
    console.log(`[Discover] Available users: ${totalAvailableUsers}`)

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        age: true,
        university: true,
        department: true,
        bio: true,
        photos: true,
        gender: true,
        boostExpiresAt: true,
        interests: {
          include: {
            interest: true
          }
        }
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    })

    console.log(`[Discover] Found ${users.length} users`)

    // Boost aktif kullanıcıları önce göster (manuel sıralama)
    const sortedUsers = users.sort((a, b) => {
      // Boost aktif olanları önce göster
      const aBoost = a.boostExpiresAt ? new Date(a.boostExpiresAt) > new Date() : false
      const bBoost = b.boostExpiresAt ? new Date(b.boostExpiresAt) > new Date() : false
      if (aBoost && !bBoost) return -1
      if (!aBoost && bBoost) return 1
      return 0
    })

    // Eşleşme yüzdesi hesaplama fonksiyonu
    const calculateMatchPercentage = (user1Interests: any[], user2Interests: any[]) => {
      if (user1Interests.length === 0 && user2Interests.length === 0) return 50 // Eğer hiç ilgi alanı yoksa %50
      if (user1Interests.length === 0 || user2Interests.length === 0) return 0
      
      const user1InterestIds = new Set(user1Interests.map(ui => ui.interestId))
      const user2InterestIds = new Set(user2Interests.map(ui => ui.interestId))
      
      const commonInterests = [...user1InterestIds].filter(id => user2InterestIds.has(id))
      const totalUniqueInterests = new Set([...user1InterestIds, ...user2InterestIds]).size
      
      if (totalUniqueInterests === 0) return 50
      
      const percentage = Math.round((commonInterests.length / totalUniqueInterests) * 100)
      return percentage
    }

    const currentUserInterests = currentUser?.interests || []

    // Fotoğrafları parse et ve eşleşme yüzdesini hesapla
    const usersWithPhotos = sortedUsers.map(user => {
      let photosArray: string[] = []
      if (user.photos) {
        try {
          photosArray = JSON.parse(user.photos)
        } catch {
          photosArray = []
        }
      }
      
      const matchPercentage = calculateMatchPercentage(
        currentUserInterests,
        user.interests
      )
      
      return {
        id: user.id,
        name: user.name,
        age: user.age,
        university: user.university,
        department: user.department,
        bio: user.bio,
        photos: photosArray.filter(p => p),
        gender: user.gender,
        matchPercentage
      }
    })

    return NextResponse.json(usersWithPhotos)
  } catch (error) {
    console.error('Discover error:', error)
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

