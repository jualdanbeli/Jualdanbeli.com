import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator, Pressable, RefreshControl,
  ScrollView, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/components/ProductCard";

type Period = "7" | "30" | "90";

function useAnalytics(token: string, period: Period) {
  return useQuery<any>({
    queryKey: ["admin-analytics", period],
    queryFn: async () => {
      const base = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? "jual-beli-aman.replit.app"}`;
      const res = await fetch(`${base}/api/admin/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal");
      return res.json();
    },
    enabled: !!token,
  });
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "7",  label: "7 Hari" },
  { key: "30", label: "30 Hari" },
  { key: "90", label: "90 Hari" },
];

const SUMMARY_CARDS = [
  { key: "totalRevenue",    label: "Total Transaksi",   icon: "dollar-sign", gradient: ["#059669", "#047857"] as [string,string], format: "money" },
  { key: "totalCommission", label: "Komisi Platform",    icon: "percent",     gradient: ["#2563eb", "#1d4ed8"] as [string,string], format: "money" },
  { key: "totalOrders",     label: "Total Pesanan",     icon: "shopping-bag",gradient: ["#7c3aed", "#6d28d9"] as [string,string], format: "count" },
  { key: "totalUsers",      label: "Total Pengguna",    icon: "users",       gradient: ["#ea580c", "#c2410c"] as [string,string], format: "count" },
  { key: "totalSellers",    label: "Penjual Aktif",     icon: "store",       gradient: ["#d97706", "#b45309"] as [string,string], format: "count" },
  { key: "completedOrders", label: "Pesanan Selesai",   icon: "check-circle",gradient: ["#0891b2", "#0e7490"] as [string,string], format: "count" },
];

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={{ height: 6, backgroundColor: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
      <View style={{ height: 6, width: `${pct}%`, backgroundColor: color, borderRadius: 3 }} />
    </View>
  );
}

