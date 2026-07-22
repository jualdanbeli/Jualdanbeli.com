import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/format";
import { TrendingUp, Users, ShoppingBag, DollarSign, Award, Percent } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";

type Period = "7" | "30" | "90";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30");

  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/analytics", period],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const summary = data?.summary;
  const chartData = data?.chartData ?? [];
  const topSellers = data?.topSellers ?? [];

  const formatIDRShort = (v: number) => {
    if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}M`;
    if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000) return `Rp ${(v / 1_000).toFixed(0)}rb`;
    return `Rp ${v}`;
  };

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getDate()}/${dt.getMonth() + 1}`;
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Operator</h1>
          <p className="text-muted-foreground text-sm">Laporan pertumbuhan & pendapatan platform</p>
        </div>
        <div className="flex gap-2">
          {(["7", "30", "90"] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}
            >
              {p} Hari
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { icon: DollarSign, label: "Total Transaksi", value: formatIDR(summary?.totalRevenue ?? 0), color: "text-emerald-600", bg: "bg-emerald-100" },
          { icon: Percent, label: `Komisi Platform (${summary?.commissionRate ?? 3}%)`, value: formatIDR(summary?.totalCommission ?? 0), color: "text-blue-600", bg: "bg-blue-100" },
          { icon: ShoppingBag, label: "Total Pesanan", value: `${summary?.totalOrders ?? 0} pesanan`, color: "text-blue-600", bg: "bg-blue-100" },
          { icon: Users, label: "Total Pengguna", value: `${summary?.totalUsers ?? 0} akun`, color: "text-purple-600", bg: "bg-purple-100" },
          { icon: Award, label: "Penjual Aktif", value: `${summary?.totalSellers ?? 0} toko`, color: "text-pink-600", bg: "bg-pink-100" },
          { icon: TrendingUp, label: "Pesanan Selesai", value: `${summary?.completedOrders ?? 0} selesai`, color: "text-teal-600", bg: "bg-teal-100" },
        ].map(card => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
              <p className="text-xl font-bold">{isLoading ? "—" : card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pendapatan & Komisi Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={formatIDRShort} tick={{ fontSize: 11 }} width={70} />
                <Tooltip formatter={(v: number) => formatIDR(v)} labelFormatter={formatDate} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Transaksi" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="commission" name="Komisi" stroke="#f47820" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Volume Pesanan & Pengguna Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={formatDate} />
                <Legend />
                <Bar dataKey="orders" name="Pesanan" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="newUsers" name="User Baru" fill="#a855f7" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 5 Penjual Terbaik</CardTitle>
        </CardHeader>
        <CardContent>
          {topSellers.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">Belum ada data penjual</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Penjual</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Pesanan</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Total Penjualan</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Komisi Platform</th>
                  </tr>
                </thead>
                <tbody>
                  {topSellers.map((s: any, i: number) => (
                    <tr key={s.sellerId} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </div>
                          <span className="font-medium">{s.sellerName}</span>
                        </div>
                      </td>
                      <td className="text-right py-3">{s.orderCount}</td>
                      <td className="text-right py-3 font-medium">{formatIDR(s.totalSales)}</td>
                      <td className="text-right py-3 text-blue-600 font-medium">{formatIDR(s.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
