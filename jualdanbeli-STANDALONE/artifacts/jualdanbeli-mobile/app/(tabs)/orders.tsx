import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useGetOrders } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { OrderCard } from "@/components/OrderCard";

const STATUS_TABS = [
  { key: undefined, label: "Semua" },
  { key: "pending", label: "Bayar" },
  { key: "paid", label: "Dikemas" },
  { key: "shipped", label: "Dikirim" },
  { key: "completed", label: "Selesai" },
];

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token } = useAuth();
  const [activeStatus, setActiveStatus] = useState<string | undefined>(undefined);

  const { data: orders, isLoading, refetch, isRefetching } = useGetOrders(
    { status: activeStatus, role: "buyer" },
    { query: { enabled: !!token } as any }
  );

  const orderList = Array.isArray(orders) ? orders : [];
  const webTop = Platform.OS === "web" ? 67 : 0;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: insets.top + webTop + 16,
      paddingBottom: 0,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 12 },
    tabRow: { flexDirection: "row" },
    tab: {
      paddingHorizontal: 14, paddingVertical: 10,
      marginRight: 4, borderBottomWidth: 2.5,
    },
    tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    scroll: { flex: 1 },
    content: { padding: 16, paddingBottom: Platform.OS === "web" ? 84 + 34 : 100 },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 48 },
    emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 16, marginBottom: 8 },
    emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" },
    actionBtn: {
      marginTop: 20, backgroundColor: colors.primary,
      paddingHorizontal: 24, paddingVertical: 12, borderRadius: 99,
    },
    actionBtnText: { color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 14 },
  });

  if (!token) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Pesanan</Text>
        </View>
        <View style={s.empty}>
          <Feather name="package" size={56} color={colors.mutedForeground} />
          <Text style={s.emptyTitle}>Belum Login</Text>
          <Text style={s.emptyText}>Masuk untuk melihat pesanan kamu</Text>
          <Pressable style={s.actionBtn} onPress={() => router.push("/(auth)/login" as any)}>
            <Text style={s.actionBtnText}>Masuk</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Pesanan Saya</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={s.tabRow}>
            {STATUS_TABS.map((tab) => {
              const active = activeStatus === tab.key;
              return (
                <Pressable
                  key={tab.label}
                  style={[s.tab, { borderBottomColor: active ? colors.primary : "transparent" }]}
                  onPress={() => setActiveStatus(tab.key)}
                >
                  <Text style={[s.tabText, { color: active ? colors.primary : colors.mutedForeground }]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : orderList.length === 0 ? (
        <View style={s.empty}>
          <Feather name="inbox" size={48} color={colors.mutedForeground} />
          <Text style={s.emptyTitle}>Belum Ada Pesanan</Text>
          <Text style={s.emptyText}>
            {activeStatus ? "Tidak ada pesanan dengan status ini" : "Mulai belanja untuk membuat pesanan"}
          </Text>
          <Pressable style={s.actionBtn} onPress={() => router.push("/(tabs)/search" as any)}>
            <Text style={s.actionBtnText}>Mulai Belanja</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        >
          {orderList.map((order: any) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
