# AnimCommerce — Frontend

Frontend aplikasi **AnimCommerce**, dibangun dengan Next.js (App Router) dan React 19. Menyediakan halaman belanja untuk customer serta dashboard untuk admin dan superadmin, yang berkomunikasi dengan [backend Go](../backend).

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix UI) — komponen & styling
- **TanStack Query** — data fetching & caching
- **TanStack Table** — tabel data (dashboard admin/superadmin)
- **Axios** — HTTP client ke backend
- **Framer Motion** & **Lottie** — animasi
- **Recharts** — visualisasi data/statistik
- **Leaflet** — peta (alamat pengiriman)

## Struktur Folder

```
frontend/
├── app/                     # Routing (App Router)
│   ├── (shop)/              # Halaman toko/customer
│   ├── admin/               # Dashboard & manajemen produk (role admin)
│   ├── superadmin/          # Manajemen user & dashboard (role superadmin)
│   ├── login/                # Halaman login
│   └── 403/                  # Halaman akses ditolak
├── components/
│   ├── ui/                   # Komponen dasar (shadcn/ui), termasuk table
│   ├── sections/              # Komponen berbasis section halaman
│   ├── layout/                 # Layout (header, sidebar, dll)
│   ├── forms/                   # Komponen form
│   ├── common/                   # Komponen umum yang reusable
│   ├── states/                    # Komponen state (loading, empty, error, dll)
│   └── visual/                     # Komponen visual/animasi
├── services/                 # API client per domain (auth, cart, order, product, users)
├── providers/                # React context providers (React Query, Goeey/toast)
├── lib/                      # Axios instance (lib/api.ts), util, data helper
├── helper/                   # Helper fungsi (format tanggal, initials, dll)
├── hooks/                    # Custom hooks (data table, mobile detection)
├── config/                   # Konfigurasi role, status, activity (mapping label/warna)
├── enums/                    # Enum TypeScript
├── types/                    # Tipe/interface TypeScript
├── data/                     # Data statis
├── middleware.ts             # Proteksi route berbasis role (cookie `role`)
└── public/                   # Aset statis
```

## Fitur

- **Halaman Shop** — Katalog produk untuk customer (grup route `(shop)`)
- **Login** — Autentikasi user
- **Dashboard Admin** — Manajemen produk, lihat & kelola pesanan
- **Dashboard Superadmin** — Manajemen pengguna dan statistik dashboard
- **Route Protection** — `middleware.ts` mengecek cookie `role` untuk membatasi akses `/admin/*` (role `admin`/`superadmin`) dan `/superadmin/*` (role `superadmin`), redirect ke `/403` jika tidak sesuai

## Persyaratan

- Node.js 18+
- Backend AnimCommerce sudah berjalan di `http://localhost:8080` (lihat [`../backend`](../backend))

## Instalasi

```bash
cd frontend
npm install
```

## Menjalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Script Lain

```bash
npm run build   # Build production
npm run start   # Menjalankan hasil build
npm run lint    # Menjalankan ESLint
```

## Konfigurasi API

Base URL API saat ini di-hardcode di `lib/api.ts` ke `http://localhost:8080/api/`. Token autentikasi diambil dari `localStorage` (`token`) dan otomatis disisipkan sebagai header `Authorization: Bearer <token>` untuk request selain `/login` dan `/register`.

> Saat dijalankan lewat Docker Compose, variabel `NEXT_PUBLIC_API_URL` di-set ke `http://localhost:8080`, namun `lib/api.ts` belum membaca variabel ini — jika ingin men-deploy ke environment lain, sesuaikan `baseURL` di `lib/api.ts` atau ubah agar membaca `process.env.NEXT_PUBLIC_API_URL`.

## Menjalankan dengan Docker

Dari root project:

```bash
docker-compose up --build
```

Frontend akan tersedia di `http://localhost:3000`.

## Konvensi Styling

Menggunakan Tailwind CSS v4 dan komponen shadcn/ui (konfigurasi di `components.json`). Ikon menggunakan `lucide-react`.
