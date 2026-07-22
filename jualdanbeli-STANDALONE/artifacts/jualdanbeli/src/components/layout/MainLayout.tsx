import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Link } from "wouter";
import { JDBLogo } from "@/components/JDBLogo";
import { ShieldCheck, Truck, HeadphonesIcon, CreditCard, Clock, Shield, AlertCircle } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* 24/7 Service Status Bar */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              Layanan Aktif 24/7
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Escrow Aktif
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Shield className="w-3 h-3" /> Asuransi Pengiriman
            </span>
            <span className="hidden md:flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Perlindungan Kurir Nakal
            </span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/shipping-protection" className="flex items-center gap-1 hover:underline opacity-90 hover:opacity-100">
              <ShieldCheck className="w-3 h-3" />
              <span className="hidden sm:inline">Garansi Pengiriman</span>
            </Link>
            <Link href="/support" className="flex items-center gap-1 hover:underline opacity-90 hover:opacity-100">
              <HeadphonesIcon className="w-3 h-3" />
              <span className="hidden sm:inline">Bantuan CS</span>
            </Link>
          </div>
        </div>
      </div>

      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 bg-gray-900 rounded-xl px-3 py-2 w-fit">
              <JDBLogo size="sm" variant="full" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Marketplace terpercaya Indonesia. Transaksi aman, cepat, dan terlindungi sistem Rekening Bersama dengan asuransi pengiriman.
            </p>
            <p className="text-xs text-muted-foreground">
              jualdanbeli — Usaha Perseorangan<br />
              NIB: <span className="font-mono font-medium text-foreground">2403240017145</span><br />
              KBLI 47911 — Perdagangan Melalui Internet
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Jual & Beli</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary transition-colors">Semua Produk</Link></li>
              <li><Link href="/categories" className="hover:text-primary transition-colors">Kategori</Link></li>
              <li><Link href="/seller/register" className="hover:text-primary transition-colors">Daftar Jadi Penjual</Link></li>
              <li><Link href="/cart" className="hover:text-primary transition-colors">Keranjang Belanja</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Bantuan & Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/support" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  CS Online 24/7
                </Link>
              </li>
              <li><Link href="/shipping-protection" className="hover:text-primary transition-colors">Garansi Pengiriman</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Tentang Kami</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
              <li><a href="mailto:cs@jualdanbeli.com" className="hover:text-primary transition-colors">cs@jualdanbeli.com</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Keunggulan Kami</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg text-center">
                <ShieldCheck className="w-5 h-5 text-primary mb-1" />
                <span className="text-[10px] font-medium">Rekening Bersama</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg text-center">
                <Truck className="w-5 h-5 text-primary mb-1" />
                <span className="text-[10px] font-medium">Multi Kurir</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg text-center">
                <HeadphonesIcon className="w-5 h-5 text-blue-500 mb-1" />
                <span className="text-[10px] font-medium">CS 24/7</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg text-center">
                <Shield className="w-5 h-5 text-green-500 mb-1" />
                <span className="text-[10px] font-medium">Asuransi Kurir</span>
              </div>
            </div>
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              <span className="text-[10px] text-green-700 font-medium">Layanan aktif 24 jam / 7 hari seminggu</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <span>© {new Date().getFullYear()} <strong>jualdanbeli™</strong> · NIB <span className="font-mono">2403240017145</span> · Terdaftar di OSS Indonesia</span>
            <span className="text-[10px] text-muted-foreground/60">J&amp;B™ dan jualdanbeli™ adalah merek dagang milik eksklusif <strong>Hari Muhammad Hamzah</strong>. Seluruh hak cipta dilindungi undang-undang.</span>
          </div>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
            <Link href="/shipping-protection" className="hover:text-primary transition-colors">Garansi Pengiriman</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
