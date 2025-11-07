import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const interests = [
  // Hobiler
  { name: 'Kitap Okumak', category: 'hobiler', emoji: '📚' },
  { name: 'Film İzlemek', category: 'hobiler', emoji: '🎬' },
  { name: 'Müzik Dinlemek', category: 'hobiler', emoji: '🎵' },
  { name: 'Fotoğraf Çekmek', category: 'hobiler', emoji: '📸' },
  { name: 'Yazı Yazmak', category: 'hobiler', emoji: '✍️' },
  { name: 'Resim Yapmak', category: 'hobiler', emoji: '🎨' },
  { name: 'Oyun Oynamak', category: 'hobiler', emoji: '🎮' },
  { name: 'Bahçıvanlık', category: 'hobiler', emoji: '🌱' },
  { name: 'El Sanatları', category: 'hobiler', emoji: '🧶' },
  { name: 'Koleksiyon', category: 'hobiler', emoji: '🏺' },

  // Spor
  { name: 'Futbol', category: 'spor', emoji: '⚽' },
  { name: 'Basketbol', category: 'spor', emoji: '🏀' },
  { name: 'Voleybol', category: 'spor', emoji: '🏐' },
  { name: 'Tenis', category: 'spor', emoji: '🎾' },
  { name: 'Yüzme', category: 'spor', emoji: '🏊' },
  { name: 'Koşu', category: 'spor', emoji: '🏃' },
  { name: 'Fitness', category: 'spor', emoji: '💪' },
  { name: 'Yoga', category: 'spor', emoji: '🧘' },
  { name: 'Bisiklet', category: 'spor', emoji: '🚴' },
  { name: 'Dağcılık', category: 'spor', emoji: '🧗' },

  // Müzik
  { name: 'Rock', category: 'müzik', emoji: '🎸' },
  { name: 'Pop', category: 'müzik', emoji: '🎤' },
  { name: 'Klasik Müzik', category: 'müzik', emoji: '🎼' },
  { name: 'Jazz', category: 'müzik', emoji: '🎷' },
  { name: 'Elektronik', category: 'müzik', emoji: '🎛️' },
  { name: 'Rap', category: 'müzik', emoji: '🎧' },
  { name: 'Türk Halk Müziği', category: 'müzik', emoji: '🎵' },
  { name: 'Enstrüman Çalmak', category: 'müzik', emoji: '🎹' },

  // Yemek
  { name: 'Kahve', category: 'yemek', emoji: '☕' },
  { name: 'Çay', category: 'yemek', emoji: '🍵' },
  { name: 'Pizza', category: 'yemek', emoji: '🍕' },
  { name: 'Burger', category: 'yemek', emoji: '🍔' },
  { name: 'Sushi', category: 'yemek', emoji: '🍣' },
  { name: 'Tatlı', category: 'yemek', emoji: '🍰' },
  { name: 'Yemek Yapmak', category: 'yemek', emoji: '👨‍🍳' },
  { name: 'Restoran Keşfi', category: 'yemek', emoji: '🍽️' },

  // Seyahat
  { name: 'Seyahat', category: 'seyahat', emoji: '✈️' },
  { name: 'Kamp', category: 'seyahat', emoji: '⛺' },
  { name: 'Şehir Turu', category: 'seyahat', emoji: '🏛️' },
  { name: 'Doğa Yürüyüşü', category: 'seyahat', emoji: '🥾' },
  { name: 'Müze Gezisi', category: 'seyahat', emoji: '🏛️' },
  { name: 'Festival', category: 'seyahat', emoji: '🎪' },

  // Teknoloji
  { name: 'Programlama', category: 'teknoloji', emoji: '💻' },
  { name: 'Yapay Zeka', category: 'teknoloji', emoji: '🤖' },
  { name: 'Blockchain', category: 'teknoloji', emoji: '⛓️' },
  { name: 'Gadget', category: 'teknoloji', emoji: '📱' },
  { name: 'Startup', category: 'teknoloji', emoji: '🚀' },

  // Sosyal
  { name: 'Parti', category: 'sosyal', emoji: '🎉' },
  { name: 'Konser', category: 'sosyal', emoji: '🎵' },
  { name: 'Tiyatro', category: 'sosyal', emoji: '🎭' },
  { name: 'Dans', category: 'sosyal', emoji: '💃' },
  { name: 'Gönüllülük', category: 'sosyal', emoji: '🤝' },
  { name: 'Networking', category: 'sosyal', emoji: '🤝' },

  // Hayvanlar
  { name: 'Köpek', category: 'hayvanlar', emoji: '🐶' },
  { name: 'Kedi', category: 'hayvanlar', emoji: '🐱' },
  { name: 'Kuş', category: 'hayvanlar', emoji: '🐦' },
  { name: 'Balık', category: 'hayvanlar', emoji: '🐠' },
  { name: 'Hamster', category: 'hayvanlar', emoji: '🐹' },

  // Diziler
  { name: 'Aksiyon Dizileri', category: 'diziler', emoji: '💥' },
  { name: 'Dram', category: 'diziler', emoji: '🎭' },
  { name: 'Komedi', category: 'diziler', emoji: '😂' },
  { name: 'Bilim Kurgu', category: 'diziler', emoji: '🚀' },
  { name: 'Gerilim', category: 'diziler', emoji: '🔪' },
  { name: 'Romantik', category: 'diziler', emoji: '💕' }
]

