import { Feather } from "@expo/vector-icons";
import { useAdminGetOrders } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator, Pressable, RefreshControl,
  ScrollView, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/components/ProductCard";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:    { label: "Menunggu",  color: "#d97706", bg: "#fef3c7", icon: "clock" },
  paid:       { label: "Dibayar",   color: "#2563eb", bg: "#dbeafe", icon: "credit-card" },
  processing: { label: "Diproses",  color: "#7c3aed", bg: "#ede9fe", icon: "settings" },
  shipped:    { label: "Dikirim",   color: "#0891b2", bg: "#cffafe", icon: "truck" },
  delivered:  { label: "Diterima",  color: "#16a34a", bg: "#dcfce7", icon: "check-circle" },
  completed:  { label: "Selesai",   color: "#16a34a", bg: "#dcfce7", icon: "check-circle" },
  cancelled:  { label: "Dibatal",   color: "#dc2626", bg: "#fee2e2", icon: "x-circle" },
  refunded:   { label: "Refund",    color: "#9333ea", bg: "#f3e8ff", icon: "refresh-cw" },
  disputed:   { label: "Sengketa",  color: "#ea580c", bg: "#ffedd5", icon: "alert-triangle" },
};

const FILTER_TABS = [
  { key: "all",      label: "Semua" },
  { key: "pending",  label: "Pending" },
  { key: "paid",     label: "Dibayar" },
  { key: "shipped",  label: "Kirim" },
  { key: "disputed", label: "Sengketa" },
];

export default function AdminOrders() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: ordersRaw, isLoading, refetch, isRefetching } = useAdminGetOrders(
    activeFilter !== "all" ? { status: activeFilter } : undefined,
    { query: { enabled: !!token } as any }
  );
  const orders: any[] = Array.isArray(ordersRaw) ? ordersRaw : [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
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
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
                backgroundColor: isActive ? "#0f172a" : colors.muted,
              }}
            >
              <Text style={{
                fontFamily: "Inter_600SemiBold", fontSize: 13,
                color: isActive ? "#fff" : colors.foreground,
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
            Memuat pesanan...
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
            {orders.length} pesanan
          </Text>

          {orders.map((order: any) => {
            const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            return (
              <View
                key={order.id}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16, borderWidth: 1, borderColor: colors.border,
                  overflow: "hidden",
                }}
              >
                {/* Header stripe */}
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
                    <Text style={{ fontFamily: "Inter_700Bold", fontSize: 15, color: colors.foreground }}>
                      #{order.id}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: sc.bg, paddingHorizontal: 10, paddingVertical: 4,
                    borderRadius: 8,
                  }}>
                    <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: sc.color }}>
                      {sc.label}
                    </Text>
                  </View>
                </View>

                {/* Body */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
                  <View style={{ flexDirection: "row", gap: 16 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 2 }}>
                        Pembeli
                      </Text>
                      <Text style={{ fontSize: 13, color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                        {order.buyer?.name ?? `User #${order.buyerId}`}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 2 }}>
                        Tanggal
                      </Text>
                      <Text style={{ fontSize: 13, color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                        {formatDate(order.createdAt)}
                      </Text>
                    </View>
                  </View>

                  <View style={{
                    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                    paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border,
                  }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Feather name="package" size={13} color={colors.mutedForeground} />
                      <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                        {order.courier ?? "—"} · {order.items?.length ?? 0} item
                      </Text>
                    </View>
                    <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: "#2563eb" }}>
                      {formatRupiah(order.totalAmount ?? 0)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          {orders.length === 0 && (
            <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
              <View style={{
                width: 72, height: 72, borderRadius: 20,
                backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
              }}>
                <Feather name="shopping-bag" size={34} color={colors.mutedForeground} />
              </View>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold", fontSize: 15 }}>
                Tidak ada pesanan
              </Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13 }}>
                Filter: {FILTER_TABS.find(t => t.key === activeFilter)?.label}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
