import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Zap, Heart, Droplets, Phone, Wifi, CreditCard, Tv,
  Smartphone, Package, Building2, Car, Flame, CheckCircle2,
  ArrowLeft, Loader2, Receipt, Clock, ShieldCheck, AlertCircle,
  ChevronRight, Wallet,
} from "lucide-react";

const BILL_CATEGORIES = [
  { type: "pln_pascabayar", label: "Listrik PLN", sublabel: "Pascabayar", icon: Zap, color: "bg-yellow-100 text-yellow-700", hot: true },
  { type: "pln_prepaid", label: "Token Listrik", sublabel: "Prabayar", icon: Zap, color: "bg-yellow-50 text-yellow-600" },
  { type: "bpjs_kesehatan", label: "BPJS Kesehatan", sublabel: "Premi Bulanan", icon: Heart, color: "bg-green-100 text-green-700", hot: true },
  { type: "bpjs_ketenagakerjaan", label: "BPJS TK", sublabel: "Ketenagakerjaan", icon: ShieldCheck, color: "bg-blue-100 text-blue-700" },
  { type: "pdam", label: "Air PDAM", sublabel: "Tagihan Air", icon: Droplets, color: "bg-cyan-100 text-cyan-700" },
  { type: "telepon", label: "Telepon Rumah", sublabel: "Telkom", icon: Phone, color: "bg-indigo-100 text-indigo-700" },
  { type: "internet", label: "Internet", sublabel: "IndiHome / Biznet / dll", icon: Wifi, color: "bg-purple-100 text-purple-700", hot: true },
  { type: "finance", label: "Cicilan Finance", sublabel: "Adira / FIF / WOM / dll", icon: CreditCard, color: "bg-rose-100 text-rose-700", hot: true },
  { type: "tv_kabel", label: "TV Kabel", sublabel: "Indovision / MNC / dll", icon: Tv, color: "bg-orange-100 text-orange-700" },
  { type: "pulsa", label: "Pulsa", sublabel: "Semua Operator", icon: Smartphone, color: "bg-pink-100 text-pink-700" },
  { type: "paket_data", label: "Paket Data", sublabel: "Semua Operator", icon: Package, color: "bg-teal-100 text-teal-700" },
  { type: "pbb", label: "PBB", sublabel: "Pajak Bumi & Bangunan", icon: Building2, color: "bg-amber-100 text-amber-700" },
  { type: "stnk", label: "Pajak Kendaraan", sublabel: "e-Samsat", icon: Car, color: "bg-red-100 text-red-700" },
  { type: "gas", label: "Gas", sublabel: "PGN / Elpiji", icon: Flame, color: "bg-orange-100 text-orange-600" },
];

const ID_LABELS: Record<string, { label: string; placeholder: string }> = {
  pln_pascabayar: { label: "Nomor Meter / ID Pelanggan", placeholder: "Contoh: 123456789012" },
  pln_prepaid: { label: "Nomor Meter", placeholder: "Contoh: 12345678901234567890" },
  bpjs_kesehatan: { label: "Nomor VA / Kartu BPJS", placeholder: "Contoh: 0001234567890" },
  bpjs_ketenagakerjaan: { label: "Nomor Kepesertaan", placeholder: "Contoh: 13000123456789" },
  pdam: { label: "Nomor Pelanggan PDAM", placeholder: "Contoh: 040123456" },
  telepon: { label: "Nomor Telepon", placeholder: "Contoh: 02112345678" },
  internet: { label: "Nomor Pelanggan", placeholder: "Contoh: INET-1234567" },
  finance: { label: "Nomor Kontrak", placeholder: "Contoh: ADIRA-1234567890" },
  tv_kabel: { label: "Nomor Pelanggan", placeholder: "Contoh: IND-12345678" },
  pulsa: { label: "Nomor HP", placeholder: "Contoh: 081234567890" },
  paket_data: { label: "Nomor HP", placeholder: "Contoh: 081234567890" },
  pbb: { label: "NOP / Nomor Objek Pajak", placeholder: "Contoh: 3171012345678901234" },
  stnk: { label: "Nomor Polisi", placeholder: "Contoh: B 1234 ABC" },
  gas: { label: "Nomor Pelanggan", placeholder: "Contoh: PGN-1234567" },
};

type Step = "hub" | "input" | "confirm" | "success";

interface InquiryResult {
  billType: string;
  customerId: string;
  customerName: string;
  description: string;
  amount: number;
  adminFee: number;
  totalAmount: number;
}

