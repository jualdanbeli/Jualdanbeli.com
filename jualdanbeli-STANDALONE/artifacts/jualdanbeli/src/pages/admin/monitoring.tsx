import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Activity, ShieldAlert, Ban, ShieldOff, ShieldCheck, Eye, RefreshCw,
  UserCheck, Clock, Search, Store, User, AlertTriangle, FileWarning,
  CheckCircle2, XCircle, Truck, History, ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { formatIDR } from "@/lib/format";

const API_BASE = "/api";
const getToken = () => localStorage.getItem("token") || "";

const BAN_REASONS = [
  { value: "fraud", label: "Penipuan / Fraud" },
  { value: "scam", label: "Scam / Menipu Pengguna" },
  { value: "fake_product", label: "Produk Palsu / Tidak Sesuai" },
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Pelecehan / Intimidasi" },
  { value: "fake_account", label: "Akun Palsu" },
  { value: "payment_fraud", label: "Manipulasi Pembayaran" },
  { value: "policy_violation", label: "Melanggar Kebijakan" },
  { value: "other", label: "Lainnya" },
];

function useMonitoring() {
  return useQuery<any>({
    queryKey: ["admin-monitoring-full"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/monitoring`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return res.json();
    },
    refetchInterval: 20_000,
  });
}

function useAllUsers(search: string, role: string, status: string) {
  return useQuery<any>({
    queryKey: ["admin-users-monitor", search, role, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (role !== "all") params.set("role", role);
      if (status !== "all") params.set("status", status);
      const res = await fetch(`${API_BASE}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return res.json();
    },
    staleTime: 10_000,
  });
}

function useBanAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, action, reason, notes }: { userId: number; action: string; reason: string; notes?: string }) => {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ reason, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Aksi gagal");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-monitoring-full"] });
      qc.invalidateQueries({ queryKey: ["admin-users-monitor"] });
      qc.invalidateQueries({ queryKey: ["admin-monitoring"] });
      qc.invalidateQueries({ queryKey: ["admin-monitoring-counts"] });
    },
  });
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

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-500",
    suspended: "bg-amber-500",
    banned: "bg-red-500",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status] || "bg-gray-400"}`} />;
}

type ActionState = { user: any; action: "ban" | "suspend" | "unban" } | null;

export default function AdminMonitoring() {
  const [tab, setTab] = useState("overview");
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionState, setActionState] = useState<ActionState>(null);
  const [reason, setReason] = useState("fraud");
  const [notes, setNotes] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [countdown, setCountdown] = useState(20);

  const { data: mon, isLoading, refetch, isFetching } = useMonitoring();
  const { data: usersData, isLoading: usersLoading } = useAllUsers(userSearch, roleFilter, statusFilter);
  const banAction = useBanAction();
  const { toast } = useToast();

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { setLastRefresh(new Date()); return 20; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const stats = mon?.platformStats ?? {};
  const fraudAlerts: any[] = mon?.fraudAlerts ?? [];
  const recentUsers: any[] = mon?.recentUsers ?? [];
  const pendingReports: any[] = mon?.pendingReports ?? [];
  const recentBanLogs: any[] = mon?.recentBanLogs ?? [];
  const orderStats: any[] = mon?.orderStats ?? [];

  const openAction = (user: any, action: "ban" | "suspend" | "unban") => {
    setActionState({ user, action });
    setReason("fraud");
    setNotes("");
  };

  const executeAction = () => {
    if (!actionState) return;
    banAction.mutate(
      { userId: actionState.user.id, action: actionState.action, reason, notes },
      {
        onSuccess: (data) => {
          toast({ title: "✅ Berhasil!", description: data.message });
          setActionState(null);
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
      }
    );
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Monitoring Realtime
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Pantau aktivitas penjual & pembeli · Auto-refresh setiap 20 detik
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Refresh dalam {countdown}s
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { refetch(); setLastRefresh(new Date()); setCountdown(20); }}
            disabled={isFetching}
            className="gap-1.5 h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alert summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Laporan Pending", value: stats.pendingReports, color: "border-red-200 bg-red-50", textColor: "text-red-700", icon: FileWarning },
          { label: "Fraud Alert", value: fraudAlerts.length, color: "border-orange-200 bg-orange-50", textColor: "text-orange-700", icon: ShieldAlert },
          { label: "Sengketa Open", value: stats.pendingDisputes, color: "border-amber-200 bg-amber-50", textColor: "text-amber-700", icon: AlertTriangle },
          { label: "Akun Diblokir", value: stats.bannedUsers, color: "border-gray-200 bg-gray-50", textColor: "text-gray-700", icon: Ban },
        ].map((item) => (
          <div key={item.label} className={`border rounded-xl p-3 ${item.color}`}>
            <div className="flex items-center gap-2 mb-1">
              <item.icon className={`w-4 h-4 ${item.textColor}`} />
              <span className={`text-xs font-medium ${item.textColor}`}>{item.label}</span>
            </div>
            <div className={`text-2xl font-bold ${item.textColor}`}>{item.value ?? "—"}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1.5">
            👥 Semua Pengguna
          </TabsTrigger>
          <TabsTrigger value="fraud" className="flex items-center gap-1.5">
            🚨 Fraud & Laporan
            {(fraudAlerts.length + pendingReports.length) > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {fraudAlerts.length + pendingReports.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="logs">📋 Log Aksi</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* TAB: OVERVIEW */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Registrasi baru */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                Registrasi Baru (24 Jam)
                <Badge variant="secondary" className="ml-auto text-[10px]">{recentUsers.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-72 overflow-y-auto">
              {isLoading ? <Skeleton className="h-32 m-4" /> : recentUsers.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">Belum ada registrasi baru</div>
              ) : (
                <div className="divide-y">
                  {recentUsers.map((u: any) => (
                    <div key={u.id} className="px-4 py-2.5 flex items-center gap-2.5">
                      <StatusDot status={u.status} />
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                        {u.name?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate">{u.name}</div>
                        <div className="text-[10px] text-gray-500 truncate">{u.email}</div>
                      </div>
                      <RoleBadge role={u.role} />
                      <span className="text-[10px] text-gray-400">
                        {new Date(u.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Status Order (24 Jam)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { status: "pending", label: "Menunggu Pembayaran", icon: Clock, bar: "bg-gray-400" },
                  { status: "paid", label: "Sudah Dibayar", icon: CheckCircle2, bar: "bg-blue-500" },
                  { status: "confirmed", label: "Dikonfirmasi Penjual", icon: Store, bar: "bg-teal-500" },
                  { status: "shipped", label: "Dalam Pengiriman", icon: Truck, bar: "bg-indigo-500" },
                  { status: "completed", label: "Selesai", icon: CheckCircle2, bar: "bg-green-500" },
                  { status: "cancelled", label: "Dibatalkan", icon: XCircle, bar: "bg-red-400" },
                ].map(({ status, label, bar }) => {
                  const stat = orderStats.find((o: any) => o.status === status);
                  const count = stat?.count ?? 0;
                  const maxCount = Math.max(...orderStats.map((o: any) => o.count), 1);
                  return (
                    <div key={status} className="flex items-center gap-2">
                      <div className="text-xs text-gray-600 w-36 shrink-0">{label}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full ${bar} transition-all`} style={{ width: `${(count / maxCount) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Platform stats */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary" />
                Status Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {[
                  { label: "Total Pengguna", value: stats.totalUsers, icon: "👥" },
                  { label: "Penjual", value: stats.totalSellers, icon: "🏪" },
                  { label: "Pembeli", value: stats.totalBuyers, icon: "🛒" },
                  { label: "Banned", value: stats.bannedUsers, icon: "🚫" },
                  { label: "Suspended", value: stats.suspendedUsers, icon: "⏸" },
                  { label: "Penarikan", value: stats.pendingWithdrawals, icon: "💰" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="text-xl font-bold text-gray-900">{s.value ?? "—"}</div>
                    <div className="text-[10px] text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB: USERS */}
      {tab === "users" && (
        <div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari nama, email..."
                className="pl-9 h-9 text-sm"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-36 h-9 text-sm">
                <SelectValue placeholder="Semua Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="buyer">Pembeli</SelectItem>
                <SelectItem value="seller">Penjual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9 text-sm">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="p-4 space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : (
                <div className="divide-y">
                  {(usersData?.data ?? []).map((u: any) => (
                    <div key={u.id} className={`px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${u.status === "banned" ? "bg-red-50/30" : u.status === "suspended" ? "bg-amber-50/30" : ""}`}>
                      <StatusDot status={u.status} />
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {u.name?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                          {u.name}
                          {u.status === "banned" && <Ban className="w-3 h-3 text-red-500" />}
                        </div>
                        <div className="text-[10px] text-gray-500">{u.email}</div>
                        {u.role === "seller" && u.sellerInfo?.shopName && (
                          <div className="text-[10px] text-purple-600 flex items-center gap-0.5 mt-0.5">
                            <Store className="w-2.5 h-2.5" />{u.sellerInfo.shopName}
                          </div>
                        )}
                      </div>
                      <RoleBadge role={u.role} />
                      <div className="text-[10px] text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString("id-ID")}
                      </div>
                      {u.role !== "admin" && (
                        <div className="flex gap-1 shrink-0">
                          {u.status !== "active" && (
                            <Button size="sm" variant="outline" className="h-7 px-2 text-green-600 border-green-300 hover:bg-green-50 text-[10px]" onClick={() => openAction(u, "unban")}>
                              <ShieldCheck className="w-3 h-3 mr-0.5" />Pulihkan
                            </Button>
                          )}
                          {u.status === "active" && (
                            <Button size="sm" variant="outline" className="h-7 px-2 text-amber-600 border-amber-300 hover:bg-amber-50 text-[10px]" onClick={() => openAction(u, "suspend")}>
                              <ShieldOff className="w-3 h-3 mr-0.5" />Suspend
                            </Button>
                          )}
                          {u.status !== "banned" && (
                            <Button size="sm" className="h-7 px-2 bg-red-600 hover:bg-red-700 text-white text-[10px]" onClick={() => openAction(u, "ban")}>
                              <Ban className="w-3 h-3 mr-0.5" />Ban
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!usersData?.data || usersData.data.length === 0) && (
                    <div className="text-center py-12 text-sm text-gray-400">Tidak ada pengguna ditemukan</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB: FRAUD */}
      {tab === "fraud" && (
        <div className="space-y-5">
          {/* Fraud alerts */}
          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                <ShieldAlert className="w-4 h-4" />
                🚨 Pengguna Dilaporkan Berkali-kali
                {fraudAlerts.length > 0 && <Badge className="bg-red-500 text-white text-[10px]">{fraudAlerts.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {fraudAlerts.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-400" />
                  <p className="text-sm text-gray-400">Tidak ada fraud alert aktif</p>
                </div>
              ) : (
                <div className="divide-y">
                  {fraudAlerts.map((alert: any) => (
                    <div key={alert.user?.id} className="px-4 py-4 bg-red-50/30 hover:bg-red-50/60 transition-colors">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold shrink-0">
                          {alert.user?.name?.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm text-gray-800">{alert.user?.name}</div>
                          <div className="text-xs text-gray-500">{alert.user?.email}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <RoleBadge role={alert.user?.role} />
                            <Badge variant="outline" className="text-[10px] bg-red-100 text-red-700 border-red-200">
                              {alert.reportCount}× Dilaporkan
                            </Badge>
                          </div>
                        </div>
                        {alert.user?.status !== "banned" && (
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              className="h-8 bg-red-600 hover:bg-red-700 text-white text-xs"
                              onClick={() => openAction(alert.user, "ban")}
                            >
                              <Ban className="w-3.5 h-3.5 mr-1" />Ban Sekarang
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-amber-600 border-amber-400 hover:bg-amber-50 text-xs"
                              onClick={() => openAction(alert.user, "suspend")}
                            >
                              <ShieldOff className="w-3.5 h-3.5 mr-1" />Suspend
                            </Button>
                          </div>
                        )}
                        {alert.user?.status === "banned" && (
                          <Badge className="bg-red-500 text-white text-[10px]">BANNED</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending reports */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-red-500" />
                Laporan Belum Ditangani
                {pendingReports.length > 0 && <Badge className="bg-red-500 text-white text-[10px]">{pendingReports.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pendingReports.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-400" />
                  <p className="text-sm text-gray-400">Tidak ada laporan pending</p>
                </div>
              ) : (
                <div className="divide-y">
                  {pendingReports.map((r: any) => (
                    <div key={r.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800">
                            Laporan <span className="capitalize text-primary">{r.targetType}</span>
                            {r.targetUser && <span className="ml-1 text-gray-600">: {r.targetUser.name}</span>}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Alasan: <strong>{r.reason}</strong>
                            {r.reporter && <span className="ml-2">· Dilaporkan oleh: {r.reporter.name}</span>}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(r.createdAt).toLocaleString("id-ID")}
                          </div>
                        </div>
                        {r.targetUser && r.targetUser.status !== "banned" && (
                          <div className="flex gap-1.5 shrink-0">
                            <Button
                              size="sm"
                              className="h-7 px-2 text-[10px] bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => openAction(r.targetUser, "ban")}
                            >
                              <Ban className="w-3 h-3 mr-0.5" />Ban
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[10px] text-amber-600 border-amber-300"
                              onClick={() => openAction(r.targetUser, "suspend")}
                            >
                              Suspend
                            </Button>
                          </div>
                        )}
                        {r.targetUser?.status === "banned" && (
                          <Badge className="bg-red-500 text-white text-[10px] shrink-0">BANNED</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB: LOGS */}
      {tab === "logs" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Log Tindakan Moderasi (7 Hari Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : recentBanLogs.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-400">Belum ada aksi moderasi</div>
            ) : (
              <div className="divide-y">
                {recentBanLogs.map((log: any) => {
                  const actionMap: Record<string, { label: string; color: string; icon: any }> = {
                    banned: { label: "BANNED", color: "bg-red-100 text-red-700 border-red-200", icon: Ban },
                    suspended: { label: "SUSPEND", color: "bg-amber-100 text-amber-700 border-amber-200", icon: ShieldOff },
                    activated: { label: "DIPULIHKAN", color: "bg-green-100 text-green-700 border-green-200", icon: ShieldCheck },
                  };
                  const a = actionMap[log.action] || { label: log.action, color: "bg-gray-100 text-gray-700", icon: Activity };
                  return (
                    <div key={log.id} className="px-4 py-3 flex items-center gap-3">
                      <Badge variant="outline" className={`text-[10px] ${a.color} shrink-0`}>{a.label}</Badge>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-800">
                          {log.user?.name ?? `User #${log.userId}`}
                          <span className="text-xs text-gray-500 font-normal ml-1.5">({log.user?.email})</span>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          oleh: {log.admin?.name} · {log.reason}
                          {log.notes && <span className="italic ml-1">· "{log.notes}"</span>}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400 shrink-0">
                        {new Date(log.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <Dialog open={!!actionState} onOpenChange={(o) => !o && setActionState(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${
              actionState?.action === "ban" ? "text-red-600" :
              actionState?.action === "suspend" ? "text-amber-600" : "text-green-600"
            }`}>
              {actionState?.action === "ban" && <><Ban className="w-5 h-5" />Ban Permanen</>}
              {actionState?.action === "suspend" && <><ShieldOff className="w-5 h-5" />Suspend Akun</>}
              {actionState?.action === "unban" && <><ShieldCheck className="w-5 h-5" />Pulihkan Akun</>}
            </DialogTitle>
            <DialogDescription>
              Pengguna: <strong>{actionState?.user?.name}</strong> ({actionState?.user?.email})
            </DialogDescription>
          </DialogHeader>

          {actionState?.action === "ban" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              <p className="font-bold flex items-center gap-1.5 mb-1.5"><AlertTriangle className="w-3.5 h-3.5" />Efek Ban Permanen:</p>
              <ul className="space-y-0.5 list-disc ml-4">
                <li>Akun langsung diblokir — tidak bisa login</li>
                {actionState?.user?.role === "seller" && <><li>Semua produk aktif disembunyikan</li><li>Pesanan berjalan dibatalkan</li></>}
                <li>Saldo wallet dibekukan</li>
                <li>Notifikasi dikirim ke pengguna</li>
              </ul>
            </div>
          )}

          {actionState?.action !== "unban" && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-1 block">Alasan <span className="text-red-500">*</span></Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BAN_REASONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Catatan internal (opsional)</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="text-sm min-h-[70px]" placeholder="Detail bukti atau konteks..." />
              </div>
            </div>
          )}

          {actionState?.action === "unban" && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
              Akun akan diaktifkan kembali dan saldo yang dibekukan dikembalikan.
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setActionState(null)}>Batal</Button>
            <Button
              className={`flex-1 text-white ${actionState?.action === "ban" ? "bg-red-600 hover:bg-red-700" : actionState?.action === "suspend" ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}`}
              onClick={executeAction}
              disabled={banAction.isPending || (actionState?.action !== "unban" && !reason)}
            >
              {banAction.isPending ? "Memproses..." : actionState?.action === "ban" ? "Konfirmasi Ban" : actionState?.action === "suspend" ? "Konfirmasi Suspend" : "Pulihkan Akun"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
