import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Radio, Eye, ShoppingBag } from "lucide-react";
import { formatIDR } from "@/lib/format";

const API_BASE = "/api";

function useLiveSessions() {
  return useQuery<any[]>({
    queryKey: ["live-sessions"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/live`);
      if (!res.ok) throw new Error("Gagal memuat live");
      return res.json();
    },
    refetchInterval: 10000,
  });
}

export default function LivePage() {
  const { data: sessions, isLoading } = useLiveSessions();

  return (
    <MainLayout>
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="relative">
            <Radio className="w-8 h-8 text-red-500" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
          </div>
          <h1 className="text-3xl font-extrabold">Live Shopping</h1>
        </div>
        <p className="text-muted-foreground text-base">Tonton penjual mempresentasikan produk secara langsung & beli dengan harga spesial</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border">
          <div className="text-6xl mb-5">📡</div>
          <h2 className="text-xl font-bold mb-2">Belum Ada Live Saat Ini</h2>
          <p className="text-muted-foreground mb-6">Coba lagi nanti atau jadilah penjual pertama yang live!</p>
          <Button asChild variant="outline">
            <Link href="/seller/live">Mulai Live Sekarang</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sessions.map((s: any) => (
            <Link key={s.id} href={`/live/${s.id}`}>
              <Card className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group border-0 shadow-md">
                <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/30 overflow-hidden">
                  {s.thumbnailUrl ? (
                    <img src={s.thumbnailUrl} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Radio className="w-16 h-16 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-red-500 text-white gap-1.5 px-2.5 py-1 text-xs font-bold animate-pulse">
                      <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />LIVE
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Eye className="w-3 h-3" />{s.viewerCount}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {(s.sellerName || "T")[0].toUpperCase()}
                      </div>
                      <span className="text-white text-sm font-semibold truncate">{s.sellerName}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">{s.title}</h3>
                  {s.featuredProducts?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {s.featuredProducts.length} produk ditampilkan
                      <span className="font-medium text-primary ml-auto">
                        ab. {formatIDR(Math.min(...s.featuredProducts.map((p: any) => p.price)))}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
