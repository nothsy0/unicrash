import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetSwipes() {
  try {
    // Tüm swipe'ları sil
    const deletedSwipes = await prisma.swipe.deleteMany({})
    console.log(`✅ ${deletedSwipes.count} swipe silindi.`)
    
    // Tüm eşleşmeleri sil (isteğe bağlı - yorum satırını kaldırabilirsiniz)
    // const deletedMatches = await prisma.match.deleteMany({})
    // console.log(`✅ ${deletedMatches.count} eşleşme silindi.`)
    
    console.log('\n🎉 Swipe geçmişi temizlendi! Artık tüm profilleri tekrar görebilirsiniz.\n')
  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetSwipes()


