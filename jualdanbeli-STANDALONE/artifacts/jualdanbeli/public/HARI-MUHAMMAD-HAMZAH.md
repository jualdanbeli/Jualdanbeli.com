# Cara Setup jualdanbeli di Replit Baru

## Langkah 1 — Buat Replit Baru
1. Buka replit.com → klik **+ Create Repl**
2. Pilih template: **Node.js** (atau Import from GitHub jika punya)
3. Beri nama: `jualdanbeli`

## Langkah 2 — Upload File
1. Di Replit baru, klik ikon folder di sidebar kiri
2. Klik titik tiga (⋯) → **Upload folder** atau **Upload files**
3. Upload file `jualdanbeli-FULL.zip`
4. Extract ZIP: buka Shell Replit, ketik:
   ```bash
   unzip jualdanbeli-FULL.zip -d .
   ```

## Langkah 3 — Install Dependencies
Di Shell Replit:
```bash
npm install -g pnpm
pnpm install
```

## Langkah 4 — Setup Database
1. Di Replit baru, buka tab **Database** (sidebar kiri) → aktifkan PostgreSQL
2. Copy `DATABASE_URL` yang diberikan Replit
3. Buka tab **Secrets** → tambah:
   - `DATABASE_URL` = (paste URL dari langkah di atas)
   - `SESSION_SECRET` = (isi random string, misal: `rahasia-jualdanbeli-2024`)
   - `MIDTRANS_CLIENT_KEY` = (dari dashboard Midtrans)
   - `MIDTRANS_SERVER_KEY` = (dari dashboard Midtrans)
   - `RAJAONGKIR_API_KEY` = (dari RajaOngkir)
   - `RESEND_API_KEY` = (dari Resend.com, untuk email)

4. Push schema database:
   ```bash
   pnpm --filter @workspace/db run push
   ```

## Langkah 5 — Jalankan Aplikasi
File `.replit` sudah termasuk dalam ZIP dan akan otomatis dikonfigurasi.
Klik tombol **Run** di Replit, atau jalankan manual:

**Terminal 1 (API):**
```bash
pnpm --filter @workspace/api-server run dev
```

**Terminal 2 (Web):**
```bash
pnpm --filter @workspace/jualdanbeli run dev
```

## Akun Demo (sudah ada di seed)
| Role  | Email                        | Password    |
|-------|------------------------------|-------------|
| Admin | radjapamungkas007@gmail.com  | Admin123!   |
| Seller| seller1@jualdanbeli.com      | Seller123!  |
| Buyer | buyer@jualdanbeli.com        | Buyer123!   |

## Troubleshooting

**Error: Cannot find module**
```bash
pnpm install
pnpm run typecheck:libs
```

**Error: Database connection**
- Pastikan `DATABASE_URL` sudah diset di Secrets
- Jalankan: `pnpm --filter @workspace/db run push`

**Port tidak bisa diakses**
- Pastikan API server jalan di port 8080
- Web frontend jalan di port yang diberikan variabel `PORT`
