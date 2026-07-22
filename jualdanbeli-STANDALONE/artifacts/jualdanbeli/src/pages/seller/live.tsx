import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Radio, Eye, Plus, Trash2, ExternalLink, X, Package, Clock } from "lucide-react";
import { formatIDR, formatDateTime } from "@/lib/format";
import { useState } from "react";

const API_BASE = "/api";
const getToken = () => localStorage.getItem("token") || "";

function useMyProducts() {
  return useQuery<any[]>({
    queryKey: ["seller-products-live"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/products?sellerId=me`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error("Gagal memuat produk");
      return res.json();
    },
  });
}

function useActiveLive(sellerId: number) {
  return useQuery<any[]>({
    queryKey: ["live-sessions"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/live`);
      return res.json();
    },
    refetchInterval: 5000,
    select: (data: any[]) => data.filter((s: any) => s.sellerId === sellerId),
  });
}

function usePastLive() {
  return useQuery<any[]>({
    queryKey: ["live-past"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/live/past`, { headers: { Authorization: `Bearer ${getToken()}` } });
      return res.json();
    },
  });
}

export default function SellerLive() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const { data: activeSessions, isLoading: loadingActive } = useActiveLive(user?.id || 0);
  const { data: pastSessions } = usePastLive();
  const { data: myProducts, isLoading: loadingProducts } = useMyProducts();

  const activeSession = activeSessions?.[0] ?? null;

  const startLive = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/live/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ title, description, thumbnailUrl }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json();
    },
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["live-sessions"] });
      qc.invalidateQueries({ queryKey: ["live-past"] });
      toast({ title: "Live dimulai! 🎉" });
      setTitle(""); setDescription(""); setThumbnailUrl("");
    },
    onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
  });

  const endLive = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${API_BASE}/live/${id}/end`, { method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["live-sessions"] });
      qc.invalidateQueries({ queryKey: ["live-past"] });
      toast({ title: "Live selesai" });
    },
  });

  const featureProduct = useMutation({
    mutationFn: async (productId: number) => {
      if (!activeSession) throw new Error("Tidak ada live aktif");
      const res = await fetch(`${API_BASE}/live/${activeSession.id}/feature/${productId}`, {
        method: "POST", headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["live-sessions"] }),
    onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
  });

  const removeFeature = useMutation({
    mutationFn: async (productId: number) => {
      if (!activeSession) return;
      await fetch(`${API_BASE}/live/${activeSession.id}/feature/${productId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["live-sessions"] }),
  });

  if (!isAuthenticated || (user?.role !== "seller" && user?.role !== "admin")) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold mb-4">Hanya untuk Penjual</h2>
          <Button asChild><Link href="/seller/register">Daftar Jadi Penjual</Link></Button>
        </div>
      </MainLayout>
    );
  }

  const featuredIds = new Set(activeSession?.featuredProducts?.map((p: any) => p.id) ?? []);

  return (
    <MainLayout>
      <div className="flex items-center gap-3 mb-6">
        <Radio className="w-7 h-7 text-red-500" />
        <h1 className="text-2xl font-bold">Studio Live Saya</h1>
        {activeSession && (
          <Badge className="bg-red-500 text-white gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />SEDANG LIVE
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Active live panel */}
          {activeSession ? (
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping inline-block" />
                    Live Aktif: {activeSession.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Eye className="w-3 h-3" />{activeSession.viewerCount} penonton
                    </Badge>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/live/${activeSession.id}`}><ExternalLink className="w-4 h-4 mr-1" />Lihat</Link>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => endLive.mutate(activeSession.id)}>
                      <X className="w-4 h-4 mr-1" />Akhiri Live
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Mulai: {formatDateTime(activeSession.startedAt)}
                </p>

                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />Produk yang Ditampilkan
                </h4>
                {activeSession.featuredProducts?.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Belum ada produk. Tambahkan dari daftar kanan.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeSession.featuredProducts?.map((p: any) => (
                      <div key={p.id} className="border rounded-xl overflow-hidden bg-white">
                        <div className="aspect-video bg-muted overflow-hidden">
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium line-clamp-1 mb-1">{p.name}</p>
                          <p className="text-xs font-bold text-primary mb-2">{formatIDR(p.price)}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs h-7 text-destructive hover:text-destructive"
                            onClick={() => removeFeature.mutate(p.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />Hapus
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Start live form */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-primary" />Mulai Sesi Live Baru
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Judul Live <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="Contoh: Flash Sale Baju Muslim Hari Ini!"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi (opsional)</Label>
                  <Textarea
                    placeholder="Ceritakan apa yang akan Anda presentasikan..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL Thumbnail (opsional)</Label>
                  <Input
                    placeholder="https://..."
                    value={thumbnailUrl}
                    onChange={e => setThumbnailUrl(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full font-bold text-base py-5"
                  onClick={() => startLive.mutate()}
                  disabled={!title.trim() || startLive.isPending}
                >
                  <Radio className="w-5 h-5 mr-2" />
                  {startLive.isPending ? "Memulai..." : "Mulai Live Sekarang"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Past sessions */}
          {pastSessions && pastSessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />Riwayat Live
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pastSessions.slice(0, 5).map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl text-sm">
                      <div>
                        <p className="font-medium">{s.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(s.startedAt)} · {s.peakViewers} penonton tertinggi</p>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/live/${s.id}`}><ExternalLink className="w-4 h-4" /></Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Product sidebar to feature */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="w-4 h-4" />Produk Saya
                {activeSession && <span className="text-muted-foreground font-normal">— klik untuk tampilkan</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 max-h-[500px] overflow-y-auto space-y-2">
              {loadingProducts ? (
                [1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)
              ) : !myProducts || myProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-3">Belum ada produk</p>
                  <Button size="sm" asChild>
                    <Link href="/seller/products/new"><Plus className="w-4 h-4 mr-1" />Tambah Produk</Link>
                  </Button>
                </div>
              ) : (
                myProducts.map((p: any) => {
                  const isFeatured = featuredIds.has(p.id);
                  return (
                    <div key={p.id} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${isFeatured ? "border-primary bg-primary/5" : "hover:bg-muted/40"}`}>
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1">{p.name}</p>
                        <p className="text-xs font-bold text-primary">{formatIDR(parseFloat(p.price))}</p>
                      </div>
                      {activeSession && (
                        isFeatured ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-destructive hover:text-destructive"
                            onClick={() => removeFeature.mutate(p.id)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => featureProduct.mutate(p.id)}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        )
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