const fakeUsers = [
  // Kız kullanıcılar
  {
    email: 'zeynep@test.com',
    password: '123456',
    name: 'Zeynep',
    age: 22,
    gender: 'kadın',
    university: 'Boğaziçi Üniversitesi',
    department: 'Psikoloji',
    bio: 'Kitap okumayı ve doğada yürüyüş yapmayı seviyorum. Pozitif enerji ile dolu biriyim! 🌸',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop'
    ],
    interests: ['Kitap Okumak', 'Film İzlemek', 'Yoga', 'Kahve', 'Seyahat', 'Kedi', 'Romantik']
  },
  {
    email: 'ayse@test.com',
    password: '123456',
    name: 'Ayşe',
    age: 21,
    gender: 'kadın',
    university: 'İTÜ',
    department: 'Mimarlık',
    bio: 'Mimarlık öğrencisiyim. Sanat ve tasarıma ilgi duyuyorum. Yaratıcı projeler üretmeyi seviyorum! ✨',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop'
    ],
    interests: ['Resim Yapmak', 'Mimarlık', 'Müze Gezisi', 'Klasik Müzik', 'Yemek Yapmak', 'Köpek']
  },
  {
    email: 'elif@test.com',
    password: '123456',
    name: 'Elif',
    age: 23,
    gender: 'kadın',
    university: 'ODTÜ',
    department: 'Bilgisayar Mühendisliği',
    bio: 'Kod yazmayı ve teknolojiyi seviyorum. Aynı zamanda fitness ve spor yapmayı da ihmal etmem! 💻💪',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop'
    ],
    interests: ['Programlama', 'Fitness', 'Futbol', 'Rock', 'Kahve', 'Gadget', 'Yapay Zeka']
  },
  {
    email: 'defne@test.com',
    password: '123456',
    name: 'Defne',
    age: 20,
    gender: 'kadın',
    university: 'Koç Üniversitesi',
    department: 'İşletme',
    bio: 'Sosyal ve aktif biriyim. Partilere ve konserlere gitmeyi seviyorum. Hayatı dolu dolu yaşamayı tercih ediyorum! 🎉',
    photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop'
    ],
    interests: ['Parti', 'Konser', 'Dans', 'Pop', 'Seyahat', 'Festival', 'Restoran Keşfi']
  },
  {
    email: 'meltem@test.com',
    password: '123456',
    name: 'Meltem',
    age: 24,
    gender: 'kadın',
    university: 'Sabancı Üniversitesi',
    department: 'Endüstri Mühendisliği',
    bio: 'Organizasyon ve planlama konusunda iyiyim. Zamanımı verimli kullanmayı ve yeni şeyler öğrenmeyi seviyorum! 📚',
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop'
    ],
    interests: ['Kitap Okumak', 'Yazı Yazmak', 'Koşu', 'Jazz', 'Çay', 'Kamp', 'Networking']
  },
  {
    email: 'sude@test.com',
    password: '123456',
    name: 'Sude',
    age: 20,
    gender: 'kadın',
    university: 'İTÜ',
    department: 'Endüstriyel Tasarım',
    bio: 'Yaratıcı fikirler üretmeyi ve tasarım yapmayı seviyorum. Sanat benim tutkum! 🎨',
    photos: [
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1509783236416-c9ad59bae632?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop'
    ],
    interests: ['Resim Yapmak', 'Fotoğraf Çekmek', 'Müze Gezisi', 'Klasik Müzik', 'Yemek Yapmak', 'Kedi']
  },
  {
    email: 'berna@test.com',
    password: '123456',
    name: 'Berna',
    age: 22,
    gender: 'kadın',
    university: 'Boğaziçi Üniversitesi',
    department: 'Sosyoloji',
    bio: 'Toplumsal konulara ilgi duyuyorum. Aktif olmayı ve sosyal sorumluluk projelerinde yer almayı seviyorum! 🌍',
    photos: [
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop'
    ],
    interests: ['Gönüllülük', 'Kitap Okumak', 'Film İzlemek', 'Yoga', 'Çay', 'Seyahat', 'Köpek']
  },
  {
    email: 'deniz@test.com',
    password: '123456',
    name: 'Deniz',
    age: 21,
    gender: 'kadın',
    university: 'ODTÜ',
    department: 'İngiliz Dili ve Edebiyatı',
    bio: 'Edebiyat ve yazı yazmayı seviyorum. Şiir okumak ve yazmak hobim! 📖',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop'
    ],
    interests: ['Kitap Okumak', 'Yazı Yazmak', 'Tiyatro', 'Klasik Müzik', 'Kahve', 'Kedi', 'Romantik']
  },
  {
    email: 'ceren@test.com',
    password: '123456',
    name: 'Ceren',
    age: 23,
    gender: 'kadın',
    university: 'Koç Üniversitesi',
    department: 'Psikoloji',
    bio: 'İnsan psikolojisine meraklıyım. Meditasyon ve mindfulness yapmayı seviyorum! 🧘',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop'
    ],
    interests: ['Yoga', 'Meditasyon', 'Kitap Okumak', 'Jazz', 'Çay', 'Doğa Yürüyüşü', 'Kedi']
  },
  {
    email: 'esra@test.com',
    password: '123456',
    name: 'Esra',
    age: 22,
    gender: 'kadın',
    university: 'Sabancı Üniversitesi',
    department: 'Siyaset Bilimi',
    bio: 'Siyaset ve güncel olayları takip ediyorum. Tartışmayı ve farklı görüşleri dinlemeyi seviyorum! 📰',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop'
    ],
    interests: ['Kitap Okumak', 'Tiyatro', 'Klasik Müzik', 'Kahve', 'Networking', 'Seyahat', 'Köpek']
  },
  // Erkek kullanıcılar
  {
    email: 'can@test.com',
    password: '123456',
    name: 'Can',
    age: 23,
    gender: 'erkek',
    university: 'Boğaziçi Üniversitesi',
    department: 'İktisat',
    bio: 'Spor yapmayı ve arkadaşlarımla zaman geçirmeyi seviyorum. Futbol ve basketbol tutkunuyum! ⚽',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop'
    ],
    interests: ['Futbol', 'Basketbol', 'Fitness', 'Rock', 'Burger', 'Parti', 'Köpek']
  },
  {
    email: 'emre@test.com',
    password: '123456',
    name: 'Emre',
    age: 22,
    gender: 'erkek',
    university: 'İTÜ',
    department: 'Makine Mühendisliği',
    bio: 'Teknoloji ve mühendislik konularına ilgi duyuyorum. Girişimcilik ve startup dünyasıyla ilgileniyorum! 🚀',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop'
    ],
    interests: ['Programlama', 'Startup', 'Yapay Zeka', 'Elektronik', 'Gadget', 'Konser', 'Seyahat']
  },
  {
    email: 'burak@test.com',
    password: '123456',
    name: 'Burak',
    age: 21,
    gender: 'erkek',
    university: 'ODTÜ',
    department: 'Elektrik-Elektronik Mühendisliği',
    bio: 'Müzik dinlemeyi ve enstrüman çalmayı seviyorum. Gitar çalıyorum ve konserlere gitmeyi severim! 🎸',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop'
    ],
    interests: ['Enstrüman Çalmak', 'Rock', 'Konser', 'Müzik Dinlemek', 'Kahve', 'Tiyatro', 'Kedi']
  },
  {
    email: 'alper@test.com',
    password: '123456',
    name: 'Alper',
    age: 24,
    gender: 'erkek',
    university: 'Koç Üniversitesi',
    department: 'İşletme',
    bio: 'İş dünyası ve finans konularına ilgi duyuyorum. Networking ve yeni insanlarla tanışmayı seviyorum! 💼',
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop'
    ],
    interests: ['Networking', 'Restoran Keşfi', 'Seyahat', 'Film İzlemek', 'Fitness', 'Jazz', 'Köpek']
  },
  {
    email: 'kıvanç@test.com',
    password: '123456',
    name: 'Kıvanç',
    age: 23,
    gender: 'erkek',
    university: 'Sabancı Üniversitesi',
    department: 'Endüstriyel Tasarım',
    bio: 'Yaratıcılık ve tasarım benim tutkum. Sanat ve kültür etkinliklerine katılmayı seviyorum! 🎨',
    photos: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'
    ],
    interests: ['Resim Yapmak', 'Müze Gezisi', 'Tiyatro', 'Klasik Müzik', 'Fotoğraf Çekmek', 'Yemek Yapmak', 'Seyahat']
  },
  {
    email: 'arda@test.com',
    password: '123456',
    name: 'Arda',
    age: 22,
    gender: 'erkek',
    university: 'Boğaziçi Üniversitesi',
    department: 'Bilgisayar Mühendisliği',
    bio: 'Yazılım geliştirme ve algoritma problemleri çözmeyi seviyorum. Hackathon\'lara katılmayı severim! 💻',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop'
    ],
    interests: ['Programlama', 'Yapay Zeka', 'Blockchain', 'Gadget', 'Kahve', 'Oyun Oynamak', 'Köpek']
  },
  {
    email: 'onur@test.com',
    password: '123456',
    name: 'Onur',
    age: 21,
    gender: 'erkek',
    university: 'İTÜ',
    department: 'İnşaat Mühendisliği',
    bio: 'Mimari yapılar ve şehir planlaması ilgimi çekiyor. Proje yönetimi konusunda deneyimliyim! 🏗️',
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'
    ],
    interests: ['Futbol', 'Fitness', 'Film İzlemek', 'Rock', 'Burger', 'Seyahat', 'Köpek']
  },
  {
    email: 'berkay@test.com',
    password: '123456',
    name: 'Berkay',
    age: 24,
    gender: 'erkek',
    university: 'ODTÜ',
    department: 'Fizik',
    bio: 'Bilim ve araştırma benim tutkum. Evrenin sırlarını keşfetmeyi seviyorum! 🔬',
    photos: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'
    ],
    interests: ['Bilim Kurgu', 'Kitap Okumak', 'Programlama', 'Elektronik', 'Kahve', 'Kedi']
  },
  {
    email: 'tunahan@test.com',
    password: '123456',
    name: 'Tunahan',
    age: 20,
    gender: 'erkek',
    university: 'Koç Üniversitesi',
    department: 'Ekonomi',
    bio: 'Finans ve ekonomi dünyasına ilgi duyuyorum. Yatırım ve borsa konularında kendimi geliştiriyorum! 📈',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop'
    ],
    interests: ['Networking', 'Restoran Keşfi', 'Film İzlemek', 'Jazz', 'Fitness', 'Köpek']
  },
  {
    email: 'kerem@test.com',
    password: '123456',
    name: 'Kerem',
    age: 23,
    gender: 'erkek',
    university: 'Sabancı Üniversitesi',
    department: 'Müzik',
    bio: 'Müzik hayatımın merkezinde. Piyano çalıyorum ve beste yapıyorum! 🎹',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'
    ],
    interests: ['Enstrüman Çalmak', 'Klasik Müzik', 'Jazz', 'Konser', 'Tiyatro', 'Kahve', 'Kedi']
  }
]

