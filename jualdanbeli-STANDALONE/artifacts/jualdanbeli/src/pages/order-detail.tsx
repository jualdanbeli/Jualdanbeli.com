import { useGetOrder, useConfirmOrderReceived, getGetOrderQueryKey, useOpenDispute } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatIDR, formatDateTime } from "@/lib/format";
import {
  ShieldCheck, Truck, CheckCircle2, AlertTriangle, Package, ClipboardCheck,
  Star, Clock, ExternalLink, Phone, ChevronRight
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";

const STATUS_STEPS = [
  { key: "paid",      label: "Pembayaran Dikonfirmasi", icon: ShieldCheck,    desc: "Dana aman di Rekening Bersama" },
  { key: "confirmed", label: "Pesanan Dikonfirmasi",    icon: ClipboardCheck, desc: "Penjual memproses pesanan Anda" },
  { key: "shipped",   label: "Dalam Pengiriman",        icon: Truck,          desc: "Paket dalam perjalanan" },
  { key: "delivered", label: "Tiba di Tujuan",          icon: Package,        desc: "Paket telah tiba di tujuan" },
  { key: "completed", label: "Pesanan Selesai",         icon: Star,           desc: "Dana dikirim ke penjual" },
];

function getStepIndex(status: string) {
  const map: Record<string, number> = { paid: 0, confirmed: 1, shipped: 2, delivered: 3, completed: 4 };
  return map[status] ?? -1;
}

function OrderTimeline({ status }: { status: string }) {
  const current = getStepIndex(status);
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Pesanan Dibatalkan</p>
          <p className="text-sm text-red-700">Pesanan ini telah dibatalkan.</p>
        </div>
      </div>
    );
  }
  if (status === "disputed") {
    return (
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Dalam Proses Investigasi</p>
          <p className="text-sm text-amber-700">
            Laporan Anda sedang ditangani tim admin. Dana escrow tetap aman hingga kasus selesai.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-0">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                done ? "bg-primary border-primary text-white" : "bg-white border-muted text-muted-foreground"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`w-0.5 h-8 mt-1 ${i < current ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
            <div className="pt-1.5 pb-6">
              <p className={`font-semibold text-sm ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
                {active && <span className="ml-2 inline-flex items-center gap-1 text-xs text-primary"><Clock className="w-3 h-3" />Saat ini</span>}
              </p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const DISPUTE_TYPES = [
  { value: "paket_tidak_sampai",  label: "Paket Tidak Sampai",         desc: "Paket belum tiba melebihi estimasi pengiriman",    urgent: false, icon: "📦" },
  { value: "paket_hilang",        label: "Paket Hilang",               desc: "Paket tidak bisa dilacak / diduga hilang",         urgent: true,  icon: "🔍" },
  { value: "kurir_nakal",         label: "Oknum Kurir Bermasalah",     desc: "Pencurian, pemerasan, atau tindakan tidak terpuji", urgent: true,  icon: "🚨" },
  { value: "paket_rusak",         label: "Paket Rusak / Cacat",        desc: "Isi paket rusak atau cacat saat diterima",         urgent: false, icon: "💔" },
  { value: "barang_tidak_sesuai", label: "Barang Tidak Sesuai",        desc: "Produk berbeda dari deskripsi penjual",            urgent: false, icon: "❌" },
  { value: "other",               label: "Lainnya",                    desc: "Masalah lain yang belum tercantum di atas",        urgent: false, icon: "📝" },
];

const COURIERS = ["JNE", "J&T Express", "SiCepat", "AnterAja", "TIKI", "Pos Indonesia", "Ninja Xpress", "Lion Parcel", "Lainnya"];

function DisputeForm({ orderId, order, onSuccess }: { orderId: number; order: any; onSuccess: () => void }) {
  const openDispute = useOpenDispute();
  const { toast } = useToast();
  const [disputeType, setDisputeType] = useState("");
  const [courierName, setCourierName] = useState(order.courierName || "");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [description, setDescription] = useState("");

  const selectedType = DISPUTE_TYPES.find(t => t.value === disputeType);
  const isCourierIssue = ["paket_tidak_sampai", "paket_hilang", "kurir_nakal"].includes(disputeType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeType) {
      toast({ title: "Pilih jenis masalah terlebih dahulu", variant: "destructive" });
      return;
    }
    const reason = selectedType?.label || disputeType;
    openDispute.mutate({
      orderId,
      data: {
        reason: reason as any,
        description,
        disputeType,
        courierName: courierName || undefined,
        trackingNumber: trackingNumber || undefined,
      } as any,
    }, {
      onSuccess: () => {
        toast({ title: "Laporan berhasil dikirim", description: "Tim kami akan memproses dalam 1×24 jam. Cek email Anda." });
        onSuccess();
      },
      onError: (err: any) => toast({ title: "Gagal mengirim laporan", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className="font-semibold">Jenis Masalah *</Label>
        <div className="space-y-2">
          {DISPUTE_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setDisputeType(t.value)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                disputeType === t.value
                  ? t.urgent ? "border-red-400 bg-red-50" : "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <span className="text-xl flex-shrink-0">{t.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{t.label}</p>
                  {t.urgent && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Urgent</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedType?.urgent && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          <p className="font-semibold mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Kasus Urgent — Eskalasi Otomatis ke Kurir
          </p>
          <p>Laporan ini akan <strong>langsung diteruskan ke manajemen kurir</strong> dan tim keamanan jualdanbeli. Dana escrow tetap aman selama investigasi.</p>
        </div>
      )}

      {isCourierIssue && (
        <div className="space-y-3 p-4 bg-muted/50 rounded-xl border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Info Pengiriman</p>
          <div className="space-y-2">
            <Label>Kurir</Label>
            <Select value={courierName} onValueChange={setCourierName}>
              <SelectTrigger><SelectValue placeholder="Pilih kurir" /></SelectTrigger>
              <SelectContent>
                {COURIERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nomor Resi</Label>
            <Input
              placeholder="Contoh: JD1234567890"
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              className="font-mono"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Deskripsi Detail *</Label>
        <Textarea
          placeholder={
            disputeType === "kurir_nakal"
              ? "Ceritakan: tanggal, jam, nama/ciri kurir jika ada, apa yang terjadi secara detail..."
              : disputeType === "paket_tidak_sampai" || disputeType === "paket_hilang"
              ? "Kapan terakhir update tracking? Status apa di aplikasi kurir? Sudah berapa hari dari estimasi?"
              : "Jelaskan masalah yang Anda alami secara lengkap..."
          }
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="min-h-[120px]"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        variant={selectedType?.urgent ? "destructive" : "default"}
        disabled={openDispute.isPending || !disputeType || !description}
      >
        {openDispute.isPending ? "Mengirim laporan..." : "Kirim Laporan Pengiriman"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Dana escrow aman selama investigasi.{" "}
        <Link href="/shipping-protection" className="text-primary hover:underline">
          Baca kebijakan perlindungan kami →
        </Link>
      </p>
    </form>
  );
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id || "0");
  const { data: order, isLoading } = useGetOrder(orderId, { query: { enabled: !!orderId } as any });
  const { user } = useAuth();
  const confirmReceived = useConfirmOrderReceived();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [disputeOpen, setDisputeOpen] = useState(false);

  const handleConfirm = () => {
    confirmReceived.mutate({ orderId }, {
      onSuccess: () => {
        toast({ title: "Pesanan dikonfirmasi!", description: "Dana escrow telah dikirim ke penjual." });
        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(orderId) });
      },
    });
  };

  const statusColor: Record<string, string> = {
    paid: "bg-blue-100 text-blue-700",
    confirmed: "bg-indigo-100 text-indigo-700",
    shipped: "bg-blue-100 text-blue-700",
    delivered: "bg-teal-100 text-teal-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    disputed: "bg-amber-100 text-amber-700",
  };

  const statusLabel: Record<string, string> = {
    paid: "Dibayar", confirmed: "Dikonfirmasi", shipped: "Dikirim",
    delivered: "Tiba", completed: "Selesai", cancelled: "Dibatalkan", disputed: "Sengketa",
  };

  if (isLoading || !order) return <MainLayout><div className="p-8 text-center">Memuat...</div></MainLayout>;

  const isBuyer = user?.id === order.buyer?.id;
  const canDispute = isBuyer && (order.status === "shipped" || order.status === "delivered") && !order.dispute;
  const canConfirm = isBuyer && order.status === "delivered" && !order.dispute;

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pesanan #{order.id}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{formatDateTime(order.createdAt)}</p>
        </div>
        <Badge className={`text-sm px-3 py-1 ${statusColor[order.status] || "bg-muted"}`}>
          {statusLabel[order.status] || order.status}
        </Badge>
      </div>

      {/* Shipping protection banner */}
      {isBuyer && (order.status === "shipped" || order.status === "confirmed") && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-blue-900 text-sm">Paket Anda dilindungi Garansi Pengiriman jualdanbeli</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Jika paket tidak tiba, terlambat, atau ada masalah dengan kurir — laporkan dan dana escrow tetap aman.
            </p>
          </div>
          <Link href="/shipping-protection">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-100 text-xs gap-1 flex-shrink-0">
              Selengkapnya <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Status Pesanan</CardTitle></CardHeader>
            <CardContent><OrderTimeline status={order.status} /></CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader className="bg-muted/30 pb-4"><CardTitle className="text-base">Produk yang Dibeli</CardTitle></CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-5">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-xl flex-shrink-0 overflow-hidden border">
                      {item.productImage
                        ? <img src={item.productImage} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <Link href={`/products/${item.productId}`} className="font-medium hover:text-primary hover:underline text-sm">
                        {item.productName}
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">{item.quantity} × {formatIDR(item.unitPrice)}</div>
                    </div>
                    <div className="font-semibold flex items-center text-sm">{formatIDR(item.quantity * item.unitPrice)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping info */}
          <Card>
            <CardHeader><CardTitle className="text-base">Informasi Pengiriman</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Truck className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium mb-1">{order.buyer?.name}</div>
                  <div className="text-muted-foreground text-sm leading-relaxed max-w-md">{order.shippingAddress}</div>
                  {order.trackingNumber && (
                    <div className="mt-4 p-3 bg-muted rounded-lg inline-flex items-center gap-3">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block mb-1">No. Resi</span>
                        <span className="font-mono font-medium">{order.trackingNumber}</span>
                      </div>
                      <a
                        href={`https://cekresi.com/?noresi=${order.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary hover:underline text-xs flex items-center gap-1"
                      >
                        Lacak <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dispute detail card (if disputed) */}
          {order.dispute && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Detail Laporan Sengketa
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-32 flex-shrink-0">Jenis Masalah</span>
                  <span className="font-medium">{order.dispute.reason}</span>
                </div>
                {order.dispute.courierName && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-32 flex-shrink-0">Kurir</span>
                    <span className="font-medium">{order.dispute.courierName}</span>
                  </div>
                )}
                {order.dispute.trackingNumber && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-32 flex-shrink-0">No. Resi</span>
                    <span className="font-mono font-medium">{order.dispute.trackingNumber}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-32 flex-shrink-0">Status</span>
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    {order.dispute.status === "open" ? "Menunggu review"
                     : order.dispute.status === "investigating" ? "Sedang diinvestigasi"
                     : order.dispute.status}
                  </Badge>
                </div>
                {order.dispute.escalatedToCourier === "pending" && (
                  <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-xs">
                    <Phone className="w-3.5 h-3.5 inline mr-1" />
                    <strong>Eskalasi ke kurir sedang diproses</strong> — manajemen {order.dispute.courierName || "kurir"} akan dihubungi dalam 1×24 jam.
                  </div>
                )}
                {order.dispute.insuranceClaimStatus && order.dispute.insuranceClaimStatus !== "none" && (
                  <div className={`mt-2 p-3 rounded-lg text-xs border ${
                    order.dispute.insuranceClaimStatus === "approved"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : order.dispute.insuranceClaimStatus === "rejected"
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-blue-50 border-blue-200 text-blue-800"
                  }`}>
                    <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                    <strong>Klaim Asuransi Pengiriman</strong>
                    {order.dispute.insuranceClaimId && (
                      <span className="ml-1 font-mono opacity-75">({order.dispute.insuranceClaimId})</span>
                    )}
                    <span className="ml-1">—</span>
                    <span className="ml-1">
                      {order.dispute.insuranceClaimStatus === "pending" && "Diajukan ke operator kurir, menunggu respons"}
                      {order.dispute.insuranceClaimStatus === "approved" && "✅ Disetujui — dana asuransi akan diproses"}
                      {order.dispute.insuranceClaimStatus === "rejected" && "Ditolak oleh kurir — admin akan meninjau ulang"}
                    </span>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <p className="text-muted-foreground mb-1">Deskripsi laporan:</p>
                  <p className="leading-relaxed">{order.dispute.description}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-4">
          {/* Payment summary */}
          <Card>
            <CardHeader><CardTitle className="text-base">Ringkasan Pembayaran</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Produk</span>
                  <span>{formatIDR(order.totalAmount - order.shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ongkir</span>
                  <span>{formatIDR(order.shippingCost)}</span>
                </div>
                <div className="border-t pt-3 mt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">{formatIDR(order.totalAmount)}</span>
                </div>
              </div>

              {/* Escrow status badge */}
              <div className={`p-3 rounded-xl flex items-start gap-3 text-sm mb-4 ${
                order.escrowStatus === "released" ? "bg-green-50 border border-green-200 text-green-800"
                : order.status === "disputed" ? "bg-amber-50 border border-amber-200 text-amber-800"
                : "bg-blue-50 border border-blue-200 text-blue-800"
              }`}>
                <ShieldCheck className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  order.escrowStatus === "released" ? "text-green-600"
                  : order.status === "disputed" ? "text-amber-600"
                  : "text-blue-600"
                }`} />
                <div>
                  <div className="font-semibold mb-0.5">
                    {order.escrowStatus === "released" ? "Dana Sudah Dicairkan"
                     : order.status === "disputed" ? "Dana Ditahan selama Sengketa"
                     : "Dana di Rekening Bersama"}
                  </div>
                  <p className="leading-snug opacity-80 text-xs">
                    {order.status === "disputed"
                      ? "Dana aman selama investigasi berlangsung."
                      : order.escrowStatus === "released"
                      ? "Dana telah dikirim ke penjual setelah Anda konfirmasi."
                      : "Dana aman ditahan, dicairkan ke penjual setelah Anda konfirmasi terima."}
                  </p>
                </div>
              </div>

              {/* Confirm received */}
              {canConfirm && (
                <Button className="w-full font-bold mb-2" size="lg" onClick={handleConfirm} disabled={confirmReceived.isPending}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {confirmReceived.isPending ? "Memproses..." : "Konfirmasi Terima Barang"}
                </Button>
              )}

              {/* Report shipping problem */}
              {canDispute && (
                <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-400"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Laporkan Masalah Pengiriman
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Laporkan Masalah Pengiriman</DialogTitle>
                      <DialogDescription>
                        Pesanan #{order.id} · Dana escrow tetap aman selama proses investigasi
                      </DialogDescription>
                    </DialogHeader>
                    <DisputeForm
                      orderId={orderId}
                      order={order}
                      onSuccess={() => {
                        setDisputeOpen(false);
                        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(orderId) });
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}

              {/* Shipping protection link */}
              {isBuyer && !["completed", "cancelled"].includes(order.status) && (
                <Link href="/shipping-protection">
                  <Button variant="ghost" className="w-full text-muted-foreground text-xs mt-1 h-8 gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Garansi Pengiriman jualdanbeli
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Seller info */}
          {order.seller && (
            <Card>
              <CardHeader><CardTitle className="text-base">Penjual</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-primary">
                    {(order.seller.sellerInfo?.shopName || order.seller.name || "S")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{order.seller.sellerInfo?.shopName || order.seller.name}</p>
                    <p className="text-xs text-muted-foreground">{order.seller.sellerInfo?.city || ""}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
