import { useAdminGetWithdrawals, useAdminProcessWithdrawal, getAdminGetWithdrawalsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIDR, formatDateTime } from "@/lib/format";
import { Check, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminWithdrawals() {
  // We mock the API call since the endpoint exists but we might need dummy data
  // Using the actual hook, it will work if implemented on backend
  const { data: withdrawals, isLoading } = useAdminGetWithdrawals({});
  const processWithdrawal = useAdminProcessWithdrawal();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleProcess = (id: number, status: 'approved' | 'rejected') => {
    processWithdrawal.mutate({
      withdrawalId: id,
      data: { status, notes: `Processed by admin` }
    }, {
      onSuccess: () => {
        toast({ title: `Withdrawal ${status}` });
        queryClient.invalidateQueries({ queryKey: getAdminGetWithdrawalsQueryKey() });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Withdrawal Requests</h1>
        <p className="text-muted-foreground">Approve or reject seller fund withdrawals.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Seller / Account</TableHead>
                    <TableHead>Bank Details</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Assuming the transaction model is returned for withdrawals */}
                  {withdrawals?.map((req: any) => (
                    <TableRow key={req.id}>
                      <TableCell className="text-sm">
                        {formatDateTime(req.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">User #{req.userId || 'Unknown'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{req.description?.split('-')?.[0] || 'Bank'}</span>
                          <br />
                          <span className="text-muted-foreground text-xs">{req.description}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        {formatIDR(req.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={req.status === 'completed' ? 'secondary' : req.status === 'rejected' ? 'destructive' : 'outline'} 
                          className="capitalize"
                        >
                          {req.status === 'completed' ? 'approved' : req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleProcess(req.id, 'rejected')}
                              disabled={processWithdrawal.isPending}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleProcess(req.id, 'approved')}
                              disabled={processWithdrawal.isPending}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!withdrawals || withdrawals.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No withdrawal requests found
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
