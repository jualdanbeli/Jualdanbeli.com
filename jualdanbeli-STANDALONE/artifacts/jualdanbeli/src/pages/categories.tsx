import { useGetCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Categories() {
  const { data: categories, isLoading } = useGetCategories();

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Categories</h1>
        <p className="text-muted-foreground">Browse products by category</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories?.map((cat) => (
            <Link key={cat.id} href={`/products?categoryId=${cat.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer group hover-elevate">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="font-bold text-2xl">{cat.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-medium leading-tight group-hover:text-primary transition-colors">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{cat.productCount || 0} products</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
