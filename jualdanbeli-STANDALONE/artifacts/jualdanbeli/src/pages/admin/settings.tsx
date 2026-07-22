import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, DollarSign, Shield, Building2, FileText, Save, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function PlatformSettingsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, any>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/platform-settings"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/platform-settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/platform-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal menyimpan pengaturan");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/platform-settings"] });
      toast({ title: "Pengaturan disimpan!", description: "Perubahan berhasil disimpan." });
    },
    onError: () => {
      toast({ title: "Gagal!", description: "Terjadi kesalahan saat menyimpan.", variant: "destructive" });
    },
  });

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const totalDeduction = (form.commissionRate ?? 1) + (form.umkmTaxRate ?? 0.5);
  const sellerReceives = 100 - totalDeduction;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan Platform</h1>
          <p className="text-muted-foreground text-sm">Konfigurasi sistem marketplace jualdanbeli</p>
        </div>
        <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="gap-2">
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      {/* Ringkasan potongan penjual */}
      <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-blue-800 text-sm">Ringkasan Potongan per Transaksi Penjual</p>
            <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-2xl font-bold text-blue-600">{form.commissionRate ?? 1}%</p>
                <p className="text-xs text-muted-foreground mt-1">Biaya Platform</p>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-2xl font-bold text-indigo-600">{form.umkmTaxRate ?? 0.5}%</p>
                <p className="text-xs text-muted-foreground mt-1">Pajak UMKM (PPh Final)</p>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border border-green-100">
                <p className="text-2xl font-bold text-green-600">{sellerReceives.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Diterima Penjual</p>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Contoh: Penjualan Rp 100.000 → Biaya platform Rp {((form.commissionRate ?? 1) * 1000).toLocaleString("id-ID")} + Pajak UMKM Rp {((form.umkmTaxRate ?? 0.5) * 1000).toLocaleString("id-ID")} → Penjual menerima Rp {(sellerReceives * 1000).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Informasi Platform</CardTitle>
            </div>
            <CardDescription>Identitas dan kontak resmi platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nama Platform</Label>
              <Input value={form.platformName ?? ""} onChange={e => set("platformName", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Email Kontak Resmi</Label>
              <Input type="email" value={form.contactEmail ?? ""} onChange={e => set("contactEmail", e.target.value)} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Biaya & Pajak Penjual</CardTitle>
            </div>
            <CardDescription>Potongan dari setiap transaksi penjual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Biaya Platform (%)</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number" min="0" max="30" step="0.5"
                  value={form.commissionRate ?? 1}
                  onChange={e => set("commissionRate", parseFloat(e.target.value))}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pendapatan platform dari setiap transaksi</p>
            </div>
            <div>
              <Label>Pajak UMKM — PPh Final (%)</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number" min="0" max="5" step="0.1"
                  value={form.umkmTaxRate ?? 0.5}
                  onChange={e => set("umkmTaxRate", parseFloat(e.target.value))}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Berdasarkan <strong>PP No. 23 Tahun 2018</strong> — 0,5% dari omzet bruto untuk UMKM dengan omzet &lt; Rp 4,8 miliar/tahun. Wajib disetorkan ke DJP.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Batas Penarikan Dana</CardTitle>
            </div>
            <CardDescription>Atur limit withdraw penjual ke rekening bank</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Minimum Penarikan (Rp)</Label>
              <Input
                type="number" min="0"
                value={form.minWithdrawalAmount ?? 50000}
                onChange={e => set("minWithdrawalAmount", parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Maksimum Penarikan per Hari (Rp)</Label>
              <Input
                type="number" min="0"
                value={form.maxWithdrawalAmount ?? 50000000}
                onChange={e => set("maxWithdrawalAmount", parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Rekening Bersama (Escrow)</CardTitle>
            </div>
            <CardDescription>Pengaturan perlindungan pembeli & penjual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Auto-release Escrow (hari)</Label>
              <Input
                type="number" min="1" max="30"
                value={form.autoReleaseEscrowDays ?? 7}
                onChange={e => set("autoReleaseEscrowDays", parseInt(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Dana otomatis diteruskan ke penjual jika pembeli tidak konfirmasi dalam X hari setelah pengiriman
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Status Platform</CardTitle>
            </div>
            <CardDescription>Kontrol ketersediaan platform secara langsung</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
              <div>
                <p className="font-medium text-sm">Mode Maintenance</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Jika aktif, platform hanya bisa diakses oleh admin. Pengguna biasa akan melihat halaman maintenance.
                </p>
              </div>
              <Switch
                checked={form.maintenanceMode ?? false}
                onCheckedChange={v => set("maintenanceMode", v)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="gap-2">
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? "Menyimpan..." : "Simpan Semua Perubahan"}
        </Button>
      </div>
    </AdminLayout>
  );
}
