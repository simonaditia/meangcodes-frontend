# Frontend Setup (React + Tailwind)

## Konfigurasi env

1. Salin `.env.example` menjadi `.env`.
2. Pastikan `VITE_API_BASE_URL` mengarah ke backend API.

## Dependensi yang dibutuhkan

Proyek ini menggunakan:
- `react-router-dom` untuk routing halaman Home dan Detail.

Jika belum ada dependency manager/project bootstrap, buat project React (misal Vite) lalu salin folder `src` ini.

## Halaman yang sudah disiapkan

- Homepage: menampilkan artikel terbaru dan panel trending dari `GET /api/articles`.
- Detail artikel: menampilkan artikel per slug dari `GET /api/articles/:slug` dengan sidebar penulis dan kategori.

## Login admin

- Akses `/login` untuk login admin (token JWT dari backend).
- Aksi tulis/edit/hapus artikel serta upload file memerlukan role `admin` dari server.
