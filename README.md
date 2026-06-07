# 📦 KongsiStok

**KongsiStok** adalah platform koordinasi dan solidaritas stok antar-warung lokal. Aplikasi ini dirancang untuk membantu para pemilik warung dalam satu komunitas agar bisa saling berbagi informasi terkait kelebihan stok dagangan atau mencari pasokan stok yang sedang langka secara *real-time*.

---

## 🚀 Fitur Utama

* **Sistem Autentikasi Komunitas:** Masuk dan daftar menggunakan nomor WhatsApp yang terikat dengan komunitas warung spesifik.
* **Manajemen Stok Logistik:** Pemilik warung dapat membuat kiriman berupa "Cari Bantuan Stok" (Butuh) atau "Kelebihan Stok".
* **Isi Otomatis Pakai AI (Gemini):** Pengguna cukup menulis cerita singkat, dan AI akan otomatis mengisi kolom nama barang, jumlah, dan satuan secara cerdas.
* **Dashboard Komunitas Terfilter:** Setiap warung hanya akan melihat aktivitas stok yang relevan di dalam komunitas mereka sendiri.
* **Kontrol Status Real-time:** Mengubah status ketersediaan stok langsung dari kartu kiriman.

---

## 🛠️ Teknologi yang Digunakan

### Frontend (Client)
* **React.js** (Vite)
* **Tailwind CSS** (Gaya desain minimalis & responsif)
* **Lucide React** (Ikonografi)
* **Vercel** (Platform Deployment)

### Backend (Server)
* **Node.js & Express.js** (RESTful API)
* **Microsoft SQL Server (MSSQL)** (Penyimpanan data relasional)
* **JSON Web Tokens (JWT)** (Keamanan & Autentikasi Rute)
* **Google Gemini AI API** (Untuk fitur parser cerita otomatis)

---

## 📁 Struktur Folder

```text
KongsiStok/
├── client/          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/  # Header, Auth, FeedItem, Logo, dll.
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── server/          # Backend (Node.js + Express)
    ├── server.js    # Entry point API
    ├── .env         # Konfigurasi rahasia (JWT, DB_CONN, GEMINI_KEY)
    └── KongsiStok.sql # Skema database SQL Server
```

## 💻 Cara Menjalankan secara Lokal

1. **Clone Repositori**
```bash
git clone [https://github.com/davidkhasbiya/KongsiStok.git](https://github.com/davidkhasbiya/KongsiStok.git)
cd KongsiStok
```

2. **Jalankan Backend (Server)**
```bash
cd server
npm install
node server.js
```

3. **Jalankan Frontend (Client)**
```bash
cd ../client
npm install
npm run dev
```