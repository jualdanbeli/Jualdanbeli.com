import { useGetProducts, useGetCategories } from "@workspace/api-client-react";
import { Link, useLocation, useSearch } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIDR } from "@/lib/format";
import { Star, MapPin, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Products() {
  const [searchParams] = useSearch();
  const searchObj = new URLSearchParams(searchParams);
  const categoryIdStr = searchObj.get("categoryId");
  const sortStr = searchObj.get("sort") || "popular";

  const [categoryId, setCategoryId] = useState<number | undefined>(categoryIdStr ? parseInt(categoryIdStr) : undefined);
  const [sort, setSort] = useState<any>(sortStr);

  const { data: productsData, isLoading } = useGetProducts({
    categoryId,
    sort,
  });

  const { data: categories } = useGetCategories();

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-2 font-bold mb-4 pb-2 border-b">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="space-y-2">
                  <div 
                    className={`text-sm cursor-pointer hover:text-primary ${!categoryId ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                    onClick={() => setCategoryId(undefined)}
                  >
                    All Categories
                  </div>
                  {categories?.map(cat => (
                    <div 
                      key={cat.id}
                      className={`text-sm cursor-pointer hover:text-primary ${categoryId === cat.id ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                      onClick={() => setCategoryId(cat.id)}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Products</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">Sort by:</span>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : productsData?.data.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
              <h3 className="text-lg font-medium text-muted-foreground">No products found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {productsData?.data.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="h-full overflow-hidden hover:border-primary transition-colors group cursor-pointer hover-elevate">
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                      {product.condition === 'used' && (
                        <Badge variant="secondary" className="absolute top-2 left-2 text-[10px]">Used</Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="font-bold text-lg text-foreground mb-3">
                        {formatIDR(product.price)}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{product.city || 'Indonesia'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="font-medium">{product.averageRating?.toFixed(1) || '0'}</span>
                        </div>
                        <span className="text-muted-foreground">|</span>
                        <span className="text-muted-foreground">{product.totalSold || 0} sold</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  );
}
