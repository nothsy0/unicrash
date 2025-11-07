# 🚀 UniCrash - Geliştirme Rehberi

Bu rehber, projenizi geliştirmek için adım adım öneriler ve yönlendirmeler içerir.

## 📊 Mevcut Durum

### ✅ Tamamlanan Özellikler
- ✅ Kullanıcı kayıt ve giriş sistemi
- ✅ Öğrenci belgesi yükleme
- ✅ Admin onay sistemi
- ✅ Discover/Swipe sayfası (Tinder benzeri)
- ✅ Eşleşme sistemi
- ✅ Sohbet sayfası
- ✅ Profil yönetimi
- ✅ İlgi alanları sistemi
- ✅ Reklam sistemi (beğeni kazanma)

### 🔄 Geliştirilmesi Gerekenler
- ⚠️ UI/UX iyileştirmeleri
- ⚠️ Performans optimizasyonu
- ⚠️ Güvenlik geliştirmeleri
- ⚠️ Hata yönetimi
- ⚠️ Test coverage

---

## 🎯 Öncelikli Geliştirme Alanları

### 1. **UI/UX İyileştirmeleri**

#### A. Profil Sayfası Geliştirme
**Dosya:** `src/app/profile/page.tsx`

**Yapılacaklar:**
- [ ] Fotoğraf yükleme/düzenleme UI'sı iyileştir
- [ ] Fotoğraf silme onayı ekle
- [ ] Profil düzenleme formu ekle
- [ ] İstatistikler bölümü ekle (eşleşme sayısı, mesaj sayısı vb.)

**Örnek Kod:**
```tsx
// Profil istatistikleri ekle
const stats = {
  matches: matches.length,
  messages: totalMessages,
  likesGiven: swipes.filter(s => s.isLike).length,
  likesReceived: receivedSwipes.filter(s => s.isLike).length
}
```

#### B. Dashboard İyileştirme
**Dosya:** `src/app/dashboard/page.tsx`

**Yapılacaklar:**
- [ ] Kullanıcı durumu göstergesi ekle (onay bekliyor, aktif vb.)
- [ ] Son aktiviteler bölümü ekle
- [ ] Hızlı erişim butonları ekle
- [ ] Responsive tasarım iyileştir

#### C. Animasyonlar ve Geçişler
- [ ] Sayfa geçiş animasyonları ekle
- [ ] Loading skeleton'ları ekle
- [ ] Micro-interactions ekle (hover, click efektleri)

### 2. **Güvenlik İyileştirmeleri**

#### A. Session Yönetimi
**Dosya:** `src/lib/auth.ts`

**Yapılacaklar:**
- [ ] JWT token kullanımı ekle
- [ ] Session timeout ekle
- [ ] CSRF koruması ekle
- [ ] Rate limiting ekle

**Örnek:**
```typescript
// JWT token ile session yönetimi
import jwt from 'jsonwebtoken'

export function createSession(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' })
}
```

#### B. Dosya Yükleme Güvenliği
**Dosya:** `src/app/api/user/upload-photo/route.ts`

**Yapılacaklar:**
- [ ] Dosya tipi kontrolü (sadece resim)
- [ ] Dosya boyutu limiti (max 5MB)
- [ ] Dosya adı sanitizasyonu
- [ ] Virus tarama (opsiyonel)

#### C. Input Validation
- [ ] Tüm form inputlarında validation ekle
- [ ] SQL injection koruması (Prisma zaten koruyor ama ekstra kontrol)
- [ ] XSS koruması

### 3. **Performans Optimizasyonu**

