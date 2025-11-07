# 🖥️ Localhost Kurulum Rehberi

Bu projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları takip edin.

## 📋 Gereksinimler

- Node.js (v18 veya üzeri)
- npm veya yarn

## 🚀 Kurulum Adımları

### 1. Proje Klasörüne Gidin

```bash
cd unicrash-web
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Değişkenlerini Kontrol Edin

`.env` dosyası zaten oluşturulmuş olmalı. İçeriğini kontrol edin:

```
DATABASE_URL="file:./prisma/dev.db"
ADMIN_SECRET="emir12345"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Veritabanını Oluşturun

```bash
npx prisma db push
```

Bu komut veritabanı şemasını oluşturur ve günceller.

### 5. Seed Data'yı Yükleyin (İlgi Alanları)

```bash
npm run seed
```

veya

```bash
npx tsx prisma/seed.ts
```

Bu komut ilgi alanlarını (hobiler, spor, müzik, yemek) veritabanına ekler.

### 6. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

### 7. Tarayıcıda Açın

Uygulama şu adreste çalışacak:
```
http://localhost:3000
```

## 🎯 Kullanım

- **Ana Sayfa**: http://localhost:3000
- **Kayıt**: http://localhost:3000/auth/register
- **Giriş**: http://localhost:3000/auth/login
- **Admin Paneli**: http://localhost:3000/admin (ADMIN_SECRET ile giriş yapın)

## 🔧 Sorun Giderme

### Port 3000 Kullanımda

Eğer port 3000 kullanımda ise, farklı bir port kullanabilirsiniz:

```bash
npm run dev -- -p 3001
```

### Veritabanı Hatası

Veritabanı ile ilgili bir hata alırsanız:

```bash
# Veritabanını sıfırlayın
rm prisma/dev.db
npx prisma db push
npm run seed
```

### Bağımlılık Hataları

```bash
# node_modules ve package-lock.json'ı silin
rm -rf node_modules package-lock.json

# Yeniden yükleyin
npm install
```

## 📝 Notlar

- Veritabanı SQLite kullanıyor, bu yüzden ek bir veritabanı sunucusu kurmanıza gerek yok
- Dosya yüklemeleri `public/uploads/` klasöründe saklanır
- Geliştirme modunda hot-reload aktif, kod değişiklikleri otomatik yüklenir