export default function AdminAnalytics() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [period, setPeriod] = useState<Period>("30");

  const { data, isLoading, refetch, isRefetching } = useAnalytics(token ?? "", period);

  const summary = data?.summary ?? {};
  const chartData: any[] = data?.chartData ?? [];
  const topSellers: any[] = data?.topSellers ?? [];

  const maxRevenue = chartData.length > 0 ? Math.max(...chartData.map((d: any) => d.revenue ?? 0)) : 1;
  const maxOrders = chartData.length > 0 ? Math.max(...chartData.map((d: any) => d.orders ?? 0)) : 1;

  const formatShort = (v: number) => {
    if (v >= 1_000_000_000) return `Rp${(v / 1_000_000_000).toFixed(1)}M`;
    if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000) return `Rp${(v / 1_000).toFixed(0)}rb`;
    return `Rp${v}`;
  };

  const formatDateShort = (d: string) => {
    const dt = new Date(d);
    return `${dt.getDate()}/${dt.getMonth() + 1}`;
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563eb" />}
    >
      {/* Header */}
      <LinearGradient
        colors={["#0f172a", "#1e3a5f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}
      >
        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 4 }}>
          Laporan pertumbuhan & pendapatan platform
        </Text>
        {/* Period selector */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {PERIODS.map(p => (
            <Pressable
              key={p.key}
              onPress={() => setPeriod(p.key)}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
                backgroundColor: period === p.key ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
                borderWidth: period === p.key ? 1 : 0,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#fff" }}>{p.label}</Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={{ alignItems: "center", paddingTop: 60 }}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginTop: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
            Memuat analitik...
          </Text>
        </View>
      ) : (
        <>
          {/* Summary cards */}
          <View style={{ padding: 16, gap: 10 }}>
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 2 }}>
              RINGKASAN {period} HARI TERAKHIR
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {SUMMARY_CARDS.slice(0, 2).map(card => (
                <View key={card.key} style={{ flex: 1 }}>
                  <LinearGradient
                    colors={card.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 14, padding: 14 }}
                  >
                    <Feather name={card.icon as any} size={18} color="rgba(255,255,255,0.85)" />
                    <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 10 }}>
                      {card.format === "money" ? formatShort(summary[card.key] ?? 0) : (summary[card.key] ?? 0).toLocaleString("id-ID")}
                    </Text>
                    <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_500Medium", marginTop: 2 }}>
                      {card.label}
                    </Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {SUMMARY_CARDS.slice(2, 4).map(card => (
                <View key={card.key} style={{ flex: 1 }}>
                  <LinearGradient
                    colors={card.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 14, padding: 14 }}
                  >
                    <Feather name={card.icon as any} size={18} color="rgba(255,255,255,0.85)" />
                    <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 10 }}>
                      {(summary[card.key] ?? 0).toLocaleString("id-ID")}
                    </Text>
                    <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_500Medium", marginTop: 2 }}>
                      {card.label}
                    </Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {SUMMARY_CARDS.slice(4, 6).map(card => (
                <View key={card.key} style={{ flex: 1 }}>
                  <LinearGradient
                    colors={card.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 14, padding: 14 }}
                  >
                    <Feather name={card.icon as any} size={18} color="rgba(255,255,255,0.85)" />
                    <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 10 }}>
                      {(summary[card.key] ?? 0).toLocaleString("id-ID")}
                    </Text>
                    <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_500Medium", marginTop: 2 }}>
                      {card.label}
                    </Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </View>

          {/* Commission rate info */}
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <View style={{
              backgroundColor: "#dbeafe", borderRadius: 14, padding: 14,
              flexDirection: "row", alignItems: "center", gap: 12,
            }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#bfdbfe", alignItems: "center", justifyContent: "center" }}>
                <Feather name="info" size={18} color="#2563eb" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: "#1d4ed8" }}>
                  Komisi Platform: {summary.commissionRate ?? 3}%
                </Text>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: "#2563eb", marginTop: 2 }}>
                  Total komisi dari seluruh transaksi: {formatRupiah(summary.totalCommission ?? 0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Revenue Chart (bar-style) */}
          {chartData.length > 0 && (
            <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 10 }}>
                TREN PENDAPATAN
              </Text>
              <View style={{ backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
                {chartData.slice(-14).map((d: any, i: number) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Text style={{ width: 40, fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                      {formatDateShort(d.date)}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <MiniBar value={d.revenue ?? 0} max={maxRevenue} color="#059669" />
                    </View>
                    <Text style={{ width: 60, fontSize: 10, color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: "right" }}>
                      {formatShort(d.revenue ?? 0)}
                    </Text>
                  </View>
                ))}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <View style={{ width: 12, height: 6, borderRadius: 3, backgroundColor: "#059669" }} />
                  <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Pendapatan per Hari</Text>
                </View>
              </View>
            </View>
          )}

          {/* Orders Chart */}
          {chartData.length > 0 && (
            <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 10 }}>
                VOLUME PESANAN HARIAN
              </Text>
              <View style={{ backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
                {chartData.slice(-14).map((d: any, i: number) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Text style={{ width: 40, fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                      {formatDateShort(d.date)}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <MiniBar value={d.orders ?? 0} max={maxOrders} color="#2563eb" />
                    </View>
                    <Text style={{ width: 40, fontSize: 10, color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: "right" }}>
                      {d.orders ?? 0}
                    </Text>
                  </View>
                ))}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <View style={{ width: 12, height: 6, borderRadius: 3, backgroundColor: "#2563eb" }} />
                  <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Pesanan per Hari</Text>
                </View>
              </View>
            </View>
          )}

          {/* Top Sellers */}
          {topSellers.length > 0 && (
            <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 10 }}>
                TOP 5 PENJUAL TERBAIK
              </Text>
              <View style={{ backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
                {topSellers.map((s: any, i: number) => (
                  <View key={s.sellerId} style={{
                    flexDirection: "row", alignItems: "center", gap: 14,
                    paddingHorizontal: 16, paddingVertical: 12,
                    borderBottomWidth: i < topSellers.length - 1 ? 1 : 0, borderBottomColor: colors.border,
                  }}>
                    <View style={{
                      width: 32, height: 32, borderRadius: 10,
                      backgroundColor: i === 0 ? "#fef3c7" : i === 1 ? "#f3f4f6" : "#ffedd5",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: i === 0 ? "#d97706" : i === 1 ? "#6b7280" : "#ea580c" }}>
                        {i + 1}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: colors.foreground }}>
                        {s.sellerName}
                      </Text>
                      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground }}>
                        {s.orderCount} pesanan · Komisi: {formatRupiah(s.commission ?? 0)}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: "#059669" }}>
                      {formatShort(s.totalSales ?? 0)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
