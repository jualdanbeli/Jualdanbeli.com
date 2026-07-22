import { useGetFeaturedProducts, useGetTrendingProducts, useGetCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/format";
import {
  ShieldCheck, Truck, Star, MapPin, Zap, Tag, Gift, Percent,
  ChevronRight, Heart, Clock, TrendingUp, Package, Award, Headphones,
  RefreshCcw, CreditCard, CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";

const CATEGORY_ICONS: Record<string, string> = {
  "Elektronik": "📱", "Fashion": "👗", "Rumah & Dapur": "🏠", "Olahraga": "⚽",
  "Kecantikan": "💄", "Otomotif": "🚗", "Buku": "📚", "Mainan": "🧸",
  "Makanan": "🍜", "Kesehatan": "💊", "Hobi": "🎮", "Furnitur": "🛋️",
};

function CountdownTimer() {
  const [time, setTime] = useState({ h: 5, m: 42, s: 17 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-1">
      {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="bg-gray-900 text-white font-mono font-bold text-sm px-1.5 py-0.5 rounded">{v}</span>
          {i < 2 && <span className="text-gray-900 font-bold text-sm">:</span>}
        </span>
      ))}
    </div>
  );
}

function ProductCard({ product, showDiscount = false }: { product: any; showDiscount?: boolean }) {
  const fakeDiscount = showDiscount ? Math.floor(Math.random() * 30 + 10) : 0;
  const originalPrice = showDiscount ? Math.round(parseFloat(product.price) * (1 + fakeDiscount / 100)) : 0;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-all group cursor-pointer border hover:border-primary/40">
        <div className="relative overflow-hidden bg-gray-50">
          <div className="aspect-square">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">🛍️</div>
            )}
          </div>
          {showDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              -{fakeDiscount}%
            </div>
          )}
          {product.condition === "used" && (
            <Badge variant="secondary" className="absolute top-2 right-2 text-[10px]">Bekas</Badge>
          )}
          <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-sm">
            <Heart className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-xs line-clamp-2 mb-1.5 text-gray-800 group-hover:text-primary transition-colors leading-tight min-h-[32px]">
            {product.name}
          </h3>
          <div className="font-bold text-sm text-primary mb-1">
            {formatIDR(product.price)}
          </div>
          {showDiscount && (
            <div className="text-[10px] text-gray-400 line-through mb-1">{formatIDR(originalPrice)}</div>
          )}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center text-[10px] text-gray-400 gap-0.5">
              <MapPin className="w-2.5 h-2.5" />
              <span className="truncate max-w-[60px]">{product.city || "Indonesia"}</span>
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-amber-500">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span className="font-medium">{product.averageRating?.toFixed(1) || "5.0"}</span>
              <span className="text-gray-400">({product.totalSold || 0})</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Home() {
  const { data: featured, isLoading: loadingFeatured } = useGetFeaturedProducts();
  const { data: trending, isLoading: loadingTrending } = useGetTrendingProducts();
  const { data: categories, isLoading: loadingCategories } = useGetCategories();

  return (
    <MainLayout>
      {/* ─── HERO + PROMO GRID ─── */}
      <section className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main hero banner */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-blue-500 to-indigo-600 p-8 min-h-[220px] flex flex-col justify-between shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
            <div className="relative z-10">
              <Badge className="bg-yellow-400 text-gray-900 font-bold mb-3 border-0 hover:bg-yellow-400">
                🔥 Promo Spesial Hari Ini
              </Badge>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
                Jual & Beli<br />Lebih Aman & Mudah
              </h1>
              <p className="text-white/80 text-sm mb-4">
                Dilindungi Rekening Bersama (Escrow) — 100% aman
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold border-0 shadow" asChild>
                  <Link href="/products">🛍️ Mulai Belanja</Link>
                </Button>
                <Button size="sm" variant="outline" className="border-white/50 text-white hover:bg-white/10 bg-transparent" asChild>
                  <Link href="/register">Buka Toko Gratis</Link>
                </Button>
              </div>
            </div>
            <div className="relative z-10 flex gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2">
                <ShieldCheck className="w-4 h-4 text-yellow-300" />
                <span className="text-white text-xs font-medium">Rekening Bersama</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2">
                <Truck className="w-4 h-4 text-yellow-300" />
                <span className="text-white text-xs font-medium">Gratis Ongkir</span>
              </div>
            </div>
          </div>

          {/* Side promo cards */}
          <div className="grid grid-cols-1 gap-4">
            <Link href="/products?sort=popular">
              <div className="rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 p-5 text-white cursor-pointer hover:opacity-90 transition-opacity shadow-md min-h-[100px] flex items-center gap-4">
                <span className="text-4xl">⚡</span>
                <div>
                  <div className="text-xs font-medium opacity-80">Penawaran Terbatas</div>
                  <div className="font-extrabold text-lg leading-tight">Flash Sale</div>
                  <div className="text-xs opacity-80 mt-0.5">Diskon hingga 70%</div>
                </div>
              </div>
            </Link>
            <Link href="/seller/register">
              <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white cursor-pointer hover:opacity-90 transition-opacity shadow-md min-h-[100px] flex items-center gap-4">
                <span className="text-4xl">🏪</span>
                <div>
                  <div className="text-xs font-medium opacity-80">Daftar Jadi Penjual</div>
                  <div className="font-extrabold text-lg leading-tight">Buka Toko</div>
                  <div className="text-xs opacity-80 mt-0.5">Gratis, mudah & cepat</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FITUR UNGGULAN ─── */}
      <section className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: ShieldCheck, label: "Rekening Bersama", desc: "Dana 100% aman", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
            { icon: Truck, label: "Gratis Ongkir", desc: "Min. belanja Rp 50rb", color: "text-green-600", bg: "bg-green-50 border-green-100" },
            { icon: RefreshCcw, label: "Garansi Retur", desc: "7 hari bebas retur", color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
            { icon: Headphones, label: "CS 24 Jam", desc: "Siap bantu kapanpun", color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
          ].map((f) => (
            <div key={f.label} className={`flex items-center gap-3 border rounded-xl p-3 ${f.bg}`}>
              <f.icon className={`w-5 h-5 shrink-0 ${f.color}`} />
              <div className="min-w-0">
                <p className="font-semibold text-xs text-gray-800">{f.label}</p>
                <p className="text-[10px] text-gray-500 truncate">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── KATEGORI ─── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-bold text-gray-900">Kategori Populer</h2>
          </div>
          <Link href="/categories" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            Semua <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loadingCategories ? (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {(categories ?? []).slice(0, 8).map((cat) => (
              <Link key={cat.id} href={`/products?categoryId=${cat.id}`}>
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border hover:border-primary hover:bg-blue-50/50 transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {CATEGORY_ICONS[cat.name] ?? "🛍️"}
                  </div>
                  <span className="text-[10px] font-medium text-gray-700 text-center leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ─── FLASH SALE ─── */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 text-white font-extrabold text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-current" /> FLASH SALE
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium">Berakhir dalam:</span>
                <CountdownTimer />
              </div>
            </div>
            <Link href="/products?sort=popular" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
              Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loadingTrending ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {(trending ?? []).slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} showDiscount />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── PROMO BANNER STRIP ─── */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/products">
          <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-5 text-white flex items-center gap-4 cursor-pointer hover:opacity-90 transition shadow-md">
            <span className="text-4xl shrink-0">🎁</span>
            <div>
              <p className="font-extrabold text-base">Voucher Cashback</p>
              <p className="text-xs opacity-80">Klaim sekarang, berlaku hari ini</p>
            </div>
          </div>
        </Link>
        <Link href="/products?condition=new">
          <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white flex items-center gap-4 cursor-pointer hover:opacity-90 transition shadow-md">
            <span className="text-4xl shrink-0">✨</span>
            <div>
              <p className="font-extrabold text-base">Produk Baru</p>
              <p className="text-xs opacity-80">Baru masuk hari ini</p>
            </div>
          </div>
        </Link>
        <Link href="/seller/register">
          <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 p-5 text-white flex items-center gap-4 cursor-pointer hover:opacity-90 transition shadow-md">
            <span className="text-4xl shrink-0">💰</span>
            <div>
              <p className="font-extrabold text-base">Jadi Penjual</p>
              <p className="text-xs opacity-80">Raih penghasilan lebih</p>
            </div>
          </div>
        </Link>
      </section>

      {/* ─── TRENDING / TERLARIS ─── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-red-500 rounded-full" />
            <h2 className="text-lg font-bold text-gray-900">🔥 Sedang Trending</h2>
          </div>
          <Link href="/products?sort=popular" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loadingTrending ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {(trending ?? []).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ─── KEPERCAYAAN PLATFORM ─── */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-primary/5 to-blue-50 border border-primary/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-center text-gray-900 mb-6">Mengapa Pilih jualdanbeli?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, label: "Rekening Bersama", desc: "Dana aman sampai barang tiba", color: "bg-blue-100 text-blue-600" },
              { icon: CheckCircle2, label: "Penjual Terverifikasi", desc: "Semua toko sudah diverifikasi", color: "bg-green-100 text-green-600" },
              { icon: Award, label: "Garansi Uang Kembali", desc: "Jika barang tidak sesuai", color: "bg-amber-100 text-amber-600" },
              { icon: CreditCard, label: "Banyak Cara Bayar", desc: "Transfer, e-wallet, kartu kredit", color: "bg-purple-100 text-purple-600" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REKOMENDASI PRODUK ─── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-bold text-gray-900">✨ Rekomendasi untuk Anda</h2>
          </div>
          <Link href="/products" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loadingFeatured ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {(featured ?? []).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ─── CTA BUKA TOKO ─── */}
      <section className="mb-8">
        <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Siap Berjualan Online?</h2>
            <p className="text-gray-400 text-sm">Buka toko gratis, jangkau jutaan pembeli seluruh Indonesia</p>
            <div className="flex flex-wrap gap-3 mt-4">
              {["✅ Gratis daftar", "📦 Manajemen mudah", "💳 Cairkan kapan saja"].map((t) => (
                <span key={t} className="text-xs text-gray-300 flex items-center gap-1">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold shadow-lg" asChild>
              <Link href="/seller/register">🏪 Buka Toko Sekarang</Link>
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white" asChild>
              <Link href="/about">Pelajari Lebih Lanjut</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
