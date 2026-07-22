import { useAdminGetDisputes, useAdminResolveDispute, getAdminGetDisputesQueryKey, DisputeResolutionOutcome } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Scale } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/format";

export default function AdminDisputes() {
  const { data: disputes, isLoading } = useAdminGetDisputes();
  const resolveDispute = useAdminResolveDispute();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedDispute, setSelectedDispute] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<DisputeResolutionOutcome>("resolved_buyer");
  const [ruling, setRuling] = useState("");

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !ruling) return;

    resolveDispute.mutate({
      disputeId: selectedDispute,
      data: { outcome, ruling }
    }, {
      onSuccess: () => {
        toast({ title: "Dispute resolved successfully" });
        queryClient.invalidateQueries({ queryKey: getAdminGetDisputesQueryKey() });
        setSelectedDispute(null);
        setRuling("");
      }
    });
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Dispute Resolution</h1>
        <p className="text-muted-foreground">Manage and resolve transaction disputes between buyers and sellers.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : !disputes || disputes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No active disputes</h2>
          <p className="text-muted-foreground">All transactions are proceeding smoothly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map(dispute => (
            <Card key={dispute.id} className="border-red-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h3 className="font-bold text-lg">Order #{dispute.orderId}</h3>
                      <Badge variant="destructive">{dispute.status}</Badge>
                    </div>
                    <div className="text-sm font-medium">Reason: <span className="capitalize">{dispute.reason.replace(/_/g, ' ')}</span></div>
                    <div className="text-sm text-muted-foreground mt-1">Filed: {formatDateTime(dispute.createdAt)}</div>
                  </div>
                  
                  {dispute.status === 'open' || dispute.status === 'investigating' ? (
                    <Dialog open={selectedDispute === dispute.id} onOpenChange={(open) => !open && setSelectedDispute(null)}>
                      <DialogTrigger asChild>
                        <Button className="shrink-0" onClick={() => setSelectedDispute(dispute.id)}>Resolve Dispute</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Resolve Dispute for Order #{dispute.orderId}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleResolve} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Resolution Outcome</Label>
                            <Select value={outcome} onValueChange={(v: any) => setOutcome(v)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select outcome" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="resolved_buyer">Favor Buyer (Refund)</SelectItem>
                                <SelectItem value="resolved_seller">Favor Seller (Release Funds)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Ruling Explanation</Label>
                            <Textarea 
                              placeholder="Explain the decision..." 
                              value={ruling}
                              onChange={(e) => setRuling(e.target.value)}
                              required
                              className="min-h-[100px]"
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={resolveDispute.isPending}>
                            Confirm Resolution
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="text-right">
                      <Badge className="bg-green-500 mb-1"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</Badge>
                    </div>
                  )}
                </div>
                
                <div className="bg-muted p-4 rounded-lg text-sm">
                  <span className="font-semibold block mb-1">Buyer's Description:</span>
                  {dispute.description || "No additional description provided."}
                </div>
                
                {dispute.ruling && (
                  <div className="bg-blue-50 text-blue-900 border border-blue-200 p-4 rounded-lg text-sm mt-4">
                    <span className="font-semibold block mb-1">Admin Ruling:</span>
                    {dispute.ruling}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
