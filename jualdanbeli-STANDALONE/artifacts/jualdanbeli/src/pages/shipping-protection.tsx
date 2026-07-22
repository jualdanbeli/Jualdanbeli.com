import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ShieldCheck, Truck, AlertTriangle, CheckCircle2, Clock, Phone,
  FileText, RefreshCw, Star, Users, ArrowRight, Package
} from "lucide-react";

const COURIERS = [
  { name: "JNE", logo: "🚚", phone: "021-2927-8888", hotline: "08001 937 888" },
  { name: "J&T Express", logo: "🚛", phone: "021-8066-1888", hotline: "021-8066-1888" },
  { name: "SiCepat", logo: "⚡", phone: "1512", hotline: "1512" },
  { name: "AnterAja", logo: "🏎️", phone: "1500-0-222", hotline: "1500-0-222" },
  { name: "TIKI", logo: "📦", phone: "1500-125", hotline: "1500-125" },
  { name: "Pos Indonesia", logo: "🏣", phone: "1500-161", hotline: "1500-161" },
];

const PROTECTIONS = [
  {
    icon: ShieldCheck,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Rekening Bersama (Escrow)",
    desc: "Dana pembeli ditahan aman oleh jualdanbeli hingga barang dikonfirmasi diterima. Penjual tidak bisa mengakses dana sebelum pembeli puas.",
  },
  {
    icon: Truck,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Garansi Paket Tidak Sampai",
    desc: "Jika paket tidak tiba dalam 14 hari sejak pengiriman dikonfirmasi, pembeli berhak mengajukan laporan dan mendapat pengembalian dana penuh.",
  },
  {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Perlindungan dari Oknum Kurir",
    desc: "Setiap laporan oknum kurir (pencurian, penipuan, pemerasan) akan langsung dieskalasi ke manajemen perusahaan kurir terkait dan ditindaklanjuti.",
  },
  {
    icon: RefreshCw,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "Pengembalian Dana Otomatis",
    desc: "Jika sengketa diputuskan mendukung pembeli oleh admin, pengembalian dana diproses dalam 1–3 hari kerja ke dompet atau rekening asal.",
  },
];

const INSURANCE_CASES = [
  { case: "Kurir Nakal / Pencurian", cov: "100% nilai barang", process: "Otomatis ke operator kurir", icon: "🚨" },
  { case: "Paket Hilang (> 14 hari)", cov: "100% nilai barang", process: "Otomatis ke operator kurir", icon: "🔍" },
  { case: "Paket Rusak Saat Tiba", cov: "Sesuai kerusakan", process: "Diajukan ke kurir", icon: "💔" },
  { case: "Paket Tidak Sampai (< 14 hari)", cov: "Refund penuh (escrow)", process: "Internal jualdanbeli", icon: "📦" },
];

const STEPS = [
  { step: "1", title: "Laporkan Masalah", desc: "Buka pesanan dan klik 'Laporkan Masalah Pengiriman'. Isi form dengan jenis masalah, kurir, dan nomor resi.", icon: FileText },
  { step: "2", title: "Verifikasi Admin (1×24 jam)", desc: "Tim admin jualdanbeli memverifikasi laporan dan menghubungi perusahaan kurir untuk klarifikasi.", icon: Clock },
  { step: "3", title: "Eskalasi ke Kurir", desc: "Kurir diwajibkan memberikan tanggapan dalam 3 hari kerja. jualdanbeli memantau dan mendampingi proses ini.", icon: Phone },
  { step: "4", title: "Keputusan & Pengembalian", desc: "Admin memutuskan hasil sengketa berdasarkan bukti. Dana dikembalikan ke pembeli atau dilepas ke penjual.", icon: CheckCircle2 },
];

