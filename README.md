<div align="center">

# AnimCommerce

### Full-Stack Anime Merchandise E-Commerce

Platform e-commerce untuk penjualan merchandise anime dengan katalog produk, wishlist, cart, checkout, pembayaran, pengelolaan order, invoice PDF, serta notifikasi admin secara real-time.

[![Go](https://img.shields.io/badge/Go-1.26-00ADD8?logo=go\&logoColor=white)](https://go.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql\&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss\&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Cloud_Messaging-FFCA28?logo=firebase\&logoColor=black)](https://firebase.google.com/)

</div>

---

## Tentang Project

AnimCommerce adalah aplikasi e-commerce full-stack yang dibangun menggunakan **Go** dan **Next.js**.

Project ini memiliki tiga jenis pengguna:

* **Customer** — melihat produk, wishlist, cart, checkout, pembayaran, dan riwayat pesanan.
* **Admin** — mengelola produk, review, order, invoice, serta menerima notifikasi pesanan baru.
* **Superadmin** — mengelola akun pengguna dan mengakses dashboard administratif.

Backend menggunakan arsitektur berlapis:

```text
Route → Handler → Service → Repository → Database
```

Pemisahan tersebut membuat business logic, HTTP handler, dan akses database lebih mudah dirawat dan dikembangkan.

> **Status project:** masih dalam pengembangan aktif. Pembayaran QRIS dan BCA Virtual Account saat ini masih berupa simulasi/dummy dan belum memproses transaksi sungguhan.

---

## Fitur Utama

### Customer

* Register dan login.
* Melihat katalog dan detail produk.
* Melihat stok dan rating produk.
* Menambahkan serta menghapus produk dari wishlist.
* Menambahkan produk ke cart.
* Mengubah quantity dan menghapus item cart.
* Memilih item cart yang ingin di-checkout.
* Checkout langsung dari halaman produk melalui slug.
* Mengisi informasi penerima dan alamat pengiriman.
* Memilih metode pembayaran:

  * QRIS dummy.
  * BCA Virtual Account dummy.
* Melihat riwayat dan detail pesanan.
* Mengunduh invoice PDF melalui endpoint yang dilindungi.
* Membuat dan mengelola review produk.

### Admin

* Mengelola produk dan gambar produk.
* Mengelola stok produk.
* Melihat dan mengelola review.
* Melihat daftar serta detail order customer.
* Melihat alamat dan informasi pembayaran order.
* Mengubah status order.
* Mengunduh invoice customer.
* Menerima notifikasi pesanan baru secara real-time.
* Menerima browser push notification melalui Firebase Cloud Messaging.
* Menandai notifikasi sebagai sudah dibaca.

### Superadmin

* Melihat daftar pengguna.
* Membuat dan memperbarui akun pengguna.
* Menghapus pengguna.
* Melakukan reset password pengguna.
* Mengakses dashboard superadmin.

---

## Alur Checkout

AnimCommerce memiliki dua alur checkout:

### Checkout dari cart

Customer memilih satu atau beberapa item dari cart, mengisi alamat, memilih metode pembayaran, lalu membuat order.

```http
POST /api/orders/checkout
```

### Checkout langsung dari produk

Customer membuka detail produk berdasarkan slug, menentukan quantity, mengisi alamat, memilih pembayaran, lalu membuat order tanpa harus memasukkannya ke cart.

```http
POST /api/orders/checkout/product/:slug
```

Kedua alur tersebut tetap menghasilkan data order, order item, alamat, payment instruction, dan invoice.

---

## Pembayaran

Metode pembayaran yang tersedia saat ini:

| Metode              | Implementasi                                       |
| ------------------- | -------------------------------------------------- |
| QRIS                | Menghasilkan QR dummy untuk kebutuhan pengembangan |
| BCA Virtual Account | Menghasilkan nomor VA dummy                        |
| Payment gateway     | Direncanakan untuk pengembangan berikutnya         |

Status pembayaran yang digunakan:

```text
pending
success
failed
expired
```

Struktur payment sudah menyediakan informasi seperti:

* Payment method.
* Payment status.
* Provider.
* External reference.
* QR string.
* Virtual account number.
* Amount.
* Expiration time.
* Paid time.

Untuk production, payment instruction dummy perlu diganti menggunakan payment gateway seperti Midtrans, Xendit, DOKU, atau provider lainnya beserta webhook untuk memperbarui status pembayaran secara otomatis.

---

## Notifikasi Real-Time

Notifikasi admin menggunakan dua mekanisme:

### Server-Sent Events

SSE digunakan untuk menampilkan notifikasi secara langsung ketika dashboard admin sedang dibuka.

```http
GET /api/admin/notifications/stream
```

### Firebase Cloud Messaging

Firebase Cloud Messaging digunakan untuk menampilkan native browser notification ketika tab sedang tidak aktif atau browser diminimalkan.

Browser tetap memerlukan persetujuan pengguna sebelum dapat menampilkan push notification.

Fitur notification yang tersedia:

* Menyimpan notifikasi ke database.
* Mengirim event pesanan baru ke admin.
* Menyimpan installation ID perangkat.
* Menampilkan browser notification.
* Mengarahkan admin ke order ketika notifikasi diklik.
* Menghapus installation ID Firebase yang sudah tidak valid.
* Menandai satu atau seluruh notifikasi sebagai sudah dibaca.

---

## Security

Beberapa perlindungan keamanan yang telah diterapkan:

* Password disimpan menggunakan bcrypt.
* JWT menggunakan algoritma HS256.
* JWT memiliki issuer, issued time, expiration, dan not-before claim.
* Backend menolak startup apabila `SECRET_KEY` kurang dari 32 karakter.
* Role pengguna diperiksa kembali dari database pada request terautentikasi.
* Pemisahan akses customer, admin, dan superadmin.
* Rate limiting pada endpoint login dan register.
* Autentikasi menggunakan cookie `HttpOnly`.
* CORS dikonfigurasi untuk frontend yang diizinkan.
* Invoice tidak dibuka melalui public static folder.
* Download invoice memeriksa pemilik order atau role admin.
---

## Teknologi

### Backend

* Go 1.26
* Gin
* GORM
* MySQL
* JWT
* bcrypt
* Firebase Admin SDK
* Firebase Cloud Messaging
* Cloudinary
* gofpdf
* Server-Sent Events

### Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS 4
* TanStack Query
* TanStack Table
* Axios
* Firebase Web SDK
* qrcode.react
* Framer Motion
* Radix UI
* shadcn/ui
* Lucide React
* Recharts
* Leaflet
* gooey-toast

### Infrastructure

* Docker
* Docker Compose
* MySQL 8.4

---

## Struktur Project

```text
animcommerce/
├── backend/
│   ├── api/                 # Route berdasarkan role
│   │   ├── admin/
│   │   ├── customer/
│   │   ├── public/
│   │   └── superadmin/
│   ├── cmd/                 # Entry point backend
│   ├── config/              # Database, Cloudinary, dan Firebase
│   ├── database/            # Database migration
│   ├── dto/                 # Request dan response DTO
│   ├── handler/             # HTTP request handler
│   ├── helper/              # JWT dan helper lainnya
│   ├── middleware/          # Auth, role, dan rate limiting
│   ├── models/              # Database models
│   ├── realtime/            # Notification hub dan SSE
│   ├── repository/          # Database queries
│   ├── routes/              # Dependency wiring dan route setup
│   ├── service/             # Business logic
│   └── storage/             # Image storage abstraction
│
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Axios dan Firebase configuration
│   ├── providers/           # React Query provider
│   ├── public/              # Static assets dan FCM service worker
│   ├── services/            # API service functions
│   └── types/               # TypeScript interfaces
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## Persyaratan

Pastikan perangkat sudah memiliki:

* Go 1.26 atau lebih baru.
* Node.js 20.9 atau lebih baru.
* npm.
* MySQL 8 atau lebih baru.
* Akun Cloudinary.
* Firebase project dengan Cloud Messaging aktif.

---

## Instalasi

### 1. Clone repository

```bash
git clone https://github.com/Bibintanggg/animcommerce.git
cd animcommerce
```

### 2. Konfigurasi backend

Salin environment example ke folder backend:

```bash
cp .env.example backend/.env
```

Untuk PowerShell:

```powershell
Copy-Item .env.example backend/.env
```

Lengkapi `backend/.env`:

```env
DATABASE_DSN=root:your-password@tcp(127.0.0.1:3306)/animcommerce?charset=utf8mb4&parseTime=True&loc=Local

SECRET_KEY=replace-with-at-least-32-random-characters

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

FIREBASE_PROJECT_ID=your-firebase-project-id
GOOGLE_APPLICATION_CREDENTIALS=../firebase-service-account.json

FRONTEND_URL=http://localhost:3000
```

Download Firebase Admin SDK service account dari Firebase Console, kemudian simpan sebagai:

```text
backend/firebase-service-account.json
```

> Jangan pernah memasukkan `firebase-service-account.json`, `.env`, private key, atau token ke repository.

Buat database MySQL:

```sql
CREATE DATABASE animcommerce
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Jalankan backend:

```bash
cd backend
go mod download
cd cmd
go run .
```

Backend berjalan pada:

```text
http://localhost:8080
```

### 3. Konfigurasi frontend

Masuk ke folder frontend:

```bash
cd frontend
npm install
```

Buat file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api

NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-public-vapid-key
```

Jalankan frontend:

```bash
npm run dev
```

Frontend berjalan pada:

```text
http://localhost:3000
```

---

## Menjalankan dengan Docker

Repository menyediakan Docker Compose untuk frontend, backend, dan MySQL.

```bash
docker compose up --build
```

Sebelum menjalankannya, pastikan environment berikut sudah dikonfigurasi:

```env
MYSQL_ROOT_PASSWORD=your-strong-database-password
SECRET_KEY=replace-with-at-least-32-random-characters

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

Firebase service account juga perlu dipasang sebagai volume dan environment Firebase perlu diteruskan ke container backend apabila fitur push notification ingin digunakan melalui Docker.

---

## Ringkasan API

### Public

| Method | Endpoint                     | Fungsi                         |
| ------ | ---------------------------- | ------------------------------ |
| POST   | `/api/login`                 | Login                          |
| POST   | `/api/register`              | Register                       |
| GET    | `/api/products`              | Daftar produk published        |
| GET    | `/api/product-details/:slug` | Detail produk berdasarkan slug |

### Customer

| Method | Endpoint                             | Fungsi               |
| ------ | ------------------------------------ | -------------------- |
| GET    | `/api/me`                            | Data user login      |
| GET    | `/api/cart`                          | Melihat cart         |
| POST   | `/api/cart`                          | Menambahkan item     |
| PUT    | `/api/cart/:id`                      | Mengubah quantity    |
| DELETE | `/api/cart/:id`                      | Menghapus item       |
| GET    | `/api/wishlists`                     | Melihat wishlist     |
| POST   | `/api/wishlists/:productId`          | Menambahkan wishlist |
| DELETE | `/api/wishlists/:productId`          | Menghapus wishlist   |
| POST   | `/api/orders/checkout`               | Checkout item cart   |
| POST   | `/api/orders/checkout/product/:slug` | Checkout langsung    |
| GET    | `/api/orders`                        | Riwayat pesanan      |
| GET    | `/api/orders/:id`                    | Detail pesanan       |
| GET    | `/api/orders/:id/invoice`            | Download invoice     |

### Admin

| Method | Endpoint                            | Fungsi                   |
| ------ | ----------------------------------- | ------------------------ |
| GET    | `/api/admin/products`               | Daftar seluruh produk    |
| POST   | `/api/admin/products`               | Membuat produk           |
| PUT    | `/api/admin/products/:id`           | Memperbarui produk       |
| DELETE | `/api/admin/products/:id`           | Menghapus produk         |
| GET    | `/api/admin/orders`                 | Daftar order             |
| GET    | `/api/admin/orders/:id`             | Detail order             |
| PATCH  | `/api/admin/orders/:id/status`      | Mengubah status order    |
| GET    | `/api/admin/orders/:id/invoice`     | Download invoice         |
| GET    | `/api/admin/notifications`          | Daftar notifikasi        |
| GET    | `/api/admin/notifications/stream`   | SSE notification stream  |
| PATCH  | `/api/admin/notifications/read-all` | Baca semua notifikasi    |
| PATCH  | `/api/admin/notifications/:id/read` | Baca satu notifikasi     |
| POST   | `/api/admin/notifications/devices`  | Registrasi perangkat FCM |

---

## Status Order

```text
pending
processing
cancelled
completed
```

## Status Pengiriman

```text
awaiting-pickup
transit
delivered
```

## Status Pembayaran

```text
pending
success
failed
expired
```

---

## Roadmap

### Core E-Commerce

* [x] Authentication dan role-based authorization.
* [x] Product dan stock management.
* [x] Cart dan wishlist.
* [x] Checkout dari cart.
* [x] Checkout langsung berdasarkan product slug.
* [x] Order history dan order detail.
* [x] Protected invoice PDF.
* [x] Admin real-time notification menggunakan SSE.
* [x] Browser push notification menggunakan Firebase.
* [x] Simulasi pembayaran QRIS dan BCA Virtual Account.

### Payment dan Order Automation

* [ ] Integrasi payment gateway production.
* [ ] Payment webhook.
* [ ] Pembaruan status pembayaran otomatis.
* [ ] Pembatalan otomatis untuk pembayaran yang kedaluwarsa.
* [ ] Integrasi ekspedisi dan tracking pengiriman.
* [ ] Email invoice dan perubahan status order.

### Performance dan Messaging

* [ ] Integrasi Redis.
* [ ] Cache katalog dan detail produk menggunakan Redis.
* [ ] Cache data dashboard dan query yang sering digunakan.
* [ ] Redis-based rate limiting.
* [ ] Cache invalidation ketika produk atau stok diperbarui.
* [ ] Integrasi RabbitMQ sebagai message broker.
* [ ] Pemrosesan notifikasi secara asynchronous melalui RabbitMQ.
* [ ] Queue untuk pembuatan invoice dan pengiriman email.
* [ ] Event-driven order processing untuk event order, payment, dan shipment.
* [ ] Retry dan dead-letter queue untuk job yang gagal diproses.

### Engineering

* [ ] Unit test untuk service dan business logic.
* [ ] Integration test untuk API.
* [ ] End-to-end test untuk login, cart, dan checkout.
* [ ] GitHub Actions untuk lint, build, dan test.
* [ ] Docker Compose untuk MySQL, Redis, dan RabbitMQ.
* [ ] Health check untuk backend dan infrastructure services.
* [ ] Dokumentasi API menggunakan Swagger/OpenAPI.
* [ ] Audit log aktivitas admin.
* [ ] Structured logging dan request ID.
* [ ] Monitoring queue, cache, dan application metrics.


---

## Catatan Pengembangan

Project ini dibuat sebagai implementasi full-stack e-commerce dan masih terus dikembangkan.

Beberapa integrasi seperti QRIS dan BCA Virtual Account saat ini hanya digunakan sebagai simulasi. Jangan menggunakan payment instruction dummy untuk transaksi sungguhan.

---

## Author

Dibuat dan dikembangkan oleh [Bibintanggg](https://github.com/Bibintanggg).

Repository:

[github.com/Bibintanggg/animcommerce](https://github.com/Bibintanggg/animcommerce)
