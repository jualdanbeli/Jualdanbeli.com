import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { formatRupiah } from "./ProductCard";

interface Order {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  items?: Array<{
    product?: { title: string; images?: string[] };
    quantity: number;
    price: number;
  }>;
  trackingNumber?: string;
  courier?: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "Menunggu Pembayaran", color: "#F59E0B", icon: "clock" },
  paid: { label: "Dibayar", color: "#3B82F6", icon: "check-circle" },
  confirmed: { label: "Dikonfirmasi", color: "#8B5CF6", icon: "check-square" },
  shipped: { label: "Dikirim", color: "#06B6D4", icon: "truck" },
  delivered: { label: "Tiba", color: "#10B981", icon: "package" },
  completed: { label: "Selesai", color: "#22A48A", icon: "check-circle" },
  cancelled: { label: "Dibatalkan", color: "#EF3B3B", icon: "x-circle" },
  disputed: { label: "Sengketa", color: "#F97316", icon: "alert-circle" },
};

export function OrderCard({ order }: { order: Order }) {
  const colors = useColors();
  const status = STATUS_MAP[order.status] ?? {
    label: order.status,
    color: colors.mutedForeground,
    icon: "circle",
  };
  const firstItem = order.items?.[0];
  const itemCount = order.items?.length ?? 0;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 10,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    orderId: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 99,
    },
    badgeText: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
    },
    itemTitle: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      marginBottom: 2,
    },
    itemSub: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 10,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    total: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    date: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.orderId}>#{order.id}</Text>
        <View style={[styles.badge, { backgroundColor: status.color + "22" }]}>
          <Feather name={status.icon as any} size={11} color={status.color} />
          <Text style={[styles.badgeText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      {firstItem && (
        <>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {firstItem.product?.title ?? "Produk"}
          </Text>
          {itemCount > 1 && (
            <Text style={styles.itemSub}>+{itemCount - 1} produk lainnya</Text>
          )}
        </>
      )}

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.total}>{formatRupiah(order.totalAmount)}</Text>
        <Text style={styles.date}>
          {new Date(order.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Text>
      </View>
    </View>
  );
}
