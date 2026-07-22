import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminGetUsers, getAdminGetUsersQueryKey } from "@workspace/api-client-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/format";
import { useState } from "react";
import {
  Search, Ban, ShieldOff, ShieldCheck, History, AlertTriangle,
  User, Store, ShoppingBag, ChevronRight, X, Package, Wallet
} from "lucide-react";

const API_BASE = "/api";
const getToken = () => localStorage.getItem("token") || "";

const BAN_REASONS = [
  { value: "fraud", label: "Penipuan / Fraud" },
  { value: "spam", label: "Spam" },
  { value: "fake_product", label: "Produk Palsu / Tidak Sesuai" },
  { value: "scam", label: "Scam / Menipu Pengguna" },
  { value: "harassment", label: "Pelecehan / Intimidasi" },
  { value: "fake_account", label: "Akun Palsu" },
  { value: "payment_fraud", label: "Manipulasi Pembayaran" },
  { value: "policy_violation", label: "Melanggar Kebijakan Platform" },
  { value: "other", label: "Lainnya" },
];

type ActionType = "ban" | "suspend" | "unban" | null;

function useBanAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, action, reason, notes }: { userId: number; action: ActionType; reason?: string; notes?: string }) => {
      const endpoint = action === "unban" ? "unban" : action === "ban" ? "ban" : "suspend";
      const res = await fetch(`${API_BASE}/admin/users/${userId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ reason, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Aksi gagal");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
      qc.invalidateQueries({ queryKey: ["ban-logs"] });
    },
  });
}

function useBanLogs() {
  return useQuery<any[]>({
    queryKey: ["ban-logs"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/ban-logs`, { headers: { Authorization: `Bearer ${getToken()}` } });
      return res.json();
    },
  });
}

