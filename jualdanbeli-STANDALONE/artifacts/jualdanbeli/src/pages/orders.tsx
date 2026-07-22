import { useGetOrders } from "@workspace/api-client-react";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatIDR, formatDate } from "@/lib/format";
import { Package, Store } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Orders() {
  const { data: ordersData, isLoading } = useGetOrders({ role: "buyer" });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment': return <Badge variant="secondary">Pending Payment</Badge>;
      case 'paid': return <Badge className="bg-blue-500">Paid</Badge>;
      case 'shipped': return <Badge className="bg-amber-500">Shipped</Badge>;
      case 'delivered': return <Badge className="bg-teal-500">Delivered</Badge>;
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      case 'disputed': return <Badge variant="destructive">Disputed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : !ordersData || ordersData.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">When you buy items, they will appear here.</p>
          <Button asChild><Link href="/products">Start Shopping</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {ordersData.map(order => (
            <Card key={order.id} className="overflow-hidden hover:border-primary transition-colors">
              <CardContent className="p-0">
                <div className="bg-muted/30 px-6 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-foreground">Order #{order.id}</span>
                    <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
                    <div className="flex items-center gap-1 text-primary">
                      <Store className="w-4 h-4" />
                      <span className="font-medium">{order.seller?.sellerInfo?.shopName || order.seller?.name}</span>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1 space-y-4 w-full">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded flex-shrink-0 overflow-hidden">
                          {item.productImage && <img src={item.productImage} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productName}</h4>
                          <div className="text-sm text-muted-foreground">
                            {item.quantity} x {formatIDR(item.unitPrice)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Payment</div>
                      <div className="font-bold text-xl text-primary">{formatIDR(order.totalAmount)}</div>
                    </div>
                    <Button asChild>
                      <Link href={`/orders/${order.id}`}>View Detail</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
