import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator, RefreshControl, ScrollView, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

function useMonitoring() {
  const { token } = useAuth();
  return useQuery<any>({
    queryKey: ["admin-monitoring-detail"],
    queryFn: async () => {
      const base = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? "jual-beli-aman.replit.app"}`;
      const res = await fetch(`${base}/api/admin/monitoring`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal");
      return res.json();
    },
    refetchInterval: 15_000,
    enabled: !!token,
  });
}

interface MetricRowProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bg: string;
  isLast?: boolean;
}

function MetricRow({ label, value, icon, color, bg, isLast }: MetricRowProps) {
  const colors = useColors();
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", gap: 14,
      paddingVertical: 13, paddingHorizontal: 16,
      borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.border,
    }}>
      <View style={{
        width: 38, height: 38, borderRadius: 11,
        backgroundColor: bg, alignItems: "center", justifyContent: "center",
      }}>
        <Feather name={icon as any} size={17} color={color} />
      </View>
      <Text style={{ flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: colors.foreground }}>
        {label}
      </Text>
      <Text style={{ fontFamily: "Inter_700Bold", fontSize: 18, color }}>
        {value}
      </Text>
    </View>
  );
}

interface FraudCardProps {
  name: string;
  reason: string;
  index: number;
  total: number;
}

function FraudCard({ name, reason, index, total }: FraudCardProps) {
  const colors = useColors();
  return (
    <View style={{
      flexDirection: "row", gap: 12,
      paddingVertical: 12, paddingHorizontal: 16,
      borderBottomWidth: index < total - 1 ? 1 : 0,
      borderBottomColor: "rgba(239,68,68,0.15)",
    }}>
      <View style={{
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: "#fee2e2", alignItems: "center", justifyContent: "center",
        marginTop: 1,
      }}>
        <Feather name="alert-circle" size={15} color="#dc2626" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: "#991b1b" }}>
          {name}
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: "#dc2626", marginTop: 2 }}>
          {reason}
        </Text>
      </View>
    </View>
  );
}

export default function AdminMonitoringScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useMonitoring();

  const stats = data?.platformStats ?? {};
  const fraudAlerts: any[] = data?.fraudAlerts ?? [];
  const recentBanLogs: any[] = data?.recentBanLogs ?? [];
  const pendingReports: any[] = data?.pendingReports ?? [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
          Memuat data live...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563eb" />}
    >
      {/* Live Banner */}
      <LinearGradient
        colors={["#0f172a", "#1e3a5f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flexDirection: "row", alignItems: "center", gap: 10,
          paddingHorizontal: 20, paddingVertical: 14,
        }}
      >
        <View style={{
          width: 10, height: 10, borderRadius: 5, backgroundColor: "#22c55e",
        }} />
        <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 13, flex: 1 }}>
          Live Monitoring · Update setiap 15 detik
        </Text>
        <View style={{
          backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8,
          paddingHorizontal: 10, paddingVertical: 4,
        }}>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Inter_400Regular" }}>
            Auto-refresh
          </Text>
        </View>
      </LinearGradient>

      {/* Statistik Platform */}
      <View style={{ padding: 16 }}>
        <Text style={{
          fontSize: 11, fontFamily: "Inter_700Bold",
          color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 10,
        }}>
          STATISTIK PLATFORM
        </Text>
        <View style={{
          backgroundColor: colors.card, borderRadius: 16,
          borderWidth: 1, borderColor: colors.border, overflow: "hidden",
        }}>
          <MetricRow label="Total Pengguna" value={stats.totalUsers ?? 0} icon="users" color="#2563eb" bg="#dbeafe" />
          <MetricRow label="Pengguna Aktif" value={stats.activeUsers ?? 0} icon="user-check" color="#059669" bg="#d1fae5" />
          <MetricRow label="User Tersuspend" value={stats.suspendedUsers ?? 0} icon="pause-circle" color="#d97706" bg="#fef3c7" />
          <MetricRow label="User Dibanned" value={stats.bannedUsers ?? 0} icon="x-circle" color="#dc2626" bg="#fee2e2" />
          <MetricRow label="Total Produk" value={stats.totalProducts ?? 0} icon="package" color="#7c3aed" bg="#ede9fe" />
          <MetricRow label="Total Pesanan" value={stats.totalOrders ?? 0} icon="shopping-bag" color="#0891b2" bg="#cffafe" />
          <MetricRow label="Laporan Pending" value={stats.pendingReports ?? 0} icon="flag" color="#ea580c" bg="#ffedd5" />
          <MetricRow label="Sengketa Pending" value={stats.pendingDisputes ?? 0} icon="alert-triangle" color="#dc2626" bg="#fee2e2" />
          <MetricRow label="Penarikan Pending" value={stats.pendingWithdrawals ?? 0} icon="credit-card" color="#d97706" bg="#fef3c7" isLast />
        </View>
      </View>

      {/* Fraud Alerts */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <Text style={{
            fontSize: 11, fontFamily: "Inter_700Bold",
            color: colors.mutedForeground, letterSpacing: 1.2,
          }}>
            FRAUD ALERTS
          </Text>
          <View style={{
            backgroundColor: fraudAlerts.length > 0 ? "#fee2e2" : "#dcfce7",
            borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3,
          }}>
            <Text style={{
              fontSize: 11, fontFamily: "Inter_700Bold",
              color: fraudAlerts.length > 0 ? "#dc2626" : "#16a34a",
            }}>
              {fraudAlerts.length} alert
            </Text>
          </View>
        </View>

        {fraudAlerts.length === 0 ? (
          <View style={{
            backgroundColor: "#f0fdf4", borderRadius: 14, padding: 18,
            borderWidth: 1, borderColor: "#bbf7d0",
            flexDirection: "row", alignItems: "center", gap: 12,
          }}>
            <View style={{
              width: 44, height: 44, borderRadius: 12,
              backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center",
            }}>
              <Feather name="shield" size={22} color="#16a34a" />
            </View>
            <View>
              <Text style={{ fontFamily: "Inter_700Bold", color: "#15803d", fontSize: 14 }}>
                Aman — Tidak ada fraud
              </Text>
              <Text style={{ fontFamily: "Inter_400Regular", color: "#16a34a", fontSize: 12, marginTop: 2 }}>
                Semua transaksi dalam kondisi normal
              </Text>
            </View>
          </View>
        ) : (
          <View style={{
            backgroundColor: "#fef2f2", borderRadius: 14,
            borderWidth: 1, borderColor: "#fecaca", overflow: "hidden",
          }}>
            {fraudAlerts.map((alert: any, i: number) => (
              <FraudCard
                key={i}
                name={alert.name}
                reason={alert.reason}
                index={i}
                total={fraudAlerts.length}
              />
            ))}
          </View>
        )}
      </View>

      {/* Aktivitas Moderasi */}
      {recentBanLogs.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{
            fontSize: 11, fontFamily: "Inter_700Bold",
            color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 10,
          }}>
            AKTIVITAS MODERASI TERBARU
          </Text>
          <View style={{
            backgroundColor: colors.card, borderRadius: 16,
            borderWidth: 1, borderColor: colors.border, overflow: "hidden",
          }}>
            {recentBanLogs.slice(0, 10).map((log: any, i: number) => (
              <View
                key={i}
                style={{
                  paddingHorizontal: 16, paddingVertical: 12,
                  borderBottomWidth: i < Math.min(recentBanLogs.length, 10) - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                  flexDirection: "row", alignItems: "flex-start", gap: 12,
                }}
              >
                <View style={{
                  width: 34, height: 34, borderRadius: 10,
                  backgroundColor: log.action === "ban" ? "#fee2e2" : log.action === "suspend" ? "#fef3c7" : "#dcfce7",
                  alignItems: "center", justifyContent: "center", marginTop: 1,
                }}>
                  <Feather
                    name={log.action === "ban" ? "x-circle" : log.action === "suspend" ? "pause-circle" : "check-circle"}
                    size={15}
                    color={log.action === "ban" ? "#dc2626" : log.action === "suspend" ? "#d97706" : "#16a34a"}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.foreground }}>
                    User #{log.targetUserId} → {log.action}
                  </Text>
                  {log.reason ? (
                    <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                      {log.reason}
                    </Text>
                  ) : null}
                </View>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground }}>
                  {formatDate(log.createdAt)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Pending Reports Preview */}
      {pendingReports.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{
              fontSize: 11, fontFamily: "Inter_700Bold",
              color: colors.mutedForeground, letterSpacing: 1.2,
            }}>
              LAPORAN MENUNGGU TINJAUAN
            </Text>
            <View style={{
              backgroundColor: "#ffedd5", borderRadius: 99,
              paddingHorizontal: 8, paddingVertical: 3,
            }}>
              <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: "#ea580c" }}>
                {pendingReports.length}
              </Text>
            </View>
          </View>
          <View style={{
            backgroundColor: colors.card, borderRadius: 16,
            borderWidth: 1, borderColor: colors.border, overflow: "hidden",
          }}>
            {pendingReports.slice(0, 5).map((r: any, i: number) => (
              <View
                key={i}
                style={{
                  paddingHorizontal: 16, paddingVertical: 12,
                  borderBottomWidth: i < Math.min(pendingReports.length, 5) - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.foreground }}>
                  #{r.id} · {r.reason}
                </Text>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, marginTop: 3 }}>
                  Target: {r.targetType} #{r.targetId} · {formatDate(r.createdAt)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
