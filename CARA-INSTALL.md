# Cara Install jualdanbeli — Standalone (Tanpa Replit)

Aplikasi ini bisa jalan di **komputer Windows/Mac/Linux** atau **VPS/server** mana pun
menggunakan Docker. Tidak perlu Replit sama sekali.

---

## Syarat

| Software | Versi minimum | Download |
|----------|--------------|---------|
| Docker Desktop | 24+ | https://docker.com/get-started |
| Docker Compose | sudah termasuk Docker Desktop | — |

> Untuk Windows: install **Docker Desktop**, sudah include semua yang dibutuhkan.
> Untuk Linux/VPS: install `docker` + `docker-compose-plugin`.

---

## Langkah 1 — Extract File

Extract ZIP ini ke folder mana saja, misalnya `C:\jualdanbeli` (Windows) atau `~/jualdanbeli` (Mac/Linux).

---

## Langkah 2 — Buat File .env

Di folder hasil extract, duplikat file `.env.example` menjadi `.env`:

**Windows (Command Prompt):**
```
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

Buka file `.env` dengan Notepad/text editor, isi bagian ini:

```env
# WAJIB diisi:
SESSION_SECRET=isi-dengan-kata-acak-panjang-bebas-apasaja

# Midtrans (payment) — daftar gratis di midtrans.com
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxx
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxx
MIDTRANS_IS_PRODUCTION=false

# RajaOngkir (ongkir) — daftar gratis di rajaongkir.com
RAJAONGKIR_API_KEY=xxxxxxxxxxxxxxxx

# Email (opsional) — daftar gratis di resend.com
RESEND_API_KEY=re_xxxxxxxx

# URL aplikasi Anda (ganti jika pakai domain)
APP_URL=http://localhost

# Password database (bebas, asal konsisten)
DB_PASSWORD=password-database-anda
```

---

## Langkah 3 — Jalankan Aplikasi

Buka **Terminal** (Mac/Linux) atau **Command Prompt/PowerShell** (Windows), masuk ke folder:

```bash
cd /lokasi/folder/jualdanbeli
```

Jalankan semua layanan sekaligus:

```bash
docker compose up --build -d
```

> Proses pertama kali akan download dependencies (~5-10 menit tergantung internet).
> Jalankan berikutnya hanya butuh ~30 detik.

---

## Langkah 4 — Buka Aplikasi

Setelah selesai, buka browser:

| Halaman | URL |
|---------|-----|
| Toko (buyer) | http://localhost |
| Admin panel | http://localhost/admin |
| API | http://localhost:8080/api/healthz |

---

## Akun Demo

| Role   | Email                       | Password   |
|--------|-----------------------------|------------|
| Admin  | radjapamungkas007@gmail.com | Admin123!  |
| Seller | seller1@jualdanbeli.com     | Seller123! |
| Buyer  | buyer@jualdanbeli.com       | Buyer123!  |

---

## Perintah Berguna

```bash
# Lihat status layanan
docker compose ps

# Lihat log API
docker compose logs api -f

# Hentikan semua layanan
docker compose down

# Hapus semua data (reset total)
docker compose down -v

# Update setelah ada perubahan kode
docker compose up --build -d
```

---

## Deploy ke VPS / Server (opsional)

1. Upload seluruh folder ke VPS via FileZilla/SCP
2. Install Docker di VPS: `curl -fsSL https://get.docker.com | sh`
3. Jalankan: `docker compose up --build -d`
4. Arahkan domain Anda ke IP VPS

Untuk HTTPS/SSL, lihat file `DEPLOYMENT.md` untuk panduan lengkap dengan Nginx + Let's Encrypt.

---

## Troubleshooting

**Port 80 sudah dipakai:**
Edit `docker-compose.yml`, ganti `"80:80"` jadi misalnya `"8081:80"`, lalu akses di `http://localhost:8081`

**Database error:**
```bash
docker compose down -v
docker compose up --build -d
```

**Build gagal:**
Pastikan Docker Desktop sudah berjalan, lalu coba lagi.