function useUserBanLogs(userId: number, enabled: boolean) {
  return useQuery<any[]>({
    queryKey: ["ban-logs", userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/ban-logs`, { headers: { Authorization: `Bearer ${getToken()}` } });
      return res.json();
    },
    enabled,
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: "Aktif", className: "bg-green-100 text-green-700 border-green-200" },
    suspended: { label: "Suspend", className: "bg-amber-100 text-amber-700 border-amber-200" },
    banned: { label: "Banned", className: "bg-red-100 text-red-700 border-red-200" },
  };
  const s = map[status] || { label: status, className: "bg-muted text-muted-foreground" };
  return <Badge variant="outline" className={`${s.className} font-semibold`}>{s.label}</Badge>;
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    buyer: "bg-blue-100 text-blue-700",
    seller: "bg-purple-100 text-purple-700",
    admin: "bg-blue-100 text-blue-700",
  };
  return <Badge variant="outline" className={`${map[role] || ""} capitalize text-xs`}>{role}</Badge>;
}

function ActionBadge({ action }: { action: string }) {
  const map: Record<string, string> = {
    banned: "bg-red-100 text-red-700",
    suspended: "bg-amber-100 text-amber-700",
    activated: "bg-green-100 text-green-700",
  };
  const labels: Record<string, string> = { banned: "Dibanned", suspended: "Disuspend", activated: "Diaktifkan" };
  return <Badge variant="outline" className={`${map[action] || ""} text-xs`}>{labels[action] || action}</Badge>;
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<"users" | "logs">("users");

  // Action dialog state
  const [actionTarget, setActionTarget] = useState<any | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  // History dialog state
  const [historyUser, setHistoryUser] = useState<any | null>(null);

  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: usersData, isLoading } = useAdminGetUsers({
    q: search || undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    page,
  });

  const { data: banLogs, isLoading: logsLoading } = useBanLogs();
  const { data: userBanLogs } = useUserBanLogs(historyUser?.id, !!historyUser);

  const banAction = useBanAction();

  const openAction = (user: any, type: ActionType) => {
    setActionTarget(user);
    setActionType(type);
    setReason("");
    setNotes("");
  };

  const handleExecute = () => {
    if (!actionTarget || !actionType) return;
    if (actionType !== "unban" && !reason) {
      toast({ title: "Pilih alasan terlebih dahulu", variant: "destructive" }); return;
    }
    banAction.mutate({ userId: actionTarget.id, action: actionType, reason, notes }, {
      onSuccess: (data) => {
        toast({ title: "Berhasil!", description: data.message });
        setActionTarget(null);
        setActionType(null);
      },
      onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });
  };

  const banLogsList = Array.isArray(banLogs) ? banLogs : [];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manajemen Pengguna & Moderasi</h1>
        <p className="text-muted-foreground text-sm mt-1">Kelola pengguna, suspend, dan ban akun yang melanggar ketentuan platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Pengguna", value: usersData?.total ?? "—", icon: User, color: "text-blue-600" },
          { label: "Penjual", value: "—", icon: Store, color: "text-purple-600" },
          { label: "Tindakan Moderat.", value: banLogsList.length, icon: ShieldOff, color: "text-amber-600" },
          { label: "Aksi Ban Terbaru", value: banLogsList.filter((l: any) => l.action === "banned").length, icon: Ban, color: "text-red-600" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <s.icon className={`w-8 h-8 ${s.color} opacity-80`} />
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-4">
        <TabsList>
          <TabsTrigger value="users">Daftar Pengguna</TabsTrigger>
          <TabsTrigger value="logs">Log Moderasi</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "users" && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Cari nama atau email..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="flex gap-2">
              {["all", "active", "suspended", "banned"].map(s => (
                <Button
                  key={s}
                  size="sm"
                  variant={statusFilter === s ? "default" : "outline"}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className="capitalize"
                >
                  {s === "all" ? "Semua" : s === "active" ? "Aktif" : s === "suspended" ? "Suspend" : "Banned"}
                </Button>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Pengguna</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Bergabung</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Tindakan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData?.data.map((user: any) => (
                      <TableRow key={user.id} className={user.status === "banned" ? "bg-red-50/40" : user.status === "suspended" ? "bg-amber-50/40" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                              user.status === "banned" ? "bg-red-100 text-red-700" :
                              user.status === "suspended" ? "bg-amber-100 text-amber-700" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {(user.name || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-sm flex items-center gap-1.5">
                                {user.name}
                                {user.status === "banned" && <Ban className="w-3.5 h-3.5 text-red-500" />}
                              </div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                              {user.role === "seller" && user.sellerInfo?.shopName && (
                                <div className="text-xs text-purple-600 mt-0.5 flex items-center gap-1">
                                  <Store className="w-3 h-3" />{user.sellerInfo.shopName}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><RoleBadge role={user.role} /></TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell><StatusBadge status={user.status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-muted-foreground hover:text-foreground"
                              onClick={() => setHistoryUser(user)}
                              title="Riwayat moderasi"
                            >
                              <History className="w-4 h-4" />
                            </Button>
                            {user.role !== "admin" && (
                              <>
                                {user.status !== "active" && (
                                  <Button size="sm" variant="ghost" className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => openAction(user, "unban")} title="Pulihkan akun">
                                    <ShieldCheck className="w-4 h-4" />
                                  </Button>
                                )}
                                {user.status === "active" && (
                                  <Button size="sm" variant="ghost" className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => openAction(user, "suspend")} title="Suspend">
                                    <ShieldOff className="w-4 h-4" />
                                  </Button>
                                )}
                                {user.status !== "banned" && (
                                  <Button size="sm" variant="ghost" className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => openAction(user, "ban")} title="Ban permanen">
                                    <Ban className="w-4 h-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!usersData?.data || usersData.data.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          Tidak ada pengguna ditemukan
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {usersData && usersData.total > 20 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button>
              <span className="text-sm text-muted-foreground flex items-center px-3">Halaman {page}</span>
              <Button size="sm" variant="outline" disabled={page * 20 >= usersData.total} onClick={() => setPage(p => p + 1)}>Berikutnya</Button>
            </div>
          )}
        </>
      )}

      {tab === "logs" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-5 h-5" />Log Semua Tindakan Moderasi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {logsLoading ? (
              <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : banLogsList.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">Belum ada tindakan moderasi</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Tindakan</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banLogsList.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{log.user?.name}</div>
                        <div className="text-xs text-muted-foreground">{log.user?.email}</div>
                      </TableCell>
                      <TableCell><ActionBadge action={log.action} /></TableCell>
                      <TableCell>
                        <div className="text-sm">{log.reasonLabel}</div>
                        {log.notes && <div className="text-xs text-muted-foreground italic mt-0.5">"{log.notes}"</div>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.admin?.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Dialog (Ban / Suspend / Unban) */}
      <Dialog open={!!actionTarget} onOpenChange={(open) => !open && setActionTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${
              actionType === "ban" ? "text-red-600" :
              actionType === "suspend" ? "text-amber-600" : "text-green-600"
            }`}>
              {actionType === "ban" && <><Ban className="w-5 h-5" />Ban Permanen</>}
              {actionType === "suspend" && <><ShieldOff className="w-5 h-5" />Suspend Akun</>}
              {actionType === "unban" && <><ShieldCheck className="w-5 h-5" />Pulihkan Akun</>}
            </DialogTitle>
            <DialogDescription>
              Pengguna: <strong>{actionTarget?.name}</strong> ({actionTarget?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Cascade warning for ban */}
            {actionType === "ban" && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />Efek Ban Permanen:
                </p>
                <ul className="space-y-1 text-red-700 ml-5 list-disc text-xs">
                  <li>Akun langsung diblokir — tidak bisa login</li>
                  {actionTarget?.role === "seller" && (
                    <>
                      <li>Semua produk aktif akan <strong>disembunyikan</strong></li>
                      <li>Pesanan yang sedang berjalan akan <strong>dibatalkan</strong></li>
                    </>
                  )}
                  {actionTarget?.role === "buyer" && (
                    <li>Pesanan yang sedang berjalan akan <strong>dibatalkan</strong></li>
                  )}
                  <li>Saldo wallet akan <strong>dibekukan</strong></li>
                  <li>Notifikasi dikirim ke pengguna</li>
                  <li>Tindakan ini tercatat di log moderasi</li>
                </ul>
              </div>
            )}
            {actionType === "suspend" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                <p className="font-semibold text-amber-700 flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4" />Efek Suspend:
                </p>
                <ul className="space-y-1 text-amber-700 ml-5 list-disc text-xs">
                  <li>Akun tidak bisa login sementara</li>
                  {actionTarget?.role === "seller" && <li>Produk aktif akan disembunyikan sementara</li>}
                  <li>Bisa dipulihkan kapan saja oleh admin</li>
                </ul>
              </div>
            )}
            {actionType === "unban" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
                <p className="font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />Efek Pemulihan:
                </p>
                <ul className="space-y-1 ml-5 list-disc text-xs mt-1">
                  <li>Akun diaktifkan kembali</li>
                  <li>Saldo wallet yang dibekukan dikembalikan</li>
                  <li>Notifikasi dikirim ke pengguna</li>
                </ul>
              </div>
            )}

            {actionType !== "unban" && (
              <div className="space-y-2">
                <Label>Alasan <span className="text-red-500">*</span></Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih alasan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BAN_REASONS.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Catatan Internal (opsional)</Label>
              <Textarea
                placeholder="Tambahkan detail bukti atau konteks untuk rekaman internal..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setActionTarget(null)}>
                Batal
              </Button>
              <Button
                className={`flex-1 ${
                  actionType === "ban" ? "bg-red-600 hover:bg-red-700" :
                  actionType === "suspend" ? "bg-amber-600 hover:bg-amber-700" :
                  "bg-green-600 hover:bg-green-700"
                } text-white`}
                onClick={handleExecute}
                disabled={banAction.isPending || (actionType !== "unban" && !reason)}
              >
                {banAction.isPending ? "Memproses..." :
                  actionType === "ban" ? "Konfirmasi Ban" :
                  actionType === "suspend" ? "Konfirmasi Suspend" : "Pulihkan Akun"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Ban History Dialog */}
      <Dialog open={!!historyUser} onOpenChange={(open) => !open && setHistoryUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />Riwayat Moderasi
            </DialogTitle>
            <DialogDescription>
              {historyUser?.name} · {historyUser?.email}
            </DialogDescription>
          </DialogHeader>
          {!userBanLogs || userBanLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Belum ada riwayat moderasi untuk pengguna ini
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {userBanLogs.map((log: any) => (
                <div key={log.id} className={`p-3 rounded-xl border text-sm ${
                  log.action === "banned" ? "bg-red-50 border-red-200" :
                  log.action === "suspended" ? "bg-amber-50 border-amber-200" :
                  "bg-green-50 border-green-200"
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <ActionBadge action={log.action} />
                    <span className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</span>
                  </div>
                  <div className="font-medium">{log.reasonLabel}</div>
                  {log.notes && <div className="text-xs text-muted-foreground mt-1 italic">"{log.notes}"</div>}
                  <div className="text-xs text-muted-foreground mt-1">Oleh: {log.admin?.name}</div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
