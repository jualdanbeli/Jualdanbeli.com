import { useGetUser, useGetUserProducts, useGetUserReviews } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, MapPin, Star, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIDR } from "@/lib/format";

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const id = parseInt(userId || "0");
  
  const { data: profile, isLoading: loadingProfile } = useGetUser(id, { query: { enabled: !!id } as any });
  const { data: products, isLoading: loadingProducts } = useGetUserProducts(id, { query: { enabled: !!id } as any });
  const { data: reviews, isLoading: loadingReviews } = useGetUserReviews(id, { query: { enabled: !!id } as any });

  if (loadingProfile) {
    return (
      <MainLayout>
        <Skeleton className="h-48 w-full rounded-xl mb-8" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">User not found</h2>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Card className="mb-8 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/80 to-blue-400"></div>
        <CardContent className="p-6 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-12 mb-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : profile.role === 'seller' ? (
                <Store className="w-12 h-12 text-muted-foreground" />
              ) : (
                <span className="text-4xl font-bold text-muted-foreground">{profile.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {profile.sellerInfo?.shopName || profile.name}
                </h1>
                {profile.role === 'seller' && profile.sellerInfo?.isVerified && (
                  <Badge className="bg-blue-500">Verified Seller</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {profile.sellerInfo?.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.sellerInfo.city}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(profile.createdAt).getFullYear()}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{profile.stats?.totalProducts || 0}</div>
              <div className="text-sm text-muted-foreground">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{profile.stats?.totalSales || 0}</div>
              <div className="text-sm text-muted-foreground">Sales</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                <Star className="w-5 h-5 fill-primary" />
                {profile.stats?.averageRating?.toFixed(1) || '0.0'}
              </div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{profile.stats?.totalReviews || 0}</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </div>
          </div>

          {profile.sellerInfo?.shopDescription && (
            <div>
              <h3 className="font-semibold mb-2">About Shop</h3>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                {profile.sellerInfo.shopDescription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Shop Products</h2>
        {loadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-muted/10 text-muted-foreground">
            No products listed yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(product => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="h-full overflow-hidden hover:border-primary transition-colors group cursor-pointer hover-elevate">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt="" className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>
                    <div className="font-bold text-lg">{formatIDR(product.price)}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Recent Reviews</h2>
        {loadingReviews ? (
          <div className="space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : !reviews || reviews.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-muted/10 text-muted-foreground">
            No reviews yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(review => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{review.reviewer?.name || 'Anonymous'}</div>
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
