# AnimCommerce

AnimCommerce adalah platform e-commerce untuk produk-produk bertema anime (figure, kaos, dan aksesori), dibangun dengan backend **Go (Gin + GORM)** dan frontend **Next.js**. Proyek ini mendukung alur belanja untuk customer, serta panel manajemen untuk admin dan superadmin.

## Tech Stack

**Backend**
- Go 1.26
- [Gin](https://github.com/gin-gonic/gin) — HTTP web framework
- [GORM](https://gorm.io/) + MySQL — ORM & database
- JWT (`golang-jwt`) — autentikasi
- Cloudinary — penyimpanan gambar produk
- gofpdf — generate invoice PDF

**Frontend**
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui (Radix UI)
- TanStack Query & TanStack Table
- Framer Motion & Lottie — animasi
- Axios — HTTP client
- Leaflet — peta (alamat pengiriman)
- Recharts — visualisasi data (dashboard)

**Infrastruktur**
- Docker & Docker Compose

## Struktur Proyek

```
animcommerce/
├── backend/                # REST API (Go)
│   ├── api/                # Route groups: public, customer, admin, superadmin
│   ├── cmd/                # Entry point (main.go)
│   ├── config/             # Koneksi DB, env, Cloudinary
│   ├── database/           # Migrasi database
│   ├── dto/                # Data transfer objects
│   ├── handler/             # HTTP handlers
│   ├── helper/              # Helper (JWT, dll)
│   ├── middleware/          # Auth & role middleware
│   ├── models/              # Entity & enum (product, cart, order, user, dll)
│   ├── repository/          # Data access layer
│   ├── service/             # Business logic
│   └── upload/               # File upload lokal
├── frontend/                # Aplikasi web (Next.js)
│   ├── app/                  # Routing App Router (shop, login, admin, superadmin)
│   ├── components/           # Komponen UI
│   ├── services/             # API client (Axios)
│   ├── providers/            # React context/providers
│   └── ...
└── docker-compose.yml
```

## Fitur

- **Autentikasi & Otorisasi** — Login/register dengan JWT, role-based access (`customer`, `admin`, `superadmin`)
- **Katalog Produk** — Kategori figure, t-shirt, dan accessory, dengan upload gambar ke Cloudinary
- **Keranjang Belanja (Cart)** — Tambah/kelola produk di keranjang
- **Pemesanan (Order)** — Checkout, alamat pengiriman, status pembayaran (`pending`, `success`, `failed`, `expired`) dan status pengiriman (`awaiting-pickup`, `transit`, `delivered`)
- **Invoice** — Generate invoice PDF otomatis
- **Panel Admin** — Kelola produk dan pesanan
- **Panel Superadmin** — Kelola pengguna dan dashboard statistik

## Persyaratan

- Go 1.26+
- Node.js 18+ dan npm
- MySQL
- Akun Cloudinary (untuk upload gambar)
- Docker & Docker Compose (opsional, untuk menjalankan via container)

## Instalasi & Menjalankan

### 1. Clone repository

```bash
git clone https://github.com/Bibintanggg/animcommerce.git
cd animcommerce
```

### 2. Konfigurasi environment

Buat file `.env` di root project (dibaca oleh backend melalui `../.env` relatif terhadap `backend/cmd`) berisi variabel berikut:

```env
SECRET_KEY=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> Koneksi database saat ini mengarah ke MySQL lokal (`127.0.0.1:3306`, database `animcommerce`, user `root`). Sesuaikan kredensial di `backend/config/database.go` sesuai environment kamu, dan pastikan database `animcommerce` sudah dibuat sebelum menjalankan aplikasi (migrasi tabel dijalankan otomatis saat start).

### 3. Menjalankan Backend

```bash
cd backend
go mod download
go run cmd/main.go
```

Backend berjalan di `http://localhost:8080`.

### 4. Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:3000`.

### Menjalankan dengan Docker Compose

Sebagai alternatif, seluruh stack (backend + frontend) bisa dijalankan sekaligus:

```bash
docker-compose up --build
```

## API Overview

Seluruh endpoint berada di bawah prefix `/api`:

| Group | Akses | Contoh Fitur |
|---|---|---|
| `public` | Umum | Login, register |
| `customer` (produk) | Umum | Lihat produk |
| `customer` (cart, order) | Terautentikasi | Keranjang, checkout, riwayat pesanan |
| `admin` | Role `admin` / `superadmin` | Kelola produk & pesanan |
| `superadmin` | Role `superadmin` | Kelola pengguna & dashboard |