async function main() {
  console.log('İlgi alanları ekleniyor...')
  
  for (const interest of interests) {
    await prisma.interest.upsert({
      where: { name: interest.name },
      update: {},
      create: interest
    })
  }
  
  console.log('İlgi alanları başarıyla eklendi!')

  console.log('Fake kullanıcılar ekleniyor...')
  
  for (const fakeUser of fakeUsers) {
    // Kullanıcı zaten var mı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email: fakeUser.email }
    })

    if (existingUser) {
      console.log(`${fakeUser.email} zaten mevcut, atlanıyor...`)
      continue
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(fakeUser.password, 12)

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        email: fakeUser.email,
        password: hashedPassword,
        name: fakeUser.name,
        age: fakeUser.age,
        gender: fakeUser.gender,
        university: fakeUser.university,
        department: fakeUser.department,
        bio: fakeUser.bio,
        photos: JSON.stringify(fakeUser.photos),
        isVerified: true, // Otomatik onaylı
        isActive: true,
        freeLikesUsed: 0,
        paidLikesUsed: 0
      }
    })

    // İlgi alanlarını ekle
    for (const interestName of fakeUser.interests) {
      const interest = await prisma.interest.findUnique({
        where: { name: interestName }
      })

      if (interest) {
        await prisma.userInterest.create({
          data: {
            userId: user.id,
            interestId: interest.id
          }
        })
      }
    }

    console.log(`${fakeUser.name} (${fakeUser.email}) başarıyla eklendi!`)
  }
  
  console.log('Fake kullanıcılar başarıyla eklendi!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

