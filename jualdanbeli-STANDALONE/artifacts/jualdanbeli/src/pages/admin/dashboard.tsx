import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIDR } from "@/lib/format";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Store, Package, DollarSign, AlertCircle, ShieldAlert,
  TrendingUp, ShoppingBag, Activity, Ban, ShieldOff, Eye,
  UserCheck, Clock, RefreshCw, ArrowRight, Zap, CheckCircle2,
  XCircle, Truck, WalletCards, FileWarning,
} from "lucide-react";
import { useState } from "react";

const API_BASE = "/api";
const getToken = () => localStorage.getItem("token") || "";

function useMonitoring() {
  return useQuery<any>({
    queryKey: ["admin-monitoring"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/monitoring`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return res.json();
    },
    refetchInterval: 30_000,
  });
}

function useDashboardSummary() {
  return useQuery<any>({
    queryKey: ["admin-dashboard-summary"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/dashboard/summary`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return res.json();
    },
  });
}

function useBanAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, action, reason }: { userId: number; action: string; reason: string }) => {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Aksi gagal");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-monitoring"] });
    },
  });
}

function StatCard({ icon: Icon, label, value, sub, color, href, alert }: {
  icon: any; label: string; value: string | number; sub?: string;
  color: string; href?: string; alert?: boolean;
}) {
  const content = (
    <Card className={`hover:shadow-md transition-shadow ${alert ? "border-red-200 bg-red-50/30" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          {alert && <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse">!</span>}
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
        <div className="text-xs font-medium text-gray-600">{label}</div>
        {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
        {href && <div className="text-[10px] text-primary mt-2 flex items-center gap-0.5 font-medium">Lihat Detail <ArrowRight className="w-2.5 h-2.5" /></div>}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    buyer: "bg-blue-100 text-blue-700",
    seller: "bg-purple-100 text-purple-700",
    admin: "bg-slate-100 text-slate-700",
  };
  const labels: Record<string, string> = { buyer: "Pembeli", seller: "Penjual", admin: "Admin" };
  return <Badge variant="outline" className={`text-[10px] ${map[role] || ""}`}>{labels[role] || role}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    suspended: "bg-amber-100 text-amber-700",
    banned: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = { active: "Aktif", suspended: "Suspend", banned: "Banned" };
  return <Badge variant="outline" className={`text-[10px] ${map[status] || ""}`}>{labels[status] || status}</Badge>;
}

export default function AdminDashboard() {
  const { data: mon, isLoading, refetch, isFetching } = useMonitoring();
  const { data: summary } = useDashboardSummary();
  const banAction = useBanAction();
  const { toast } = useToast();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const stats = mon?.platformStats ?? {};
  const recentUsers: any[] = mon?.recentUsers ?? [];
  const fraudAlerts: any[] = mon?.fraudAlerts ?? [];
  const recentBanLogs: any[] = mon?.recentBanLogs ?? [];
  const pendingReports: any[] = mon?.pendingReports ?? [];
  const orderStats: any[] = mon?.orderStats ?? [];

  const handleQuickBan = (userId: number, userName: string) => {
    banAction.mutate({ userId, action: "ban", reason: "fraud" }, {
      onSuccess: () => toast({ title: `✅ ${userName} berhasil di-ban`, description: "Semua produk dan pesanan dibekukan." }),
      onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });
  };

  const handleQuickSuspend = (userId: number, userName: string) => {
    banAction.mutate({ userId, action: "suspend", reason: "fraud" }, {
      onSuccess: () => toast({ title: `⏸ ${userName} disuspend`, description: "Akun dinonaktifkan sementara." }),
      onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });
  };

  const totalOrders24h = orderStats.reduce((s: number, o: any) => s + o.count, 0);
  const completedOrders24h = orderStats.find((o: any) => o.status === "completed")?.count || 0;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🛡️ Dashboard Operator</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor penjual & pembeli secara realtime — NIB 2403240017145 · KBLI 47911
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => { refetch(); setLastRefresh(new Date()); }}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Alert bar */}
      {(stats.pendingReports > 0 || stats.pendingDisputes > 0 || fraudAlerts.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
            <AlertCircle className="w-4 h-4" />
            Butuh Tindakan Segera:
          </div>
          {stats.pendingReports > 0 && (
            <Link href="/admin/reports">
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg cursor-pointer hover:bg-red-600">
                {stats.pendingReports} Laporan Pending
              </span>
            </Link>
          )}
          {stats.pendingDisputes > 0 && (
            <Link href="/admin/disputes">
              <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg cursor-pointer hover:bg-orange-600">
                {stats.pendingDisputes} Sengketa Open
              </span>
            </Link>
          )}
          {fraudAlerts.length > 0 && (
            <Link href="/admin/monitoring">
              <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg cursor-pointer hover:bg-purple-700">
                {fraudAlerts.length} Fraud Alert
              </span>
            </Link>
          )}
          {stats.pendingWithdrawals > 0 && (
            <Link href="/admin/withdrawals">
              <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg cursor-pointer hover:bg-amber-600">
                {stats.pendingWithdrawals} Penarikan Menunggu
              </span>
            </Link>
          )}
        </div>
      )}

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Users} label="Total Pengguna" value={stats.totalUsers ?? "—"} color="bg-blue-100 text-blue-600" href="/admin/users" />
          <StatCard icon={Store} label="Penjual Aktif" value={stats.totalSellers ?? "—"} color="bg-purple-100 text-purple-600" href="/admin/users" />
          <StatCard icon={ShoppingBag} label="Order (24 Jam)" value={totalOrders24h} sub={`${completedOrders24h} selesai`} color="bg-teal-100 text-teal-600" href="/admin/orders" />
          <StatCard icon={DollarSign} label="Revenue" value={formatIDR(summary?.totalRevenue || 0)} color="bg-green-100 text-green-600" href="/admin/analytics" />
          <StatCard icon={FileWarning} label="Laporan Pending" value={stats.pendingReports ?? "—"} color="bg-red-100 text-red-600" href="/admin/reports" alert={(stats.pendingReports || 0) > 0} />
          <StatCard icon={AlertCircle} label="Sengketa Open" value={stats.pendingDisputes ?? "—"} color="bg-orange-100 text-orange-600" href="/admin/disputes" alert={(stats.pendingDisputes || 0) > 0} />
          <StatCard icon={Ban} label="Akun Banned" value={stats.bannedUsers ?? "—"} color="bg-red-100 text-red-700" href="/admin/users" />
          <StatCard icon={WalletCards} label="Penarikan Pending" value={stats.pendingWithdrawals ?? "—"} color="bg-amber-100 text-amber-600" href="/admin/withdrawals" alert={(stats.pendingWithdrawals || 0) > 0} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fraud Alerts */}
        <div className="lg:col-span-1">
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-700">
                <ShieldAlert className="w-4 h-4" />
                🚨 Fraud Alert
                {fraudAlerts.length > 0 && (
                  <Badge className="bg-red-500 text-white text-[10px] ml-auto">{fraudAlerts.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {fraudAlerts.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  Tidak ada fraud alert
                </div>
              ) : (
                <div className="divide-y">
                  {fraudAlerts.slice(0, 5).map((alert: any) => (
                    <div key={alert.user?.id} className="p-3 bg-red-50/50 hover:bg-red-50 transition-colors">
                      <div className="flex items-start gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-xs shrink-0">
                          {alert.user?.name?.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-xs text-gray-800 truncate">{alert.user?.name}</div>
                          <div className="text-[10px] text-gray-500 truncate">{alert.user?.email}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <RoleBadge role={alert.user?.role} />
                            <StatusBadge status={alert.user?.status} />
                          </div>
                        </div>
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          {alert.reportCount}×
                        </span>
                      </div>
                      {alert.user?.status !== "banned" && (
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            className="h-7 text-[10px] flex-1 bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleQuickBan(alert.user.id, alert.user.name)}
                            disabled={banAction.isPending}
                          >
                            <Ban className="w-3 h-3 mr-1" />Ban
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] flex-1 border-amber-400 text-amber-600 hover:bg-amber-50"
                            onClick={() => handleQuickSuspend(alert.user.id, alert.user.name)}
                            disabled={banAction.isPending}
                          >
                            <ShieldOff className="w-3 h-3 mr-1" />Suspend
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {fraudAlerts.length > 5 && (
                    <Link href="/admin/monitoring">
                      <div className="p-3 text-center text-xs text-primary font-medium hover:bg-gray-50 cursor-pointer">
                        Lihat {fraudAlerts.length - 5} fraud alert lainnya →
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order stats 24h */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Order 24 Jam Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { status: "pending", label: "Menunggu Bayar", icon: Clock, color: "text-gray-500 bg-gray-100" },
                  { status: "paid", label: "Dibayar", icon: CheckCircle2, color: "text-blue-600 bg-blue-100" },
                  { status: "shipped", label: "Dikirim", icon: Truck, color: "text-teal-600 bg-teal-100" },
                  { status: "completed", label: "Selesai", icon: CheckCircle2, color: "text-green-600 bg-green-100" },
                  { status: "cancelled", label: "Dibatalkan", icon: XCircle, color: "text-red-600 bg-red-100" },
                ].map(({ status, label, icon: Icon, color }) => {
                  const stat = orderStats.find((o: any) => o.status === status);
                  return (
                    <div key={status} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${color}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="text-xs text-gray-600 flex-1">{label}</span>
                      <span className="text-xs font-bold text-gray-800">{stat?.count ?? 0}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent registrations */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  Registrasi Baru (24 Jam)
                  <Badge variant="secondary" className="ml-1 text-[10px]">{recentUsers.length}</Badge>
                </CardTitle>
                <Link href="/admin/users" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                  Semua <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : recentUsers.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">Belum ada registrasi baru</div>
              ) : (
                <div className="divide-y">
                  {recentUsers.slice(0, 8).map((u: any) => (
                    <div key={u.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {u.name?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs text-gray-800 truncate">{u.name}</div>
                        <div className="text-[10px] text-gray-500 truncate">{u.email}</div>
                      </div>
                      <RoleBadge role={u.role} />
                      <StatusBadge status={u.status} />
                      <div className="text-[10px] text-gray-400 shrink-0">
                        {new Date(u.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent ban actions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldOff className="w-4 h-4 text-red-500" />
                  Aksi Moderasi Terbaru (7 Hari)
                </CardTitle>
                <Link href="/admin/users" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                  Log Lengkap <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentBanLogs.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  Tidak ada aksi moderasi
                </div>
              ) : (
                <div className="divide-y">
                  {recentBanLogs.slice(0, 6).map((log: any) => {
                    const actionMap: Record<string, { label: string; color: string }> = {
                      banned: { label: "Banned", color: "bg-red-100 text-red-700" },
                      suspended: { label: "Suspend", color: "bg-amber-100 text-amber-700" },
                      activated: { label: "Dipulihkan", color: "bg-green-100 text-green-700" },
                    };
                    const action = actionMap[log.action] || { label: log.action, color: "bg-gray-100 text-gray-700" };
                    return (
                      <div key={log.id} className="px-4 py-2.5 flex items-center gap-3">
                        <Badge variant="outline" className={`text-[10px] ${action.color} shrink-0`}>{action.label}</Badge>
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-xs text-gray-800 truncate">{log.user?.name ?? `User #${log.userId}`}</span>
                          <span className="text-[10px] text-gray-400 ml-2">oleh {log.admin?.name}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 shrink-0">
                          {new Date(log.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending reports */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-700">
                  <FileWarning className="w-4 h-4" />
                  Laporan Menunggu Tindakan
                  {pendingReports.length > 0 && <Badge className="bg-red-500 text-white text-[10px]">{pendingReports.length}</Badge>}
                </CardTitle>
                <Link href="/admin/reports" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                  Semua <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {pendingReports.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  Tidak ada laporan pending
                </div>
              ) : (
                <div className="divide-y">
                  {pendingReports.slice(0, 5).map((r: any) => (
                    <div key={r.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-red-50/30 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-gray-800">
                          Laporan: <span className="capitalize">{r.targetType}</span> #{r.targetId}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {r.reason} · oleh {r.reporter?.name || "User"}
                        </div>
                      </div>
                      {r.targetUser && r.targetUser.status !== "banned" && (
                        <Button
                          size="sm"
                          className="h-6 text-[10px] bg-red-600 hover:bg-red-700 text-white px-2"
                          onClick={() => handleQuickBan(r.targetUser.id, r.targetUser.name)}
                          disabled={banAction.isPending}
                        >
                          Ban
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="mt-4 text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
        <Activity className="w-3 h-3" />
        Auto-refresh setiap 30 detik · Terakhir: {lastRefresh.toLocaleTimeString("id-ID")}
      </div>
    </AdminLayout>
  );
}
