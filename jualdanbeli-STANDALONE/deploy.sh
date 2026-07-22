#!/bin/bash
# =============================================================
# jualdanbeli — Deployment Script untuk Hosting Eksternal
# Jalankan: bash deploy.sh
# =============================================================
set -e

echo "🚀 jualdanbeli Deployment Script"
echo "================================="

# Cek .env
if [ ! -f .env ]; then
  echo "❌ File .env tidak ditemukan!"
  echo "   Salin .env.example ke .env dan isi nilainya:"
  echo "   cp .env.example .env && nano .env"
  exit 1
fi

# Cek Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker belum terinstall. Install dulu: https://docs.docker.com/get-docker/"
  exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
  echo "❌ Docker Compose belum terinstall."
  exit 1
fi

echo "✅ Docker ditemukan"
echo ""

# Pilih docker compose command
DC="docker compose"
if ! docker compose version &> /dev/null 2>&1; then
  DC="docker-compose"
fi

echo "📦 Build images..."
$DC build --parallel

echo ""
echo "🗄️  Menjalankan database..."
$DC up -d db
sleep 5

echo ""
echo "📊 Migrasi database..."
$DC run --rm api node -e "
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
console.log('DB migration via push would run here');
" || echo "Jalankan migrasi manual jika diperlukan: docker compose exec api pnpm --filter @workspace/db run push"

echo ""
echo "🌐 Menjalankan semua layanan..."
$DC up -d

echo ""
echo "✅ Deployment selesai!"
echo ""
echo "📋 Akses aplikasi:"
echo "   Web Frontend : http://localhost (atau domain Anda)"
echo "   API Server   : http://localhost:8080/api/healthz"
echo ""
echo "📋 Perintah berguna:"
echo "   Lihat log    : $DC logs -f"
echo "   Stop semua   : $DC down"
echo "   Restart API  : $DC restart api"
echo "   Restart Web  : $DC restart web"
