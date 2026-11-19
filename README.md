# 📱 PrintWere Mobile — Aplikasi Mobile Percetakan

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-52-000020?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

**Aplikasi mobile companion untuk pelanggan PrintWere.**

[Web App →](https://github.com/Azraa175/PRINTWERE-FINAL) · [Demo Web →](https://printwere.vercel.app)

</div>

---

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Persiapan](#-persiapan)
- [Instalasi & Setup](#-instalasi--setup)
- [Konfigurasi API](#-konfigurasi-api)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Struktur Folder](#-struktur-folder)

---

## ✨ Fitur

- 🔐 Login & Registrasi akun
- 🛍️ Jelajahi katalog produk percetakan
- 📦 Detail produk dengan kalkulasi harga otomatis
- 📷 Upload desain dari kamera atau galeri (multi-file)
- 🛒 Keranjang belanja & checkout
- 💳 Upload bukti pembayaran
- 📋 Tracking status pesanan real-time
- 👤 Profil pengguna
- 🔗 Terhubung ke backend PrintWere (Next.js API)

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | React Native 0.76 |
| **Platform** | Expo SDK 52 |
| **Language** | TypeScript |
| **Navigation** | React Navigation 7 (Native Stack + Bottom Tabs) |
| **Storage** | AsyncStorage |
| **Image Picker** | expo-image-picker |
| **Icons** | Lucide React Native |

---

## 📦 Persiapan

Pastikan sudah terinstall:
- **Node.js** ≥ 18.x → [download](https://nodejs.org)
- **npm** ≥ 9.x (bawaan Node.js)
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go** app di HP Android/iOS → [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) / [App Store](https://apps.apple.com/app/expo-go/id982107779)
- Backend **PrintWere Web** sudah berjalan (lokal atau di Vercel)

---

## 🚀 Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/Azraa175/PRINTWERE-MOBILE.git
cd PRINTWERE-MOBILE
```

### 2. Install Dependencies

```bash
npm install
```

---

## 🔗 Konfigurasi API

Aplikasi mobile terhubung ke backend PrintWere melalui API. Konfigurasi URL API ada di:

📄 **`src/services/api.ts`**

```typescript
const DEFAULT_BASE_URL = 'http://192.168.18.78:3000';
```

### Opsi 1: Development Lokal (HP & PC satu WiFi)

Jika menjalankan backend di komputer lokal:

1. Cari IP lokal komputer:
   - **Windows**: buka CMD → ketik `ipconfig` → cari **IPv4 Address** (contoh: `192.168.18.78`)
   - **Mac**: buka Terminal → ketik `ifconfig en0` → cari **inet**
2. Pastikan backend berjalan: `npm run dev` di folder `PRINTWERE-FINAL`
3. Ubah `DEFAULT_BASE_URL` di `src/services/api.ts`:
   ```typescript
   const DEFAULT_BASE_URL = 'http://ALAMAT-IP-KAMU:3000';
   ```
4. **Pastikan HP dan komputer terhubung ke WiFi yang sama!**

### Opsi 2: Production (Vercel)

Jika backend sudah deploy di Vercel:

```typescript
const DEFAULT_BASE_URL = 'https://printwere.vercel.app';
```

> **Catatan:** URL API juga bisa diubah langsung dari halaman Profile di dalam aplikasi tanpa perlu edit kode.

---

## ▶️ Menjalankan Aplikasi

### Start Expo

```bash
npx expo start
```

### Buka di HP

1. Buka aplikasi **Expo Go** di HP
2. Scan QR code yang muncul di terminal
3. Aplikasi akan terbuka otomatis

### Buka di Emulator

```bash
# Android Emulator
npx expo start --android

# iOS Simulator (Mac only)
npx expo start --ios
```

---

## 📁 Struktur Folder

```
PRINTWERE-MOBILE/
├── assets/                    # Gambar, font, dan aset statis
├── src/
│   ├── components/
│   │   └── OrderStatusStepper.tsx  # Komponen tracking status
│   ├── context/
│   │   ├── AuthContext.tsx     # Autentikasi (login, register, token)
│   │   └── CartContext.tsx     # Keranjang belanja
│   ├── navigation/
│   │   └── AppNavigator.tsx    # Navigasi (stack + bottom tabs)
│   ├── screens/
│   │   ├── HomeScreen.tsx      # Beranda (produk rekomendasi)
│   │   ├── ProductsScreen.tsx  # Daftar semua produk
│   │   ├── ProductDetailScreen.tsx  # Detail produk + upload desain
│   │   ├── CartScreen.tsx      # Keranjang belanja
│   │   ├── CheckoutScreen.tsx  # Proses checkout
│   │   ├── OrdersScreen.tsx    # Daftar pesanan
│   │   ├── OrderDetailScreen.tsx  # Detail pesanan + tracking
│   │   ├── PaymentUploadScreen.tsx  # Upload bukti bayar
│   │   ├── ProfileScreen.tsx   # Profil pengguna + setting API URL
│   │   ├── LoginScreen.tsx     # Login
│   │   └── RegisterScreen.tsx  # Registrasi
│   └── services/
│       └── api.ts              # HTTP client & API base URL config
├── App.tsx                     # Entry point
├── app.json                    # Expo configuration
├── babel.config.js             # Babel config
├── metro.config.js             # Metro bundler config
├── tsconfig.json               # TypeScript config
└── package.json
```

---

## 🔧 Troubleshooting

### Tidak bisa konek ke backend lokal
- Pastikan HP dan komputer di **WiFi yang sama**
- Pastikan menggunakan **IP lokal** (bukan `localhost`)
- Coba disable firewall Windows sementara
- Pastikan backend berjalan di port 3000

### Expo Go error "Network request failed"
- Cek kembali `DEFAULT_BASE_URL` di `src/services/api.ts`
- Restart Expo: `npx expo start --clear`

### Expo Go versi tidak cocok
- Update Expo Go di HP ke versi terbaru
- Atau downgrade SDK: periksa versi yang cocok di [expo.dev/versions](https://expo.dev/versions)

---

## 📄 Lisensi

Project ini dibuat untuk keperluan tugas akhir / skripsi.

---

<div align="center">

**Dibuat oleh [Azraa175](https://github.com/Azraa175)**

</div>
