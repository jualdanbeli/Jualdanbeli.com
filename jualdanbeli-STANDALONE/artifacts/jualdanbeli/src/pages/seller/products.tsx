import { useGetProducts, useDeleteProduct, getGetProductsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatIDR } from "@/lib/format";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";

export default function SellerProducts() {
  const { user } = useAuth();
  const { data: productsData, isLoading } = useGetProducts({
    // Fetch products for current seller
  });
  // Filter products client-side for now since there's no sellerId param in useGetProducts
  const products = productsData?.data.filter(p => p.sellerId === user?.id) || [];

  const deleteMutation = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate({ productId: id }, {
        onSuccess: () => {
          toast({ title: "Product deleted" });
          queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
        }
      });
    }
  };

  return (
    <SellerLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Products</h1>
          <p className="text-muted-foreground">Manage your shop's inventory.</p>
        </div>
        <Button asChild>
          <Link href="/seller/products/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No products yet</h2>
          <p className="text-muted-foreground mb-6">Start adding products to your shop.</p>
          <Button asChild><Link href="/seller/products/new">Add Your First Product</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map(product => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-4 flex flex-col sm:flex-row gap-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                  {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg leading-tight mb-1">{product.name}</h3>
                      <div className="text-muted-foreground text-sm flex gap-2 items-center">
                        <Badge variant="outline">{product.category?.name || 'Uncategorized'}</Badge>
                        <span>Stock: {product.stock}</span>
                      </div>
                    </div>
                    <Badge variant={product.status === 'active' ? 'secondary' : 'outline'} className="capitalize">
                      {product.status}
                    </Badge>
                  </div>
                  <div className="font-bold text-xl text-primary mt-auto mb-4 sm:mb-0">
                    {formatIDR(product.price)}
                  </div>
                </div>
                <div className="flex sm:flex-col justify-end gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 sm:pl-4 sm:border-l">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive flex-1 sm:flex-none"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </SellerLayout>
  );
}
