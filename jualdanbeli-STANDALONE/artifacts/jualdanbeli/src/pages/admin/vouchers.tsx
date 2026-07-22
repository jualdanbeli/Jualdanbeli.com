import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tag, Plus, ToggleLeft, ToggleRight, Percent, DollarSign } from "lucide-react";
import { formatIDR, formatDateTime } from "@/lib/format";

const API_BASE = "/api";
const getToken = () => localStorage.getItem("token") || "";

function useVouchers() {
  return useQuery<any[]>({
    queryKey: ["admin-vouchers"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/vouchers`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error("Gagal mengambil voucher");
      return res.json();
    },
  });
}

function useCreateVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/vouchers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-vouchers"] }),
  });
}

function useToggleVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${API_BASE}/vouchers/${id}/toggle`, { method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-vouchers"] }),
  });
}

export default function AdminVouchers() {
  const { data: vouchers, isLoading } = useVouchers();
  const createVoucher = useCreateVoucher();
  const toggleVoucher = useToggleVoucher();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    code: "", type: "percentage", value: "", minOrder: "",
    maxDiscount: "", maxUses: "", expiresAt: "", description: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    createVoucher.mutate({
      ...form,
      value: parseFloat(form.value),
      minOrder: form.minOrder ? parseFloat(form.minOrder) : 0,
      maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
      maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
      expiresAt: form.expiresAt || undefined,
    }, {
      onSuccess: () => {
        toast({ title: "Voucher berhasil dibuat!" });
        setOpen(false);
        setForm({ code: "", type: "percentage", value: "", minOrder: "", maxDiscount: "", maxUses: "", expiresAt: "", description: "" });
      },
      onError: (err: any) => toast({ title: "Gagal", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Tag className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Manajemen Voucher</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Buat Voucher</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Buat Voucher Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Kode Voucher</Label>
                <Input
                  placeholder="Contoh: DISKON50"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tipe Diskon</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Persentase (%)</SelectItem>
                      <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nilai {form.type === "percentage" ? "(%)" : "(Rp)"}</Label>
                  <Input type="number" placeholder={form.type === "percentage" ? "10" : "50000"} value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Min. Belanja (Rp)</Label>
                  <Input type="number" placeholder="100000" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} />
                </div>
                {form.type === "percentage" && (
                  <div className="space-y-2">
                    <Label>Maks. Diskon (Rp)</Label>
                    <Input type="number" placeholder="100000" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Maks. Penggunaan</Label>
                  <Input type="number" placeholder="Tidak terbatas" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Kadaluarsa</Label>
                  <Input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deskripsi (opsional)</Label>
                <Input placeholder="Keterangan voucher..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <Button type="submit" className="w-full" disabled={createVoucher.isPending}>
                {createVoucher.isPending ? "Membuat..." : "Buat Voucher"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : !vouchers || vouchers.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground">Belum ada voucher. Buat voucher pertama Anda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map((v: any) => (
            <Card key={v.id} className={`relative overflow-hidden ${!v.isActive ? "opacity-60" : ""}`}>
              <div className={`absolute top-0 left-0 right-0 h-1 ${v.isActive ? "bg-primary" : "bg-muted"}`} />
              <CardHeader className="pb-2 pt-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-mono tracking-wider">{v.code}</CardTitle>
                  <Badge className={v.isActive ? "bg-green-500" : "bg-muted text-muted-foreground"}>
                    {v.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                  {v.type === "percentage" ? <Percent className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                  {v.type === "percentage" ? `${v.value}%` : formatIDR(v.value)}
                  {v.type === "percentage" && v.maxDiscount && (
                    <span className="text-sm font-normal text-muted-foreground">maks. {formatIDR(v.maxDiscount)}</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  {v.minOrder > 0 && <div>Min. belanja: {formatIDR(v.minOrder)}</div>}
                  <div>Digunakan: {v.usedCount}{v.maxUses ? ` / ${v.maxUses}` : " (tak terbatas)"}</div>
                  {v.expiresAt && <div>Kadaluarsa: {formatDateTime(v.expiresAt)}</div>}
                  {v.description && <div className="italic">{v.description}</div>}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => toggleVoucher.mutate(v.id)}
                >
                  {v.isActive ? <><ToggleLeft className="w-4 h-4 mr-2" />Nonaktifkan</> : <><ToggleRight className="w-4 h-4 mr-2" />Aktifkan</>}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