function fmt(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function Pembayaran() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("hub");
  const [selected, setSelected] = useState<(typeof BILL_CATEGORIES)[0] | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [inquiry, setInquiry] = useState<InquiryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ referenceNo: string; description: string; totalAmount: number } | null>(null);

  const handleSelect = (cat: (typeof BILL_CATEGORIES)[0]) => {
    if (!isAuthenticated) {
      toast({ title: "Login diperlukan", description: "Silakan login untuk melakukan pembayaran", variant: "destructive" });
      return;
    }
    setSelected(cat);
    setCustomerId("");
    setInquiry(null);
    setStep("input");
  };

  const handleInquiry = async () => {
    if (!customerId.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/bills/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ billType: selected!.type, customerId: customerId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal cek tagihan");
      setInquiry(data);
      setStep("confirm");
    } catch (e: any) {
      toast({ title: "Gagal cek tagihan", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!inquiry) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/bills/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ billType: inquiry.billType, customerId: inquiry.customerId, amount: inquiry.amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Pembayaran gagal");
      setSuccessData({ referenceNo: data.referenceNo, description: data.description, totalAmount: data.totalAmount });
      setStep("success");
    } catch (e: any) {
      toast({ title: "Pembayaran Gagal", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("hub");
    setSelected(null);
    setCustomerId("");
    setInquiry(null);
    setSuccessData(null);
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">

        {/* Hub */}
        {step === "hub" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">Pembayaran Tagihan</h1>
              <p className="text-muted-foreground text-sm">Bayar listrik, BPJS, cicilan, dan tagihan lainnya langsung dari dompet jualdanbeli. Biaya admin <strong>Rp 2.500</strong>/transaksi.</p>
            </div>

            {/* Info bar */}
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-800">
              <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600" />
              <span>Pembayaran diproses instan · Bukti transaksi tersimpan otomatis · Layanan 24 jam</span>
            </div>

            {!isAuthenticated && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Silakan <Link href="/login" className="font-semibold underline">login</Link> terlebih dahulu untuk melakukan pembayaran.</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
              {BILL_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.type}
                    onClick={() => handleSelect(cat)}
                    className="relative flex flex-col items-center gap-2 p-4 bg-white border rounded-xl hover:border-primary hover:shadow-md transition-all text-center group"
                  >
                    {cat.hot && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">HOT</span>
                    )}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{cat.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{cat.sublabel}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Why use */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Zap, title: "Proses Instan", desc: "Pembayaran diproses real-time, tagihan langsung terbayar" },
                { icon: ShieldCheck, title: "Aman & Terpercaya", desc: "Dilindungi sistem escrow jualdanbeli, tidak ada risiko" },
                { icon: Receipt, title: "Bukti Tersimpan", desc: "Riwayat pembayaran selalu bisa dilihat di riwayat transaksi" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3 p-4 bg-white border rounded-xl">
                  <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Input Nomor Pelanggan */}
        {step === "input" && selected && (
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <button onClick={reset} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${selected.color}`}>
                <selected.icon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{selected.label}</h2>
                <p className="text-sm text-muted-foreground">{selected.sublabel}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{ID_LABELS[selected.type]?.label}</label>
                <Input
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  placeholder={ID_LABELS[selected.type]?.placeholder}
                  className="h-12 text-base"
                  onKeyDown={e => e.key === "Enter" && handleInquiry()}
                />
              </div>

              <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                <p className="font-medium mb-1">Biaya Layanan</p>
                <p>Admin fee: <strong>Rp 2.500</strong> per transaksi · Pembayaran dari saldo dompet jualdanbeli</p>
              </div>

              <Button onClick={handleInquiry} disabled={!customerId.trim() || loading} className="w-full h-12 text-base font-semibold">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Mengecek...</> : "Cek Tagihan"}
              </Button>
            </div>
          </div>
        )}

        {/* Konfirmasi Pembayaran */}
        {step === "confirm" && inquiry && selected && (
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <button onClick={() => setStep("input")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${selected.color}`}>
                <selected.icon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Konfirmasi Pembayaran</h2>
                <p className="text-sm text-muted-foreground">{selected.label}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: "Nama Pelanggan", value: inquiry.customerName },
                { label: "ID / Nomor", value: inquiry.customerId },
                { label: "Keterangan", value: inquiry.description },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-right max-w-[60%]">{value}</span>
                </div>
              ))}

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tagihan</span>
                  <span className="font-medium">{fmt(inquiry.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Biaya Admin</span>
                  <span className="font-medium">Rp 2.500</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t pt-2">
                  <span>Total Bayar</span>
                  <span className="text-primary">{fmt(inquiry.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 mb-4">
              <Wallet className="w-4 h-4 shrink-0 text-blue-600" />
              <span>Pembayaran akan dipotong dari <strong>Saldo Dompet</strong> Anda. Pastikan saldo mencukupi.</span>
            </div>

            <Button onClick={handlePay} disabled={loading} className="w-full h-12 text-base font-semibold">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Memproses...</> : `Bayar ${fmt(inquiry.totalAmount)}`}
            </Button>
          </div>
        )}

        {/* Sukses */}
        {step === "success" && successData && (
          <div className="bg-white border rounded-2xl p-8 shadow-sm text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-1">Pembayaran Berhasil!</h2>
            <p className="text-muted-foreground mb-6">{successData.description}</p>

            <div className="bg-muted/50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nomor Referensi</span>
                <span className="font-mono font-semibold text-xs">{successData.referenceNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Dibayar</span>
                <span className="font-bold text-green-700">{fmt(successData.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Waktu</span>
                <span className="font-medium">{new Date().toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={reset} className="flex-1">Bayar Tagihan Lain</Button>
              <Link href="/wallet" className="flex-1">
                <Button variant="outline" className="w-full">Lihat Dompet</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
