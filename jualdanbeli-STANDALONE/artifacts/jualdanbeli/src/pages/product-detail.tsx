import { useGetProduct, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIDR } from "@/lib/format";
import { Star, MapPin, ShieldCheck, Truck, Store, MessageCircle, Heart, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";

const API_BASE = "/api";
const getToken = () => localStorage.getItem("token") || "";

function useWishlistCheck(productId: number, enabled: boolean) {
  return useQuery<{ inWishlist: boolean }>({
    queryKey: ["wishlist-check", productId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/wishlist/check/${productId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) return { inWishlist: false };
      return res.json();
    },
    enabled,
  });
}

function useToggleWishlist(productId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inWishlist: boolean) => {
      const method = inWishlist ? "DELETE" : "POST";
      await fetch(`${API_BASE}/wishlist/${productId}`, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return !inWishlist;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist-check", productId] });
      qc.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0");

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId } as any
  });

  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();

  const { data: wishlistData } = useWishlistCheck(productId, isAuthenticated && !!productId);
  const toggleWishlist = useToggleWishlist(productId);
  const inWishlist = wishlistData?.inWishlist ?? false;

  const price = product ? parseFloat(String(product.price)) : 0;
  const originalPrice = product?.originalPrice ? parseFloat(String(product.originalPrice)) : null;
  const discountPercent = originalPrice && originalPrice > price
    ? Math.round((1 - price / originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({ title: "Login diperlukan", description: "Silakan login untuk menambahkan ke keranjang.", variant: "destructive" });
      return;
    }
    addToCart.mutate({ data: { productId, quantity: 1 } }, {
      onSuccess: () => {
        toast({ title: "Ditambahkan ke keranjang", description: product?.name });
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      }
    });
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast({ title: "Login diperlukan", description: "Login untuk menyimpan ke wishlist.", variant: "destructive" });
      return;
    }
    toggleWishlist.mutate(inWishlist, {
      onSuccess: (nowIn) => {
        toast({ title: nowIn ? "Ditambahkan ke wishlist" : "Dihapus dari wishlist" });
      },
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Produk tidak ditemukan</h2>
          <Button asChild className="mt-4"><Link href="/products">Kembali ke produk</Link></Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-white rounded-2xl border p-4 md:p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-xl overflow-hidden relative">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">🛍️</div>
              )}
              {discountPercent && (
                <Badge className="absolute top-3 left-3 bg-red-500 text-white text-sm px-2 py-1">
                  -{discountPercent}%
                </Badge>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1).map((img: string, i: number) => (
                  <div key={i} className="aspect-square rounded-lg bg-muted overflow-hidden border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1 text-amber-500 font-medium">
                  <Star className="w-4 h-4 fill-current" />
                  {(product as any).averageRating?.toFixed(1) || "0.0"}
                  <span className="text-muted-foreground font-normal">({(product as any).totalReviews || 0} ulasan)</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div className="text-muted-foreground">{product.totalSold || 0} terjual</div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <Badge variant="outline">{product.condition === "new" ? "Baru" : "Bekas"}</Badge>
              </div>

              {/* Price */}
              <div className="mb-2">
                <div className="text-3xl md:text-4xl font-extrabold text-primary mb-1">
                  {formatIDR(price)}
                </div>
                {originalPrice && originalPrice > price && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground line-through text-lg">{formatIDR(originalPrice)}</span>
                    <Badge className="bg-red-100 text-red-600 hover:bg-red-100">Hemat {formatIDR(originalPrice - price)}</Badge>
                  </div>
                )}
              </div>

              {product.stock <= 5 && product.stock > 0 && (
                <p className="text-sm text-amber-600 font-medium mb-2">⚠️ Stok tersisa {product.stock}</p>
              )}
              {product.stock === 0 && (
                <Badge variant="destructive" className="mb-2">Stok Habis</Badge>
              )}
            </div>

            <div className="p-4 bg-muted/50 rounded-xl mb-5 space-y-2">
              <div className="flex items-center gap-3 text-sm font-medium">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Dilindungi Rekening Bersama (Escrow)
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="w-5 h-5" />
                Pengiriman ke seluruh Indonesia dari {product.city || "Indonesia"}
              </div>
              {discountPercent && (
                <div className="flex items-center gap-3 text-sm text-red-600 font-medium">
                  <Tag className="w-5 h-5" />
                  Harga coret aktif — hemat {discountPercent}%
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-base mb-2">Deskripsi Produk</h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
                {product.description}
              </p>
            </div>

            <div className="mt-auto pt-5 border-t flex items-center gap-3">
              <Button
                size="lg"
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary/5 font-semibold"
                onClick={handleAddToCart}
                disabled={addToCart.isPending || product.stock <= 0}
              >
                Tambah Keranjang
              </Button>
              <Button
                size="lg"
                variant={inWishlist ? "default" : "outline"}
                className={inWishlist ? "bg-red-500 hover:bg-red-600 border-red-500" : "border-red-300 text-red-500 hover:bg-red-50"}
                onClick={handleToggleWishlist}
                disabled={toggleWishlist.isPending}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? "fill-white text-white" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Info */}
      <div className="bg-white rounded-2xl border p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden font-bold text-xl text-primary">
            {product.seller?.avatarUrl ? (
              <img src={product.seller.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              (product.seller?.sellerInfo?.shopName || product.seller?.name || "T")[0].toUpperCase()
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">{product.seller?.sellerInfo?.shopName || product.seller?.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {product.seller?.sellerInfo?.city || "Online"}
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none">
            <MessageCircle className="w-4 h-4 mr-2" />Chat
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none" asChild>
            <Link href={`/profile/${product.sellerId}`}>Kunjungi Toko</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
