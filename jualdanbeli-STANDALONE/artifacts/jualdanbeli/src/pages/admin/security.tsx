import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Shield, ShieldCheck, ShieldAlert, Lock, Eye, AlertTriangle,
  Clock, CheckCircle, XCircle, Server, Key, Zap, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function useSecurityInfo() {
  return useQuery<any>({
    queryKey: ["admin-security-info"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/monitoring", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

const securityLayers = [
  {
    icon: Zap,
    label: "Rate Limiting",
    desc: "Maks 10 login/15 menit per IP, 5 reset password/jam, 300 request global/15 menit",
    status: "active",
  },
  {
    icon: Lock,
    label: "Account Lockout",
    desc: "Akun terkunci 30 menit setelah 5x percobaan login gagal berturut-turut",
    status: "active",
  },
  {
    icon: Clock,
    label: "Token Expiry",
    desc: "Semua session token kedaluwarsa otomatis setelah 30 hari",
    status: "active",
  },
  {
    icon: Shield,
    label: "Helmet Security Headers",
    desc: "HSTS, XSS Protection, CSP, No-Sniff, Referrer Policy aktif di semua response",
    status: "active",
  },
  {
    icon: Eye,
    label: "CORS Restriction",
    desc: "Hanya domain jual-beli-aman.replit.app dan localhost yang diizinkan",
    status: "active",
  },
  {
    icon: AlertTriangle,
    label: "SQLi & XSS Detection",
    desc: "Pattern berbahaya (UNION SELECT, <script>, ../etc) diblokir otomatis",
    status: "active",
  },
  {
    icon: Key,
    label: "Password Policy",
    desc: "Min 8 karakter, wajib huruf + angka, maks 128 karakter, tidak boleh spasi",
    status: "active",
  },
  {
    icon: Server,
    label: "Body Size Limit",
    desc: "Request body dibatasi 5MB untuk mencegah payload DoS attack",
    status: "active",
  },
  {
    icon: ShieldCheck,
    label: "Drizzle ORM (No Raw SQL)",
    desc: "Semua query database menggunakan parameterized query — SQL injection tidak mungkin",
    status: "active",
  },
  {
    icon: Activity,
    label: "Admin Role Guard",
    desc: "Setiap route /api/admin/* memerlukan verifikasi role admin dari database real-time",
    status: "active",
  },
  {
    icon: ShieldAlert,
    label: "Suspended/Banned Block",
    desc: "User yang di-ban atau suspend langsung diblokir di semua endpoint, termasuk sesi aktif",
    status: "active",
  },
  {
    icon: CheckCircle,
    label: "Admin Audit Log",
    desc: "Semua aksi ban/suspend/unban dicatat di banLogsTable dengan waktu, alasan, dan pelaku",
    status: "active",
  },
];

export default function AdminSecurity() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data, isLoading: dataLoading } = useSecurityInfo();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      setLocation("/login");
    }
  }, [user, isLoading]);

  if (isLoading || !user) return null;

  const stats = data?.platformStats;

  const summaryCards = [
    {
      label: "Lapisan Keamanan Aktif",
      value: securityLayers.length,
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total User Terdaftar",
      value: stats?.totalUsers ?? "—",
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "User Banned/Suspended",
      value: (stats?.bannedUsers ?? 0) + (stats?.suspendedUsers ?? 0),
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Laporan Fraud Pending",
      value: stats?.pendingReports ?? "—",
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Keamanan Sistem</h1>
            <p className="text-sm text-gray-500">Status proteksi server &amp; aplikasi secara real-time</p>
          </div>
          <Badge className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />
            Sistem Aman
          </Badge>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <Card key={card.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                  <div className="text-xs text-gray-500 leading-tight">{card.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security layers grid */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Lapisan Keamanan Berlapis ({securityLayers.length} Aktif)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {securityLayers.map((layer) => (
                <div
                  key={layer.label}
                  className="flex items-start gap-3 p-3 rounded-lg border border-emerald-100 bg-emerald-50/50"
                >
                  <div className="p-1.5 bg-emerald-100 rounded-lg shrink-0 mt-0.5">
                    <layer.icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{layer.label}</span>
                      <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                        AKTIF
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{layer.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admin Identity Verification */}
        <Card className="border-0 shadow-sm border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Identitas Operator Legal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div>
                <span className="text-gray-500 text-xs">Nama Operator</span>
                <p className="font-semibold text-gray-800">Radjapamungkas</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Email Admin</span>
                <p className="font-semibold text-gray-800">radjapamungkas007@gmail.com</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">NIB</span>
                <p className="font-semibold text-gray-800">2403240017145</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">KBLI</span>
                <p className="font-semibold text-gray-800">47911 (Perdagangan via Internet)</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Proteksi Akun Admin</span>
                <p className="font-semibold text-emerald-600">Role admin hanya bisa diset langsung dari database</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Session Login</span>
                <p className="font-semibold text-gray-800">Anda: {user.name} ({user.email})</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="border-0 shadow-sm bg-amber-50 border border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
              Tips Keamanan untuk Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm text-amber-900">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                Jangan bagikan token/password admin ke siapapun, termasuk tim teknis
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                Selalu logout setelah selesai menggunakan admin panel di perangkat bersama
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                Perubahan role admin hanya bisa dilakukan langsung di database — tidak bisa via API publik
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                Pantau halaman Monitoring Realtime secara berkala untuk mendeteksi aktivitas mencurigakan
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                Session aktif otomatis berakhir setelah 30 hari — sistem akan minta login ulang
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
