import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Upload, FileText, User, Building, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function SellerKYC() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    nik: "",
    birthDate: "",
    address: "",
    shopName: "",
    shopDescription: "",
    shopCategory: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    ktpFile: null as File | null,
    selfieFile: null as File | null,
  });

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Login Diperlukan</h2>
          <p className="text-muted-foreground mb-4">Anda harus login untuk mendaftar sebagai penjual.</p>
          <Button onClick={() => setLocation("/login")}>Login Sekarang</Button>
        </div>
      </MainLayout>
    );
  }

  if (user?.role === "seller") {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <Badge className="bg-green-500 mb-4">Terverifikasi</Badge>
          <h2 className="text-2xl font-bold mb-2">Akun Penjual Anda Sudah Terverifikasi</h2>
          <p className="text-muted-foreground mb-6">Anda sudah dapat berjualan di jualdanbeli.</p>
          <Button onClick={() => setLocation("/seller/dashboard")}>Ke Dashboard Penjual</Button>
        </div>
      </MainLayout>
    );
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    toast({
      title: "Pendaftaran Penjual Dikirim!",
      description: "Tim kami akan memverifikasi data Anda dalam 1-3 hari kerja.",
    });
    setStep(4);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Daftar sebagai Penjual</h1>
          <p className="text-muted-foreground">Verifikasi identitas diperlukan untuk melindungi komunitas jualdanbeli</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[
            { n: 1, label: "Identitas" },
            { n: 2, label: "Toko" },
            { n: 3, label: "Rekening" },
          ].map(({ n, label }, i) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${step > n ? "bg-green-500 text-white" : step === n ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                {step > n ? "✓" : n}
              </div>
              <span className={`text-sm ${step === n ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{label}</span>
              {i < 2 && <div className={`flex-1 h-0.5 ${step > n ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Verifikasi Identitas</CardTitle>
              <CardDescription>Data ini sesuai dengan KTP Anda dan digunakan untuk verifikasi satu kali</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Lengkap (sesuai KTP)</Label>
                <Input placeholder="Nama sesuai KTP" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Nomor Induk Kependudukan (NIK)</Label>
                <Input placeholder="16 digit NIK" maxLength={16} value={form.nik} onChange={e => setForm(f => ({ ...f, nik: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Lahir</Label>
                <Input type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Alamat sesuai KTP</Label>
                <Input placeholder="Alamat lengkap" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Foto KTP</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Upload foto KTP</p>
                    <Input type="file" accept="image/*" className="hidden" onChange={e => setForm(f => ({ ...f, ktpFile: e.target.files?.[0] || null }))} />
                  </div>
                  {form.ktpFile && <p className="text-xs text-green-600">✓ {form.ktpFile.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Selfie + KTP</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Selfie pegang KTP</p>
                    <Input type="file" accept="image/*" className="hidden" onChange={e => setForm(f => ({ ...f, selfieFile: e.target.files?.[0] || null }))} />
                  </div>
                  {form.selfieFile && <p className="text-xs text-green-600">✓ {form.selfieFile.name}</p>}
                </div>
              </div>
              <Button className="w-full" onClick={() => setStep(2)} disabled={!form.fullName || !form.nik || !form.birthDate}>
                Lanjut ke Info Toko
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5 text-primary" /> Informasi Toko</CardTitle>
              <CardDescription>Buat toko Anda menarik dan mudah ditemukan pembeli</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Toko</Label>
                <Input placeholder="Nama toko Anda" value={form.shopName} onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi Toko</Label>
                <textarea
                  className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
                  placeholder="Ceritakan tentang toko Anda..."
                  value={form.shopDescription}
                  onChange={e => setForm(f => ({ ...f, shopDescription: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Kategori Utama Produk</Label>
                <select
                  className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.shopCategory}
                  onChange={e => setForm(f => ({ ...f, shopCategory: e.target.value }))}
                >
                  <option value="">Pilih kategori...</option>
                  <option>Elektronik</option>
                  <option>Fashion</option>
                  <option>Rumah & Dapur</option>
                  <option>Kecantikan</option>
                  <option>Olahraga</option>
                  <option>Makanan & Minuman</option>
                  <option>Lainnya</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Kembali</Button>
                <Button className="flex-1" onClick={() => setStep(3)} disabled={!form.shopName || !form.shopCategory}>
                  Lanjut ke Rekening
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Rekening Bank</CardTitle>
              <CardDescription>Digunakan untuk mencairkan hasil penjualan Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Bank</Label>
                <select
                  className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.bankName}
                  onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}
                >
                  <option value="">Pilih bank...</option>
                  {["BCA", "BNI", "BRI", "Mandiri", "CIMB Niaga", "Permata Bank", "Bank Syariah Indonesia", "Jenius/BTPN"].map(b => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Nomor Rekening</Label>
                <Input placeholder="Nomor rekening bank" value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Nama Pemilik Rekening</Label>
                <Input placeholder="Sesuai buku tabungan/mobile banking" value={form.accountHolder} onChange={e => setForm(f => ({ ...f, accountHolder: e.target.value }))} />
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <strong>Penting:</strong> Nama pemilik rekening harus sama dengan nama di KTP yang Anda daftarkan.
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Kembali</Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={submitting || !form.bankName || !form.accountNumber || !form.accountHolder}
                >
                  {submitting ? "Mengirim..." : "Kirim Pendaftaran"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <div className="text-center py-12">
            <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Pendaftaran Dikirim!</h2>
            <p className="text-muted-foreground mb-2 max-w-md mx-auto">
              Tim verifikasi kami akan memeriksa data Anda dalam <strong>1-3 hari kerja</strong>. 
              Anda akan mendapat notifikasi email setelah proses selesai.
            </p>
            <p className="text-sm text-muted-foreground mb-8">Sambil menunggu, Anda tetap bisa berbelanja di jualdanbeli.</p>
            <Button onClick={() => setLocation("/")}>Kembali ke Beranda</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