export default function ShippingProtection() {
  return (
    <MainLayout>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 mb-10">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-6 h-6" />
            <Badge className="bg-white/20 text-white border-0 hover:bg-white/20">Perlindungan Resmi jualdanbeli</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-3">Garansi Pengiriman jualdanbeli</h1>
          <p className="text-blue-100 leading-relaxed text-lg">
            Setiap transaksi dilindungi sistem escrow dan perjanjian resmi kami dengan operator kurir pihak ketiga.
            Paket tidak sampai? Kurir nakal? Kami siap bantu.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Dana terlindungi escrow
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Garansi 14 hari
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Eskalasi langsung ke kurir
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-48 flex items-center justify-center opacity-10">
          <ShieldCheck className="w-48 h-48" />
        </div>
      </div>

      {/* 4 Protection pillars */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-2">Apa yang Kami Jamin</h2>
        <p className="text-muted-foreground mb-6">Empat lapis perlindungan untuk setiap transaksi di jualdanbeli</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROTECTIONS.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.title} className="border-0 shadow-sm">
                <CardContent className="p-5 flex gap-4">
                  <div className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${p.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Process steps */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-2">Cara Klaim Perlindungan</h2>
        <p className="text-muted-foreground mb-6">Proses sederhana, transparan, dan terselesaikan dalam 3–5 hari kerja</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative">
                <Card className="border-0 shadow-sm h-full">
                  <CardContent className="p-5">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mb-4">
                      {s.step}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-sm">{s.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* 24/7 Service */}
      <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <Clock className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold mb-1">Layanan 24 Jam / 7 Hari</h2>
            <p className="text-muted-foreground leading-relaxed">
              jualdanbeli beroperasi nonstop setiap hari — tidak ada hari libur. Tim admin dan CS kami siap membantu
              laporan pengiriman, sengketa, dan klaim asuransi kapan pun Anda butuhkan.
            </p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">24</p>
              <p className="text-xs text-muted-foreground">jam/hari</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">7</p>
              <p className="text-xs text-muted-foreground">hari/minggu</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">365</p>
              <p className="text-xs text-muted-foreground">hari/tahun</p>
            </div>
          </div>
        </div>
      </div>

      {/* Insurance Program */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-2">Program Asuransi Pengiriman</h2>
        <p className="text-muted-foreground mb-6">
          Untuk kasus tertentu (kurir nakal, paket hilang, paket rusak), jualdanbeli <strong>secara otomatis mengajukan
          klaim asuransi</strong> kepada operator kurir atas nama pembeli. Anda tidak perlu urus sendiri.
        </p>
        <div className="overflow-hidden rounded-xl border mb-4">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold">Kasus</th>
                <th className="text-left p-4 font-semibold">Cakupan Asuransi</th>
                <th className="text-left p-4 font-semibold">Proses Klaim</th>
              </tr>
            </thead>
            <tbody>
              {INSURANCE_CASES.map((c) => (
                <tr key={c.case} className="border-t">
                  <td className="p-4 flex items-center gap-2">
                    <span>{c.icon}</span>
                    <span className="text-muted-foreground">{c.case}</span>
                  </td>
                  <td className="p-4 text-green-700 font-medium">{c.cov}</td>
                  <td className="p-4 text-muted-foreground">{c.process}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          <p className="font-semibold mb-1">ℹ️ Cara Kerja Klaim Asuransi Otomatis</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Anda melaporkan masalah melalui halaman pesanan (pilih jenis: kurir nakal / paket hilang / paket rusak)</li>
            <li>Sistem <strong>otomatis membuat nomor klaim asuransi (JDB-INS-xxxxx)</strong> dan mengirimkannya ke operator kurir</li>
            <li>Operator kurir wajib merespons dalam <strong>3–5 hari kerja</strong></li>
            <li>Jika disetujui, dana asuransi masuk ke dompet jualdanbeli Anda</li>
            <li>Jika ditolak kurir, admin jualdanbeli meninjau ulang dan dapat memberikan kompensasi langsung</li>
          </ol>
        </div>
      </div>

      {/* Courier agreements */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-2">Perjanjian dengan Operator Kurir</h2>
        <p className="text-muted-foreground mb-6">
          jualdanbeli memiliki perjanjian resmi dengan operator kurir berikut. Setiap laporan oknum kurir akan
          disampaikan langsung ke tim manajemen kurir dan ditindaklanjuti sesuai SLA.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {COURIERS.map((c) => (
            <Card key={c.name} className="border shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-3xl">{c.logo}</span>
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">Hotline: {c.hotline}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <p className="font-semibold mb-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Kasus Oknum Kurir</p>
          <p>Apabila terjadi tindakan tidak terpuji seperti pencurian isi paket, pemalsuan tanda terima, pemerasan, atau pelecehan — jualdanbeli wajib melaporkan ke manajemen kurir dan instansi berwenang jika diperlukan. Dana pembeli sepenuhnya dilindungi selama proses investigasi.</p>
        </div>
      </div>

      {/* SLA table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Ketentuan & SLA</h2>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold">Jenis Kasus</th>
                <th className="text-left p-4 font-semibold">SLA Penyelesaian</th>
                <th className="text-left p-4 font-semibold">Hasil Maksimal</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Paket tidak sampai (< 14 hari)", "3 hari kerja", "Refund penuh"],
                ["Paket hilang (> 14 hari)", "5 hari kerja", "Refund penuh + kompensasi"],
                ["Paket rusak saat tiba", "2 hari kerja", "Refund parsial / penuh"],
                ["Oknum kurir (pencurian, dll)", "5 hari kerja", "Refund penuh + eskalasi pidana"],
                ["Barang tidak sesuai deskripsi", "3 hari kerja", "Refund / retur ke penjual"],
                ["Sengketa umum", "5 hari kerja", "Sesuai putusan admin"],
              ].map(([kasus, sla, hasil]) => (
                <tr key={kasus} className="border-t">
                  <td className="p-4 text-muted-foreground">{kasus}</td>
                  <td className="p-4">
                    <Badge variant="outline" className="font-medium">{sla}</Badge>
                  </td>
                  <td className="p-4 text-green-700 font-medium">{hasil}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: "98.7%", label: "Tingkat Penyelesaian", icon: Star },
          { value: "< 3 hari", label: "Rata-rata Penyelesaian", icon: Clock },
          { value: "100%", label: "Dana Terlindungi", icon: ShieldCheck },
          { value: "10.000+", label: "Pembeli Dibantu", icon: Users },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-0 shadow-sm text-center">
              <CardContent className="p-5">
                <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-8 text-center mb-8">
        <Package className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-2">Ada masalah dengan pengiriman?</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Buka pesanan Anda dan gunakan tombol "Laporkan Masalah Pengiriman" — tim kami siap membantu 24/7.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/orders">
              <Package className="w-4 h-4 mr-2" />Lihat Pesanan Saya
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/support">
              <ArrowRight className="w-4 h-4 mr-2" />Hubungi CS jualdanbeli
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
