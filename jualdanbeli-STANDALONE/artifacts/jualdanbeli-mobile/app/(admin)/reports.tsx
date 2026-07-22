import { Feather } from "@expo/vector-icons";
import { useGetReports, GetReportsStatus } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator, Alert, Pressable, RefreshControl,
  ScrollView, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:      { label: "Pending",   color: "#d97706", bg: "#fef3c7", icon: "clock" },
  investigating:{ label: "Ditinjau",  color: "#2563eb", bg: "#dbeafe", icon: "search" },
  resolved:     { label: "Selesai",   color: "#16a34a", bg: "#dcfce7", icon: "check-circle" },
  dismissed:    { label: "Ditolak",   color: "#6b7280", bg: "#f3f4f6", icon: "x" },
};

const TARGET_LABELS: Record<string, { label: string; icon: string }> = {
  user:    { label: "Pengguna",  icon: "user" },
  product: { label: "Produk",   icon: "package" },
  order:   { label: "Pesanan",  icon: "shopping-bag" },
  seller:  { label: "Penjual",  icon: "store" },
};

const FILTER_TABS = [
  { key: "pending",       label: "Pending" },
  { key: "investigating", label: "Ditinjau" },
  { key: "resolved",      label: "Selesai" },
  { key: "all",           label: "Semua" },
];

export default function AdminReports() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [activeFilter, setActiveFilter] = useState("pending");

  const { data: reportsRaw, isLoading, refetch, isRefetching } = useGetReports(
    activeFilter !== "all"
      ? { status: activeFilter as typeof GetReportsStatus[keyof typeof GetReportsStatus] }
      : {},
    { query: { enabled: !!token } as any }
  );
  const reports: any[] = Array.isArray(reportsRaw)
    ? reportsRaw
    : (reportsRaw as any)?.reports ?? [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  const handleReport = (report: any) => {
    const targetInfo = TARGET_LABELS[report.targetType] ?? { label: report.targetType, icon: "info" };
    Alert.alert(
      `Laporan #${report.id}`,
      `📌 Target: ${targetInfo.label} #${report.targetId}\n\n📋 Alasan:\n${report.reason}\n\n${report.description ? `📝 Detail:\n${report.description}` : ""}`,
      [{ text: "Tutup" }]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 10, gap: 8, flexDirection: "row" }}
      >
        {FILTER_TABS.map(tab => {
          const isActive = activeFilter === tab.key;
          const tabSc = STATUS_CONFIG[tab.key];
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
                backgroundColor: isActive
                  ? (tabSc?.bg ?? "#f1f5f9")
                  : colors.muted,
                borderWidth: isActive ? 1 : 0,
                borderColor: isActive ? (tabSc?.color ?? colors.border) + "44" : "transparent",
              }}
            >
              <Text style={{
                fontFamily: "Inter_600SemiBold", fontSize: 13,
                color: isActive ? (tabSc?.color ?? colors.foreground) : colors.foreground,
              }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginTop: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14 }}>
            Memuat laporan...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingTop: 12, paddingHorizontal: 16, gap: 10 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563eb" />}
        >
          {/* Count */}
          <Text style={{
            fontSize: 12, fontFamily: "Inter_600SemiBold",
            color: colors.mutedForeground, marginBottom: 2,
          }}>
            {reports.length} laporan
          </Text>

          {reports.map((report: any) => {
            const sc = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending;
            const targetInfo = TARGET_LABELS[report.targetType] ?? { label: report.targetType, icon: "info" };
            return (
              <Pressable
                key={report.id}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? colors.muted : colors.card,
                  borderRadius: 16, borderWidth: 1, borderColor: colors.border,
                  overflow: "hidden",
                })}
                onPress={() => handleReport(report)}
              >
                {/* Header */}
                <View style={{
                  paddingHorizontal: 16, paddingVertical: 12,
                  borderBottomWidth: 1, borderBottomColor: colors.border,
                  flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={{
                      width: 30, height: 30, borderRadius: 9,
                      backgroundColor: sc.bg, alignItems: "center", justifyContent: "center",
                    }}>
                      <Feather name={sc.icon as any} size={14} color={sc.color} />
                    </View>
                    <View>
                      <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: colors.foreground }}>
                        Laporan #{report.id}
                      </Text>
                      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground }}>
                        Oleh User #{report.reporterId} · {formatDate(report.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <View style={{
                    backgroundColor: sc.bg, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8,
                  }}>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: sc.color }}>
                      {sc.label}
                    </Text>
                  </View>
                </View>

                {/* Body */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
                  {/* Target chip */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View style={{
                      flexDirection: "row", alignItems: "center", gap: 5,
                      backgroundColor: colors.muted, borderRadius: 8,
                      paddingHorizontal: 8, paddingVertical: 4,
                    }}>
                      <Feather name={targetInfo.icon as any} size={12} color={colors.mutedForeground} />
                      <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
                        {targetInfo.label} #{report.targetId}
                      </Text>
                    </View>
                  </View>

                  {/* Reason */}
                  <View style={{
                    backgroundColor: colors.muted, borderRadius: 10,
                    padding: 12,
                  }}>
                    <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: colors.foreground }}>
                      {report.reason}
                    </Text>
                    {report.description ? (
                      <Text style={{
                        fontFamily: "Inter_400Regular", fontSize: 12,
                        color: colors.mutedForeground, marginTop: 4, lineHeight: 18,
                      }}
                        numberOfLines={2}
                      >
                        {report.description}
                      </Text>
                    ) : null}
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Text style={{ fontSize: 12, color: "#2563eb", fontFamily: "Inter_500Medium" }}>
                        Tap untuk detail
                      </Text>
                      <Feather name="chevron-right" size={12} color="#2563eb" />
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}

          {reports.length === 0 && (
            <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
              <View style={{
                width: 72, height: 72, borderRadius: 20,
                backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center",
              }}>
                <Feather name="flag" size={34} color="#16a34a" />
              </View>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 16 }}>
                Tidak ada laporan
              </Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center" }}>
                Tidak ada laporan dengan status{"\n"}"{FILTER_TABS.find(t => t.key === activeFilter)?.label}"
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
