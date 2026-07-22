import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Truck, Users, Star, Globe, Lock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-r from-primary to-blue-400 text-white p-10 mb-12 text-center">
        <h1 className="text-4xl font-extrabold mb-4">Tentang jualdanbeli</h1>
        <p className="text-white/90 text-lg max-w-2xl mx-auto leading-relaxed">
          Platform marketplace terpercaya Indonesia yang menghubungkan jutaan pembeli dan penjual 
          dengan sistem escrow aman, pengiriman nasional, dan proteksi penuh setiap transaksi.
        </p>
      </section>

      {/* Mission */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Misi Kami</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: "Keamanan Transaksi", desc: "Sistem Rekening Bersama (escrow) memastikan dana Pembeli aman hingga barang diterima dengan baik." },
            { icon: Users, title: "Komunitas Terpercaya", desc: "Membangun ekosistem jual beli yang transparan dengan verifikasi penjual dan sistem ulasan yang jujur." },
            { icon: Globe, title: "Jangkauan Nasional", desc: "Melayani seluruh wilayah Indonesia dengan jaringan kurir terpercaya dan pengiriman ke seluruh penjuru negeri." },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="text-center">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mb-12 bg-muted/30 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-8 text-center">jualdanbeli dalam Angka</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "2Jt+", label: "Pengguna Terdaftar" },
            { value: "500rb+", label: "Produk Aktif" },
            { value: "50rb+", label: "Penjual Terverifikasi" },
            { value: "99.8%", label: "Transaksi Berhasil" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold text-primary mb-1">{value}</div>
              <div className="text-muted-foreground text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Keunggulan */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Mengapa Memilih jualdanbeli?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: ShieldCheck, title: "Rekening Bersama Gratis", desc: "Dana otomatis tertahan dan hanya dikirim ke penjual setelah Anda konfirmasi penerimaan barang." },
            { icon: Truck, title: "Multi-Kurir Terintegrasi", desc: "Pilihan pengiriman JNE, J&T, SiCepat, Anteraja, dan Ninja Express dengan tracking real-time." },
            { icon: Star, title: "Sistem Ulasan Terverifikasi", desc: "Ulasan hanya bisa ditulis oleh pembeli yang telah benar-benar membeli produk tersebut." },
            { icon: Lock, title: "Keamanan Data Terjamin", desc: "Data pribadi dilindungi sesuai UU PDP Indonesia dengan enkripsi standar industri." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-4 border rounded-xl bg-white">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Legal Info */}
      <section className="mb-12 border rounded-2xl p-8 bg-white">
        <h2 className="text-2xl font-bold mb-4">Informasi Perusahaan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
          <div className="space-y-2">
            <div><strong className="text-foreground">Nama Usaha:</strong> jualdanbeli</div>
            <div><strong className="text-foreground">Bentuk Usaha:</strong> Usaha Perseorangan</div>
            <div>
              <strong className="text-foreground">NIB:</strong>{" "}
              <span className="font-mono font-semibold text-foreground bg-muted px-2 py-0.5 rounded">2403240017145</span>
            </div>
            <div><strong className="text-foreground">Kode KBLI:</strong> 47911 — Perdagangan Melalui Internet</div>
            <div><strong className="text-foreground">Bidang Usaha:</strong> Perdagangan Melalui Sistem Elektronik (PMSE)</div>
          </div>
          <div className="space-y-2">
            <div><strong className="text-foreground">Legalitas:</strong> Terdaftar di OSS (oss.go.id)</div>
            <div><strong className="text-foreground">Pajak:</strong> PPh Final UMKM 0,5% (PP No. 23/2018)</div>
            <div><strong className="text-foreground">Email:</strong> admin@jualdanbeli.com</div>
            <div><strong className="text-foreground">Layanan Pelanggan:</strong> cs@jualdanbeli.com</div>
            <div><strong className="text-foreground">Jam Operasional:</strong> Senin–Jumat, 08.00–17.00 WIB</div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-sm text-green-800">
            jualdanbeli adalah platform marketplace resmi yang terdaftar dan berizin di Indonesia melalui sistem <strong>OSS (Online Single Submission)</strong> Kementerian Investasi/BKPM.
            NIB <span className="font-mono font-semibold">2403240017145</span> dapat diverifikasi langsung di <a href="https://oss.go.id" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">oss.go.id</a>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-8">
        <h2 className="text-2xl font-bold mb-3">Siap Memulai?</h2>
        <p className="text-muted-foreground mb-6">Bergabunglah dengan jutaan pengguna yang sudah mempercayakan transaksi mereka kepada jualdanbeli.</p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild><Link href="/register">Daftar Sekarang</Link></Button>
          <Button size="lg" variant="outline" asChild><Link href="/products">Mulai Belanja</Link></Button>
        </div>
      </section>
    </MainLayout>
  );
}
