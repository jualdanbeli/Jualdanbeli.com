import { useGetOrders, useUpdateOrderStatus, getGetOrdersQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatIDR, formatDate } from "@/lib/format";
import { Package, Search, Truck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function SellerOrders() {
  const { data: ordersData, isLoading } = useGetOrders({ role: "seller" });
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [trackingNo, setTrackingNo] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const handleShip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !trackingNo) return;

    updateStatus.mutate({
      orderId: selectedOrderId,
      data: { status: 'shipped', trackingNumber: trackingNo }
    }, {
      onSuccess: () => {
        toast({ title: "Order shipped", description: "Tracking number updated." });
        queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
        setSelectedOrderId(null);
        setTrackingNo("");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-blue-500">Need to Ship</Badge>;
      case 'shipped': return <Badge className="bg-amber-500">Shipped</Badge>;
      case 'delivered': return <Badge className="bg-teal-500">Delivered</Badge>;
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <SellerLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Shop Orders</h1>
          <p className="text-muted-foreground">Manage your incoming orders and shipments.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search order ID..." className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : !ordersData || ordersData.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">When buyers purchase your items, they will appear here.</p>
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
                    <span className="text-muted-foreground">Buyer: <span className="font-medium text-foreground">{order.buyer?.name}</span></span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                <div className="p-6 flex flex-col md:flex-row items-start justify-between gap-6">
                  <div className="flex-1 space-y-4 w-full">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded flex-shrink-0 overflow-hidden">
                          {item.productImage && <img src={item.productImage} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium leading-tight mb-1">{item.productName}</h4>
                          <div className="text-sm text-muted-foreground">
                            {item.quantity} x {formatIDR(item.unitPrice)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto md:w-48 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Income</div>
                      <div className="font-bold text-xl text-primary">{formatIDR(order.totalAmount - order.shippingCost)}</div>
                    </div>
                    
                    {order.status === 'paid' && (
                      <Dialog open={selectedOrderId === order.id} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
                        <DialogTrigger asChild>
                          <Button className="w-full" onClick={() => setSelectedOrderId(order.id)}>
                            <Truck className="w-4 h-4 mr-2" />
                            Ship Order
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ship Order #{order.id}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleShip} className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label>Tracking Number (Resi)</Label>
                              <Input 
                                placeholder="Enter courier tracking number" 
                                value={trackingNo}
                                onChange={(e) => setTrackingNo(e.target.value)}
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full" disabled={updateStatus.isPending}>
                              Confirm Shipment
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}

                    {order.status !== 'paid' && (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/orders/${order.id}`}>View Detail</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </SellerLayout>
  );
}
