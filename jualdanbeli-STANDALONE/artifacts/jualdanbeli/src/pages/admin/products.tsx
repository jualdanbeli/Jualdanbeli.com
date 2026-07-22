import { useAdminGetProducts, useAdminModerateProduct, getAdminGetProductsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIDR } from "@/lib/format";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminProducts() {
  const { data: productsData, isLoading } = useAdminGetProducts({});
  const moderate = useAdminModerateProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleModerate = (productId: number, status: 'active' | 'removed') => {
    moderate.mutate({ productId, data: { status } }, {
      onSuccess: () => {
        toast({ title: `Product marked as ${status}` });
        queryClient.invalidateQueries({ queryKey: getAdminGetProductsQueryKey() });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Product Moderation</h1>
        <p className="text-muted-foreground">Review and manage platform listings.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsData?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                            {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <div className="font-medium line-clamp-1">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.category?.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{product.seller?.name}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatIDR(product.price)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={product.status === 'active' ? 'secondary' : product.status === 'flagged' ? 'destructive' : 'outline'} 
                          className="capitalize"
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {product.status !== 'removed' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleModerate(product.id, 'removed')}
                              disabled={moderate.isPending}
                            >
                              <AlertTriangle className="w-4 h-4 mr-1" /> Remove
                            </Button>
                          )}
                          {product.status !== 'active' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleModerate(product.id, 'active')}
                              disabled={moderate.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Approve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!productsData || productsData.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
