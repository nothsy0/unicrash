# Mobil Test Rehberi

## 🚀 Mobil Cihazda Test Etme Yöntemleri

### Yöntem 1: Chrome DevTools (En Kolay - Hemen Test)

1. **Chrome'da aç:**
   - `http://localhost:3000` adresini aç
   - `F12` veya `Ctrl+Shift+I` (Mac: `Cmd+Option+I`) ile Developer Tools'u aç
   - `Ctrl+Shift+M` (Mac: `Cmd+Shift+M`) ile Device Toolbar'ı aç
   - Sağ üstteki cihaz seçici ile iPhone, Android vs. seç
   - Veya özel boyut gir (örn: 375x812 - iPhone X)

2. **Touch simulation:**
   - Device Toolbar açıkken touch olayları simüle edilir
   - Swipe hareketleri test edilebilir

### Yöntem 2: Gerçek Mobil Cihaz (Aynı WiFi Ağında)

#### Adım 1: Bilgisayarın IP Adresini Bul

**Windows:**
```powershell
ipconfig
```
`IPv4 Address` değerini not al (örn: `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
# veya
ip addr
```

#### Adım 2: Next.js'i Mobil Erişime Aç

Terminal'de şu komutu çalıştır:
```bash
npm run dev:mobile
```

Veya manuel olarak:
```bash
next dev -H 0.0.0.0
```

#### Adım 3: Firewall Ayarları (Windows)

Windows Defender Firewall'da Next.js'e izin ver:
1. Windows Güvenlik Duvarı'nı aç
2. "Gelen kurallarına izin ver" seçeneğini aç
3. Veya geçici olarak port 3000'i aç:
   ```powershell
   netsh advfirewall firewall add rule name="Next.js Dev" dir=in action=allow protocol=TCP localport=3000
   ```

#### Adım 4: Mobil Cihazdan Bağlan

1. **Mobil cihazın aynı WiFi ağında olduğundan emin ol**
2. **Mobil cihazın tarayıcısında şu adresi aç:**
   ```
   http://[BILGISAYAR_IP_ADRESI]:3000
   ```
   Örnek: `http://192.168.1.100:3000`

3. **Eğer çalışmazsa:**
   - Bilgisayarın firewall'ını kontrol et
   - Her iki cihazın aynı WiFi'de olduğundan emin ol
   - IP adresinin doğru olduğunu kontrol et

### Yöntem 3: Ngrok ile Dış Erişim (Farklı Ağlardan)

1. **Ngrok'u indir ve kur:**
   ```bash
   # Ngrok'u https://ngrok.com/download adresinden indir
   ```

2. **Next.js'i normal şekilde başlat:**
   ```bash
   npm run dev
   ```

3. **Yeni terminal aç ve Ngrok'u başlat:**
   ```bash
   ngrok http 3000
   ```

4. **Ngrok'un verdiği URL'i kullan:**
   - Örnek: `https://abc123.ngrok.io`
   - Bu URL'i mobil cihazdan aç (herhangi bir ağdan çalışır)

### Yöntem 4: Vercel'e Deploy (Production Test)

1. **GitHub'a push et:**
   ```bash
   git add .
   git commit -m "Mobile ready"
   git push
   ```

2. **Vercel'e bağla:**
   - https://vercel.com adresine git
   - GitHub repo'yu seç
   - Otomatik deploy olur
   - Verilen URL'i mobil cihazdan aç

## 📱 Test Checklist

- [ ] Responsive tasarım (küçük ekranda bozuluyor mu?)
- [ ] Touch butonları (44px minimum boyut)
- [ ] Swipe hareketleri (Discover sayfası)
- [ ] Modal'lar (tam ekran açılıyor mu?)
- [ ] Form input'ları (klavye açılıyor mu?)
- [ ] Mesajlaşma (chat sayfası)
- [ ] Fotoğraf yükleme (profile builder)
- [ ] Navigasyon (geri butonları çalışıyor mu?)

## 🔧 Sorun Giderme

**"Bağlantı reddedildi" hatası:**
- Firewall ayarlarını kontrol et
- IP adresinin doğru olduğundan emin ol
- Aynı WiFi ağında olduğundan emin ol

**"Sayfa yüklenmiyor":**
- Next.js server'ın çalıştığından emin ol
- Port 3000'in başka bir uygulama tarafından kullanılmadığından emin ol

**"HTTPS hatası":**
- Local development HTTP kullanır, bu normal
- Mobil tarayıcıda "Güvenli olmayan siteye devam et" seçeneğini seç

## 💡 İpuçları

1. **Chrome DevTools en hızlı test yöntemidir**
2. **Gerçek cihazda test etmek en doğru sonucu verir**
3. **Farklı cihaz boyutlarını test et** (iPhone SE, iPhone 14 Pro Max, Samsung Galaxy)
4. **Hem portre hem yatay modu test et**
5. **Touch gesture'ları test et** (swipe, tap, long press)

