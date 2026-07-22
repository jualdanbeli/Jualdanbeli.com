import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { JDBLogo } from "@/components/JDBLogo";
import {
  LayoutDashboard, Users, Package, ShoppingBag, AlertTriangle,
  ArrowLeft, LogOut, FileWarning, WalletCards, HeadphonesIcon,
  Tag, BarChart2, Settings, ShieldAlert, Activity, ChevronRight,
  Bell, TrendingUp, ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

function useAdminCounts() {
  return useQuery<any>({
    queryKey: ["admin-monitoring-counts"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/monitoring", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

function NavBadge({ count, color = "red" }: { count: number; color?: "red" | "amber" }) {
  if (!count) return null;
  return (
    <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
      color === "red" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
    }`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { clearToken, user } = useAuth();
  const logoutMutation = useLogout();
  const { data: monData } = useAdminCounts();

  const stats = monData?.platformStats;

  const navGroups = [
    {
      label: "UTAMA",
      items: [
        { icon: LayoutDashboard, label: "Overview", href: "/admin" },
        { icon: Activity, label: "Monitoring Realtime", href: "/admin/monitoring", badge: (stats?.pendingReports || 0) + (stats?.pendingDisputes || 0), badgeColor: "red" as const },
        { icon: BarChart2, label: "Analytics", href: "/admin/analytics" },
      ],
    },
    {
      label: "MODERASI",
      items: [
        { icon: Users, label: "Pengguna", href: "/admin/users", badge: stats?.suspendedUsers || 0, badgeColor: "amber" as const },
        { icon: ShieldAlert, label: "Fraud & Laporan", href: "/admin/reports", badge: stats?.pendingReports || 0, badgeColor: "red" as const },
        { icon: AlertTriangle, label: "Sengketa", href: "/admin/disputes", badge: stats?.pendingDisputes || 0, badgeColor: "red" as const },
      ],
    },
    {
      label: "TRANSAKSI",
      items: [
        { icon: Package, label: "Produk", href: "/admin/products" },
        { icon: ShoppingBag, label: "Pesanan", href: "/admin/orders" },
        { icon: WalletCards, label: "Penarikan Dana", href: "/admin/withdrawals", badge: stats?.pendingWithdrawals || 0, badgeColor: "amber" as const },
      ],
    },
    {
      label: "LAINNYA",
      items: [
        { icon: Tag, label: "Voucher / Kupon", href: "/admin/vouchers" },
        { icon: HeadphonesIcon, label: "CS / Pengaduan", href: "/admin/support" },
        { icon: ShieldCheck, label: "Keamanan Sistem", href: "/admin/security" },
      ],
    },
  ];

  const OWNER_EMAIL = "radjapamungkas007@gmail.com";
  const isOwner = user?.email === OWNER_EMAIL;

  const totalAlerts = (stats?.pendingReports || 0) + (stats?.pendingDisputes || 0) + (stats?.pendingWithdrawals || 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-slate-300 flex-shrink-0 hidden md:flex flex-col">
        {/* Logo */}
        <div className="h-16 border-b border-slate-800 flex items-center px-4 gap-3">
          <JDBLogo size="sm" variant="icon" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm tracking-wide">Admin Portal</div>
            <div className="text-[10px] text-slate-500">{isOwner ? "👑 Pemilik / Operator" : "jualdanbeli operator"}</div>
          </div>
          {totalAlerts > 0 && (
            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
              {totalAlerts}
            </span>
          )}
        </div>

        {/* Admin info */}
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-500">Operator / Admin</div>
            </div>
          </div>
        </div>

        {/* Owner badge */}
        {isOwner && (
          <div className="mx-4 mt-3 mb-1 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">👑 Pemegang Hak Eksklusif</p>
            <p className="text-[10px] text-yellow-400/70 mt-0.5">J&amp;B™ jualdanbeli — Semua hak dilindungi</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-slate-600 px-3 mb-1 tracking-widest">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location === item.href || (location.startsWith(item.href + "/") && item.href !== "/admin");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                        isActive
                          ? "bg-primary/20 text-primary font-semibold"
                          : "hover:bg-slate-800 hover:text-white text-slate-400"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                      <span className="truncate flex-1">{item.label}</span>
                      {item.badge ? <NavBadge count={item.badge} color={item.badgeColor} /> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* OWNER-ONLY section */}
          {isOwner && (
            <div>
              <p className="text-[10px] font-bold text-yellow-600 px-3 mb-1 tracking-widest">👑 OPERATOR (PEMILIK)</p>
              <div className="space-y-0.5">
                {[
                  { href: "/admin/analytics", label: "Analytics Platform" },
                  { href: "/admin/platform-settings", label: "Pengaturan Platform" },
                  { href: "/admin/reports", label: "Laporan Keuangan" },
                ].map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                        isActive
                          ? "bg-yellow-500/20 text-yellow-300 font-semibold"
                          : "hover:bg-yellow-500/10 hover:text-yellow-300 text-yellow-500/70"
                      }`}
                    >
                      <Settings className={`w-4 h-4 shrink-0 ${isActive ? "text-yellow-300" : ""}`} />
                      <span className="truncate flex-1">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 space-y-0.5">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Marketplace
          </Link>
          <button
            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            onClick={() => logoutMutation.mutate(undefined, { onSuccess: clearToken })}
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="h-14 border-b bg-[#0f172a] text-white flex items-center justify-between px-4 md:hidden">
          <span className="font-bold text-sm">Admin Portal</span>
          {totalAlerts > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalAlerts} Alert</span>
          )}
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
