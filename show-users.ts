import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function showUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        isVerified: true,
        isActive: true
      },
      include: {
        interests: {
          include: {
            interest: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('\n📋 VERİTABANINDAKİ FAKE PROFİLLER\n')
    console.log('=' .repeat(80))
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.gender === 'kadın' ? '👩' : '👨'})`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   🔑 Şifre: 123456`)
      console.log(`   🎂 Yaş: ${user.age}`)
      console.log(`   🏫 Üniversite: ${user.university}`)
      console.log(`   📚 Bölüm: ${user.department}`)
      console.log(`   📝 Bio: ${user.bio}`)
      
      if (user.interests && user.interests.length > 0) {
        const interestNames = user.interests.map(ui => `${ui.interest.emoji} ${ui.interest.name}`).join(', ')
        console.log(`   ❤️  İlgi Alanları: ${interestNames}`)
      }
      
      if (user.photos) {
        try {
          const photos = JSON.parse(user.photos)
          console.log(`   📸 Fotoğraflar: ${photos.length} adet`)
          photos.forEach((photo: string, i: number) => {
            console.log(`      ${i + 1}. ${photo}`)
          })
        } catch (e) {
          // JSON parse hatası
        }
      }
      
      console.log(`   ✅ Onaylı: ${user.isVerified ? 'Evet' : 'Hayır'}`)
      console.log(`   🟢 Aktif: ${user.isActive ? 'Evet' : 'Hayır'}`)
      console.log('-'.repeat(80))
    })

    console.log(`\n📊 Toplam ${users.length} profil bulundu.\n`)
    console.log('💡 Bu profillerle giriş yapmak için:')
    console.log('   - Email: [yukarıdaki email adreslerinden biri]')
    console.log('   - Şifre: 123456')
    console.log('   - URL: http://localhost:3000/auth/login\n')

  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showUsers()


