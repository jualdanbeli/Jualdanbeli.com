import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Heart, ShoppingCart, Trash2, Tag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatIDR } from "@/lib/format";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";

const API_BASE = "/api";

function useWishlist(token: string) {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/wishlist`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Gagal mengambil wishlist");
      return res.json() as Promise<any[]>;
    },
    enabled: !!token,
  });
}

function useRemoveWishlist(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: number) => {
      await fetch(`${API_BASE}/wishlist/${productId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

export default function Wishlist() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const token = localStorage.getItem("token") || "";

  const { data: items, isLoading } = useWishlist(token);
  const removeItem = useRemoveWishlist(token);
  const addToCart = useAddToCart();
  const qc = useQueryClient();

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto text-center py-20">
          <Heart className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Login Diperlukan</h2>
          <Button onClick={() => setLocation("/login")}>Login Sekarang</Button>
        </div>
      </MainLayout>
    );
  }

  const handleAddToCart = (productId: number, name: string) => {
    addToCart.mutate({ data: { productId, quantity: 1 } }, {
      onSuccess: () => {
        toast({ title: "Ditambahkan ke keranjang", description: name });
        qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
      },
    });
  };

  return (
    <MainLayout>
      <div className="mb-6 flex items-center gap-3">
        <Heart className="w-7 h-7 text-red-500 fill-red-500" />
        <h1 className="text-2xl font-bold">Wishlist Saya</h1>
        {items && <Badge variant="secondary">{items.length} produk</Badge>}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      ) : !items || items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h2 className="text-xl font-bold mb-2">Wishlist masih kosong</h2>
          <p className="text-muted-foreground mb-6">Simpan produk favorit Anda agar mudah ditemukan kembali.</p>
          <Button asChild><Link href="/products">Jelajahi Produk</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item: any) => {
            const p = item.product;
            return (
              <Card key={item.wishlistId} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <Link href={`/products/${p.id}`}>
                  <div className="aspect-square bg-muted overflow-hidden relative">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                    )}
                    {p.discountPercent && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                        -{p.discountPercent}%
                      </Badge>
                    )}
                  </div>
                </Link>
                <CardContent className="p-3">
                  <Link href={`/products/${p.id}`}>
                    <p className="text-sm font-medium line-clamp-2 hover:text-primary mb-1">{p.name}</p>
                  </Link>
                  <div className="mb-2">
                    <div className="font-bold text-primary text-sm">{formatIDR(p.price)}</div>
                    {p.originalPrice && p.originalPrice > p.price && (
                      <div className="text-xs text-muted-foreground line-through">{formatIDR(p.originalPrice)}</div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                    <Tag className="w-3 h-3" />{p.sellerName}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleAddToCart(p.id, p.name)}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />Keranjang
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem.mutate(p.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}