#### A. Veritabanı Optimizasyonu
- [ ] Index ekle (Prisma schema'da)
- [ ] Query optimizasyonu
- [ ] Pagination ekle (büyük listeler için)

**Örnek:**
```prisma
model User {
  // ... existing fields
  @@index([email])
  @@index([isVerified, isActive])
}
```

#### B. API Optimizasyonu
- [ ] Response caching ekle
- [ ] Database connection pooling
- [ ] Lazy loading ekle

#### C. Frontend Optimizasyonu
- [ ] Image optimization (Next.js Image component kullan)
- [ ] Code splitting
- [ ] Lazy loading for components

**Örnek:**
```tsx
import dynamic from 'next/dynamic'

const DiscoverPage = dynamic(() => import('./discover'), {
  loading: () => <LoadingSkeleton />
})
```

### 4. **Yeni Özellikler**

#### A. Bildirim Sistemi
**Yeni Dosya:** `src/app/api/notifications/route.ts`

**Özellikler:**
- [ ] Eşleşme bildirimleri
- [ ] Yeni mesaj bildirimleri
- [ ] Profil görüntüleme bildirimleri
- [ ] Push notifications (gelecekte)

**Örnek:**
```typescript
// Notification model ekle
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // 'match', 'message', 'like'
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user      User @relation(fields: [userId], references: [id])
  
  @@map("notifications")
}
```

#### B. Filtreleme Sistemi
**Dosya:** `src/app/discover/page.tsx`

**Özellikler:**
- [ ] Yaş aralığı filtresi
- [ ] Üniversite filtresi
- [ ] Bölüm filtresi
- [ ] İlgi alanına göre filtreleme
- [ ] Mesafe filtresi (gelecekte konum eklendiğinde)

#### C. Arama Sistemi
- [ ] Kullanıcı arama (isim, üniversite)
- [ ] Gelişmiş arama filtresi

#### D. Profil Görüntüleme İstatistikleri
- [ ] Profilini kimler gördü?
- [ ] Profil görüntüleme sayısı
- [ ] Beğeni/reddetme oranları

### 5. **Admin Panel Geliştirmeleri**

**Dosya:** `src/app/admin/page.tsx`

**Yapılacaklar:**
- [ ] Dashboard istatistikleri (toplam kullanıcı, aktif kullanıcı vb.)
- [ ] Kullanıcı listesi ve yönetimi
- [ ] Raporlama sistemi (kötüye kullanım, spam vb.)
- [ ] Bulk işlemler (toplu onay/red)
- [ ] Arama ve filtreleme

### 6. **Hata Yönetimi ve Logging**

#### A. Error Handling
- [ ] Global error handler ekle
- [ ] User-friendly error mesajları
- [ ] Error logging sistemi

**Örnek:**
```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
  }
}

// API route'larda kullanım
try {
  // ...
} catch (error) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { message: error.message, code: error.code },
      { status: error.statusCode }
    )
  }
  // Log error
  console.error(error)
  return NextResponse.json(
    { message: 'Bir hata oluştu' },
    { status: 500 }
  )
}
```

#### B. Logging Sistemi
- [ ] Winston veya Pino kullan
- [ ] API isteklerini logla
- [ ] Hataları logla
- [ ] Production'da log seviyesi ayarla

### 7. **Test Geliştirme**

#### A. Unit Tests
- [ ] API route testleri
- [ ] Utility fonksiyon testleri
- [ ] Auth fonksiyon testleri

**Örnek:**
```typescript
// __tests__/lib/auth.test.ts
import { hashPassword, verifyPassword } from '@/lib/auth'

describe('Auth functions', () => {
  it('should hash password', async () => {
    const hash = await hashPassword('test123')
    expect(hash).not.toBe('test123')
  })
  
  it('should verify password', async () => {
    const hash = await hashPassword('test123')
    const isValid = await verifyPassword('test123', hash)
    expect(isValid).toBe(true)
  })
})
```

#### B. Integration Tests
- [ ] E2E testleri (Playwright veya Cypress)
- [ ] API integration testleri

### 8. **Code Quality**

#### A. ESLint Kuralları
- [ ] Stricter ESLint rules
- [ ] TypeScript strict mode
- [ ] Import sıralaması

#### B. Prettier
- [ ] Code formatting
- [ ] Pre-commit hooks

### 9. **Documentation**

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Component documentation
- [ ] Code comments ekle

### 10. **Mobile Optimization**

- [ ] PWA (Progressive Web App) desteği
- [ ] Mobile-first design iyileştirmeleri
- [ ] Touch gestures ekle

---

## 🛠️ Geliştirme Adımları

### Hızlı Başlangıç

1. **Git Branch Oluştur**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Yeni Özellik Geliştir**
   - Önce UI tasarla
   - Sonra API endpoint'leri oluştur
   - Test et

3. **Test Et**
   ```bash
   npm run lint
   # Testler eklenince:
   npm test
   ```

4. **Commit Yap**
   ```bash
   git add .
   git commit -m "feat: özellik açıklaması"
   ```

### Örnek: Yeni Filtreleme Özelliği Ekleme

1. **Filtreleme UI Ekle** (`src/app/discover/page.tsx`)
   ```tsx
   const [filters, setFilters] = useState({
     minAge: 18,
     maxAge: 30,
     university: '',
     department: ''
   })
   ```

2. **API Endpoint Güncelle** (`src/app/api/discover/route.ts`)
   ```typescript
   const { minAge, maxAge, university, department } = searchParams
   
   // Filtreleme logic'i ekle
   ```

3. **Test Et**
   - Farklı filtrelerle test et
   - Edge case'leri kontrol et

---

## 📚 Öğrenme Kaynakları

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

### Prisma
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Tailwind CSS
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🐛 Bilinen Sorunlar ve Çözümleri

### 1. Session Yönetimi
**Sorun:** Cookie-based session güvenli değil
**Çözüm:** JWT token kullan

### 2. Dosya Yükleme
**Sorun:** Dosyalar public klasöründe, production'da sorun olabilir
**Çözüm:** Cloud storage (AWS S3, Cloudinary) kullan

### 3. Veritabanı
**Sorun:** SQLite production için uygun değil
**Çözüm:** PostgreSQL'e geçiş yap

---

## 🎨 UI Kütüphaneleri Önerileri

### Component Library
- **shadcn/ui** - Modern, customizable components
- **Radix UI** - Accessible primitives
- **Headless UI** - Unstyled components

### Icons
- **Lucide React** - Modern icon set
- **Heroicons** - Beautiful icons

### Animations
- **Framer Motion** - Production-ready animations
- **React Spring** - Physics-based animations

---

## 📝 Checklist: Yeni Özellik Ekleme

- [ ] Feature branch oluştur
- [ ] UI tasarla ve implement et
- [ ] API endpoint oluştur
- [ ] Veritabanı migration (gerekirse)
- [ ] Validation ekle
- [ ] Error handling ekle
- [ ] Loading states ekle
- [ ] Test et (manuel ve otomatik)
- [ ] Responsive kontrol et
- [ ] Accessibility kontrol et
- [ ] Code review yap
- [ ] Documentation güncelle
- [ ] Merge et

---

## 🚀 Production'a Hazırlık

### Checklist
- [ ] Environment variables ayarla
- [ ] Database migration yap
- [ ] Error logging kur
- [ ] Analytics ekle (Google Analytics, Mixpanel)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Security headers ekle
- [ ] SEO optimizasyonu
- [ ] Sitemap oluştur
- [ ] Robots.txt ekle

---

## 💡 İpuçları

1. **Küçük Adımlarla İlerle:** Büyük özellikleri küçük parçalara böl
2. **Test Et:** Her değişiklikten sonra test et
3. **Git Kullan:** Her özellik için ayrı branch
4. **Code Review:** Kendi kodunu gözden geçir
5. **Documentation:** Kod yazarken yorum ekle
6. **Performance:** Her zaman performansı düşün
7. **Security:** Güvenlik her zaman öncelikli

---

## 🤝 Yardım ve Destek

Sorularınız için:
- GitHub Issues açın
- Code review isteyin
- Best practices paylaşın

**İyi kodlamalar! 🚀**



