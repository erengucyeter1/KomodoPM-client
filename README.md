# Komodo Project Management System - Client

## 🚀 Proje Hakkında

Komodo Project Management System, özellikle römork ve treyler üretimi yapan şirketler için tasarlanmış kapsamlı bir proje yönetim platformudur. Bu sistem, üretim süreçlerinin takibi, proje yönetimi, Ihracat sonrası KDV iade raporunun otomatik oluşturulması, kullanıcı yetkilendirmesi, stok yönetimi ve müşteri ilişkileri gibi kritik iş süreçlerini tek bir platformda birleştirir.

## 🎯 Temel Özellikler

### 📊 Dashboard ve İstatistikler
- Gerçek zamanlı proje durumu takibi
- Kullanıcı ve proje istatistikleri
- Hızlı erişim menüleri
- Son aktiviteler görüntüleme

### 🏗️ Proje Yönetimi
- Proje oluşturma ve düzenleme
- Treyler tipi bazında proje kategorileme
- Bütçe ve maliyet takibi
- Proje durumu yönetimi (Planlandı, Devam Ediyor, Tamamlandı, İptal Edildi)
- Görsel proje kartları ile kullanıcı dostu arayüz
- Infinite scroll ile performanslı proje listesi

### 👥 Kullanıcı Yönetimi
- Rol bazlı yetkilendirme sistemi
- Güvenli kimlik doğrulama (JWT)
- Kullanıcı profil yönetimi
- İzin kontrollü erişim

### 🚛 Treyler/Römork Yönetimi
- Treyler tipleri ve modelleri
- Görsel malzeme desteği
- Teknik özellik yönetimi

### 📦 Stok Yönetimi
- Malzeme takibi
- Stok seviyeleri kontrolü
- Tedarikçi yönetimi

### 🤝 İş Ortağı Yönetimi
- Müşteri bilgileri
- İş ortağı kayıtları
- İletişim takibi

### 💰 Fatura Yönetimi
- Fatura oluşturma ve takibi

### KDV İade Raporu
- Sistem ile takip edilen projelerin kdv iade raporları tek tık ile oluşturulur.
- Uygulama en uygun faturaları seçer ve gerekli iade raporunu saniyeler içinde hazırlar.



### 💬 İletişim
- Dahili mesajlaşma sistemi
- Real-time bildirimler (Socket.io)
- Proje bazlı iletişim

## 🛠️ Teknoloji Stack

### Frontend Framework & UI
- **Next.js 15.2.4** - React tabanlı full-stack framework
- **React 19** - Kullanıcı arayüzü kütüphanesi
- **TypeScript** - Tip güvenliği
- **Tailwind CSS 4.0** - Modern CSS framework
- **Tailwind Animated** - Animasyonlar


### Form ve Veri Yönetimi
- **React Hook Form** - Form yönetimi
- **Zod** - Schema validasyonu
- **@hookform/resolvers** - Form validasyon entegrasyonu
- **@tanstack/react-table** - Tablo yönetimi

### Veri İşleme ve API
- **Axios** - HTTP istemcisi
- **Socket.io Client** - Real-time iletişim
- **Papa Parse** - CSV işleme

### Özel Özellikler
- **html5-qrcode** - QR kod okuma


## 📁 Proje Yapısı

```
client/
├── app/                    # Next.js App Router sayfa yapısı
│   ├── auth/              # Kimlik doğrulama sayfaları
│   ├── dashboard/         # Ana kontrol paneli
│   ├── projects/          # Proje yönetimi sayfaları
│   ├── users/             # Kullanıcı yönetimi
│   ├── stock/             # Stok yönetimi
│   ├── trailers/          # Treyler/römork yönetimi
│   ├── partners/          # İş ortağı yönetimi
│   ├── invoice/           # Fatura yönetimi
│   ├── chat/              # Mesajlaşma sistemi
│   ├── layout.tsx         # Ana layout bileşeni
│   └── page.jsx           # Ana sayfa
├── components/            # Yeniden kullanılabilir bileşenler
│   ├── ui/               # Temel UI bileşenleri
│   ├── layout/           # Layout bileşenleri
│   ├── features/         # Özellik bazlı bileşenler
│   └── interactives/     # Etkileşimli bileşenler
├── context/              # React Context providers
├── hooks/                # Custom React hooks
├── services/             # API servis fonksiyonları
├── types/                # TypeScript tip tanımları
├── utils/                # Yardımcı fonksiyonlar
├── lib/                  # Üçüncü parti kütüphane ayarları
└── hoc/                  # Higher Order Components
```

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18.0 veya üzeri
- npm, yarn, pnpm veya bun

### Kurulum
```bash
# Projeyi klonlayın
git clone [repository-url]
cd client

# Bağımlılıkları yükleyin
npm install
# veya
yarn install
# veya
pnpm install
```

### Development Server
```bash
npm run dev
# veya
yarn dev
# veya
pnpm dev
```

Uygulama [http://localhost:3001](http://localhost:3001) adresinde çalışmaya başlayacaktır.

## 🔧 Konfigürasyon

### Environment Variables
Aşağıdaki ortam değişkenlerini `.env.local` dosyasında tanımlayın:

```env
NEXT_PUBLIC_API_URL=your_backend_api_url
NEXT_PUBLIC_SOCKET_URL=your_socket_server_url
```

### TypeScript
Proje TypeScript ile geliştirilmiştir ve strict mode kullanır. Tip tanımları `types/` klasöründe bulunmaktadır.


## 🔐 Güvenlik Özellikleri

- JWT tabanlı kimlik doğrulama
- Rol bazlı erişim kontrolü (RBAC)
- Route bazlı yetkilendirme
- Güvenli API iletişimi

## 📱 Responsive Design

Uygulama mobil öncelikli tasarım anlayışıyla geliştirilmiştir:
- Mobile-first yaklaşım
- Tablet ve desktop optimizasyonu
- Touch-friendly arayüz

## 🔄 Real-time Özellikler

Socket.io entegrasyonu ile:
- Anlık bildirimler
- Gerçek zamanlı proje güncellemeleri
- Live chat sistemi
- Kullanıcı durumu takibi
