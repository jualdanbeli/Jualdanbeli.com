import { useAdminGetOrders } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIDR, formatDateTime } from "@/lib/format";

export default function AdminOrders() {
  const { data: ordersData, isLoading } = useAdminGetOrders({});

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Platform Orders</h1>
        <p className="text-muted-foreground">Monitor all marketplace transactions.</p>
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
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Buyer / Seller</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Escrow Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersData?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.id}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs"><span className="text-muted-foreground">B:</span> {order.buyer?.name}</div>
                        <div className="text-xs"><span className="text-muted-foreground">S:</span> {order.seller?.name}</div>
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatIDR(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{order.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={order.escrowStatus === 'holding' ? 'secondary' : order.escrowStatus === 'refunded' ? 'destructive' : 'outline'} 
                          className="capitalize"
                        >
                          {order.escrowStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!ordersData || ordersData.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No orders found
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
