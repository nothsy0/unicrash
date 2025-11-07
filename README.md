# UniCrash - Üniversiteliler için Dating Uygulaması

UniCrash, sadece üniversite öğrencilerinin katılabileceği bir dating uygulamasıdır. Öğrenci belgesi doğrulaması ile güvenli bir ortam sağlar.

## 🚀 Özellikler

- **Öğrenci Doğrulaması**: Kayıt sırasında öğrenci belgesi yükleme ve admin onayı
- **İlgi Alanları**: Unicrash ilgi alanı seçimi (hobiler, spor, müzik, yemek, vb.)
- **Eşleşme Sistemi**: Beğeni/beğenmeme ile eşleşme
- **Sohbet**: Eşleşen kullanıcılar arasında mesajlaşma
- **Modern UI**: Tailwind CSS ile responsive tasarım

## 🛠️ Teknolojiler

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Veritabanı**: SQLite (Prisma ORM)
- **Authentication**: Custom session management
- **File Upload**: Multer (öğrenci belgeleri için)

## 📋 Kurulum ve Çalıştırma

### 🖥️ Localhost'ta Çalıştırma (Geliştirme)

1. **Proje klasörüne gidin:**
   ```bash
   cd unicrash-web
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Veritabanını oluşturun:**
   ```bash
   npx prisma db push
   ```

4. **Seed data'yı yükleyin (ilgi alanları):**
   ```bash
   npx tsx prisma/seed.ts
   ```

5. **Environment değişkenlerini ayarlayın:**
   `.env` dosyasını oluşturun:
   ```
   DATABASE_URL="file:./prisma/dev.db"
   ADMIN_SECRET="emir12345"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

6. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

7. **Tarayıcıda açın:**
   ```
   http://localhost:3000
   ```

### 🚀 Production'a Alma (Canlıya Çıkarma)

#### **Vercel ile Deploy (Önerilen)**

1. **GitHub'a yükleyin:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Vercel'e bağlayın:**
   - [vercel.com](https://vercel.com) üzerinden GitHub hesabınızla giriş yapın
   - "New Project" ile projeyi seçin
   - Environment variables ekleyin:
     - `DATABASE_URL`: Production PostgreSQL URL (Vercel Postgres kullanabilirsiniz)
     - `ADMIN_SECRET`: Güvenli admin şifresi
     - `NEXT_PUBLIC_APP_URL`: Vercel domain URL'iniz

3. **Otomatik deploy:**
   - Her push'ta otomatik deploy edilir

#### **Manuel Production Build**

1. **Production build oluşturun:**
   ```bash
   npm run build
   ```

2. **Production sunucusunu başlatın:**
   ```bash
   npm start
   ```

#### **Önemli Production Ayarları**

⚠️ **SQLite Production için uygun değil!** Production'da PostgreSQL kullanın:

1. **Prisma'yı PostgreSQL'e geçirin:**
   - `prisma/schema.prisma` dosyasında:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Environment Variables:**
   - `DATABASE_URL`: PostgreSQL connection string
   - `ADMIN_SECRET`: Güvenli admin şifresi
   - `NEXT_PUBLIC_APP_URL`: Production domain URL

3. **File Storage:**
   - Fotoğraflar için AWS S3, Cloudinary veya benzer bir servis kullanın
   - Veya Vercel Blob Storage kullanın

4. **Email Servisi:**
   - Şifre sıfırlama için SendGrid, AWS SES veya Resend kullanın

## 📁 Proje Yapısı

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   └── user/[id]/route.ts
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/page.tsx
│   └── page.tsx
├── lib/
│   ├── auth.ts
│   └── prisma.ts
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

## 🔐 Güvenlik

- Şifreler bcrypt ile hash'lenir
- Öğrenci belgeleri yerel olarak saklanır
- Session yönetimi cookie tabanlı
- Admin onayı ile hesap aktivasyonu

## 🎯 Kullanıcı Akışı

1. **Kayıt**: E-posta, şifre, kişisel bilgiler ve öğrenci belgesi yükleme
2. **Onay Bekleme**: Admin tarafından öğrenci belgesi doğrulaması
3. **Profil Tamamlama**: İlgi alanları seçimi
4. **Keşfetme**: Diğer kullanıcıları görme ve beğenme
5. **Eşleşme**: Karşılıklı beğeni durumunda eşleşme
6. **Sohbet**: Eşleşen kullanıcılarla mesajlaşma

## 🚧 Geliştirme Durumu

### ✅ Tamamlanan
- [x] Proje kurulumu ve yapılandırma
- [x] Veritabanı modelleri (User, Interest, Swipe, Match, Message)
- [x] Kayıt ve giriş sistemi
- [x] Öğrenci belgesi yükleme
- [x] Dashboard sayfası
- [x] İlgi alanları seed data

### 🔄 Devam Eden
- [ ] İlgi alanları seçim sayfası
- [ ] Swipe/keşfetme sayfası
- [ ] Eşleşme sistemi
- [ ] Sohbet sayfası
- [ ] Admin paneli

### 📋 Gelecek Özellikler
- [ ] Profil fotoğrafı yükleme
- [ ] Push notification
- [ ] Gelişmiş filtreleme
- [ ] Raporlama sistemi
- [ ] Mobil uygulama

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje hakkında sorularınız için issue açabilirsiniz.
