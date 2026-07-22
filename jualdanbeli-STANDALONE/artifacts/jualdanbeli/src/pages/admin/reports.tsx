import { useGetReports, useResolveReport, getGetReportsQueryKey, ReportResolutionStatus } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileWarning, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/format";

export default function AdminReports() {
  const { data: reports, isLoading } = useGetReports({});
  const resolveReport = useResolveReport();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [status, setStatus] = useState<ReportResolutionStatus>("resolved");
  const [resolution, setResolution] = useState("");

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !resolution) return;

    resolveReport.mutate({
      reportId: selectedReport,
      data: { status, resolution }
    }, {
      onSuccess: () => {
        toast({ title: "Report processed successfully" });
        queryClient.invalidateQueries({ queryKey: getGetReportsQueryKey() });
        setSelectedReport(null);
        setResolution("");
      }
    });
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Reports Moderation</h1>
        <p className="text-muted-foreground">Handle user reports for fraud, spam, and inappropriate content.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : !reports || reports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <FileWarning className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No active reports</h2>
          <p className="text-muted-foreground">The community is well-behaved today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map(report => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="uppercase">{report.targetType}</Badge>
                      <h3 className="font-bold text-lg">ID: {report.targetId}</h3>
                      <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'}>{report.status}</Badge>
                    </div>
                    <div className="text-sm font-medium text-destructive mb-1">
                      Reason: <span className="capitalize">{report.reason.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {report.description || "No description provided."}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      Reported on {formatDateTime(report.createdAt)}
                    </div>
                  </div>
                  
                  {report.status === 'pending' || report.status === 'investigating' ? (
                    <Dialog open={selectedReport === report.id} onOpenChange={(open) => !open && setSelectedReport(null)}>
                      <DialogTrigger asChild>
                        <Button className="shrink-0" variant="outline" onClick={() => setSelectedReport(report.id)}>Process Report</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Process Report</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleResolve} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Action Taken</Label>
                            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select outcome" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="resolved">Action Taken (Resolved)</SelectItem>
                                <SelectItem value="dismissed">No Action Needed (Dismiss)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Resolution Notes</Label>
                            <Textarea 
                              placeholder="Notes on the action taken..." 
                              value={resolution}
                              onChange={(e) => setResolution(e.target.value)}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={resolveReport.isPending}>
                            Submit Resolution
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="text-right text-sm">
                      <div className="font-semibold text-green-600 mb-1 flex items-center justify-end"><Check className="w-4 h-4 mr-1" /> Processed</div>
                      <div className="text-muted-foreground italic max-w-xs">{report.resolution}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
