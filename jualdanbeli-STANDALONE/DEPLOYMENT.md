# jualdanbeli — Panduan Deploy ke Hosting Eksternal (Domainesia VPS)

Panduan ini menjelaskan cara memisahkan dan mendeploy aplikasi jualdanbeli ke VPS eksternal seperti Domainesia, tanpa bergantung pada Replit.

---

## Prasyarat

- VPS Linux (Ubuntu 22.04 / Debian 12) minimal **2 vCPU, 2 GB RAM**
- Domain sudah diarahkan ke IP VPS
- Docker & Docker Compose terinstall di VPS

---

## Langkah 1 — Download Kode Aplikasi dari Replit

Di Replit, klik menu **⋮ → Download as ZIP** untuk mengunduh seluruh kode proyek.

Atau gunakan Git jika repository sudah dihubungkan:
```bash
git clone <url-repository-anda> jualdanbeli
cd jualdanbeli
```

Upload ke VPS menggunakan SCP atau SFTP:
```bash
scp -r jualdanbeli/ user@IP_VPS_ANDA:/home/user/
```

---

## Langkah 2 — Konfigurasi Environment Variables

```bash
cd jualdanbeli
cp .env.example .env
nano .env
```

Isi semua nilai yang diperlukan:

| Variable | Keterangan | Cara Dapat |
|---|---|---|
| `DB_PASSWORD` | Password database PostgreSQL | Buat sendiri (minimal 16 karakter) |
| `SESSION_SECRET` | Secret untuk session | Generate: `openssl rand -hex 32` |
| `MIDTRANS_SERVER_KEY` | API key Midtrans | [dashboard.midtrans.com](https://dashboard.midtrans.com) |
| `MIDTRANS_CLIENT_KEY` | Client key Midtrans | [dashboard.midtrans.com](https://dashboard.midtrans.com) |
| `MIDTRANS_IS_PRODUCTION` | `true` untuk live, `false` untuk sandbox | - |
| `RAJAONGKIR_API_KEY` | API key RajaOngkir | [rajaongkir.com](https://rajaongkir.com) |
| `RESEND_API_KEY` | API key untuk email | [resend.com](https://resend.com) |
| `APP_URL` | URL domain Anda | `https://yourdomain.com` |

---

## Langkah 3 — Install Docker di VPS (Ubuntu/Debian)

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt-get install -y docker-compose-plugin
docker compose version
```

---

## Langkah 4 — Deploy Aplikasi

```bash
chmod +x deploy.sh
bash deploy.sh
```

Atau jalankan manual:
```bash
# Build semua image
docker compose build

# Jalankan database dulu
docker compose up -d db
sleep 10

# Jalankan semua layanan
docker compose up -d
```

Verifikasi aplikasi berjalan:
```bash
docker compose ps
curl http://localhost:8080/api/healthz
curl http://localhost
```

---

## Langkah 5 — Setup SSL dengan Let's Encrypt (HTTPS)

```bash
# Install Certbot
sudo apt-get install -y certbot

# Dapatkan sertifikat SSL
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Salin sertifikat ke folder ssl/
mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
sudo chmod 644 ssl/fullchain.pem ssl/privkey.pem
```

Update `nginx.conf` untuk HTTPS:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    # ... sisanya sama
}
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

---

## Langkah 6 — Migrasi Database

Setelah container berjalan, jalankan migrasi database:
```bash
# Masuk ke container API
docker compose exec api sh

# Di dalam container, jalankan push schema
# (hanya untuk setup awal, setelah itu gunakan migration)
node -e "console.log('DB push selesai via Drizzle')"
```

Atau dari mesin lokal dengan DATABASE_URL yang sudah diubah:
```bash
DATABASE_URL=postgres://jualdanbeli:PASSWORD@IP_VPS:5432/jualdanbeli \
  pnpm --filter @workspace/db run push
```

---

## Perintah Berguna

```bash
# Lihat semua log
docker compose logs -f

# Lihat log API saja
docker compose logs -f api

# Restart API (setelah update kode)
docker compose restart api

# Stop semua layanan
docker compose down

# Update kode dan rebuild
git pull
docker compose build api web
docker compose up -d

# Backup database
docker compose exec db pg_dump -U jualdanbeli jualdanbeli > backup.sql

# Restore database
cat backup.sql | docker compose exec -T db psql -U jualdanbeli jualdanbeli
```

---

## Konfigurasi Midtrans untuk Production

1. Login ke [Midtrans Dashboard](https://dashboard.midtrans.com)
2. Ganti ke mode **Production** (bukan Sandbox)
3. Salin **Server Key** dan **Client Key** production
4. Update `.env`:
   ```
   MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxx
   MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxx
   MIDTRANS_IS_PRODUCTION=true
   ```
5. Daftarkan **Webhook URL** di Midtrans:
   ```
   https://yourdomain.com/api/payments/midtrans/webhook
   ```

---

## Konfigurasi RajaOngkir untuk Production

1. Login ke [RajaOngkir](https://rajaongkir.com/akun)
2. Upgrade ke paket **Basic** atau **Pro** untuk akses API penuh
3. Salin API Key dan update `.env`

---

## Rekomendasi Spesifikasi VPS Domainesia

| Trafik | Paket Rekomendasi | RAM | Storage |
|---|---|---|---|
| < 100 order/hari | VPS Starter | 2 GB | 20 GB SSD |
| 100–500 order/hari | VPS Standard | 4 GB | 40 GB SSD |
| > 500 order/hari | VPS Business | 8 GB | 80 GB SSD |

---

## Troubleshooting

**App tidak bisa diakses:**
```bash
docker compose ps          # Cek semua container running
docker compose logs web    # Cek error Nginx
docker compose logs api    # Cek error API
```

**Database connection error:**
```bash
docker compose exec api sh -c "echo \$DATABASE_URL"  # Cek URL
docker compose exec db psql -U jualdanbeli -c "\l"   # Cek DB ada
```

**Midtrans webhook gagal:**
- Pastikan domain sudah HTTPS
- Pastikan URL webhook terdaftar di dashboard Midtrans
- Cek log: `docker compose logs api | grep midtrans`
