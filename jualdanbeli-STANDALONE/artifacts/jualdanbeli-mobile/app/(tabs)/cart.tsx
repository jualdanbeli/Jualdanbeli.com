import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/components/ProductCard";

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, totalItems, totalPrice, removeItem, updateQty, clearCart } = useCart();
  const { token } = useAuth();

  const webTop = Platform.OS === "web" ? 67 : 0;

  const handleCheckout = () => {
    if (!token) {
      router.push("/(auth)/login" as any);
      return;
    }
    Alert.alert(
      "Konfirmasi Pesanan",
      `Total: ${formatRupiah(totalPrice)}\nDengan perlindungan Rekening Bersama (Escrow)`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Pesan Sekarang",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Pesanan Dibuat!", "Silakan selesaikan pembayaran di halaman Pesanan.");
            clearCart();
          },
        },
      ]
    );
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: insets.top + webTop + 16,
      paddingBottom: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground },
    clearBtn: { padding: 4 },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 48 },
    emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 16, marginBottom: 8 },
    emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" },
    browseBtn: {
      marginTop: 20, backgroundColor: colors.primary,
      paddingHorizontal: 24, paddingVertical: 12, borderRadius: 99,
    },
    browseBtnText: { color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 14 },
    scroll: { flex: 1 },
    itemCard: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      padding: 14,
      gap: 12,
    },
    itemImg: {
      width: 72, height: 72, borderRadius: 10,
      backgroundColor: colors.muted,
    },
    itemBody: { flex: 1, gap: 4 },
    itemTitle: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.foreground, lineHeight: 20 },
    itemSeller: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    itemPrice: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.primary },
    qtyRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
    qtyBtn: {
      width: 28, height: 28, borderRadius: 8,
      backgroundColor: colors.muted,
      alignItems: "center", justifyContent: "center",
    },
    qtyText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground, minWidth: 20, textAlign: "center" },
    deleteBtn: { padding: 6 },
    summary: {
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: 16,
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16),
      gap: 12,
    },
    summaryRow: { flexDirection: "row", justifyContent: "space-between" },
    summaryLabel: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    summaryValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    totalLabel: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground },
    totalValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.primary },
    escrowNote: {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: colors.secondary + "18",
      borderRadius: 10, padding: 10,
    },
    escrowText: { fontSize: 12, color: colors.secondary, fontFamily: "Inter_500Medium", flex: 1 },
    checkoutBtn: {
      backgroundColor: colors.primary, borderRadius: colors.radius,
      height: 52, alignItems: "center", justifyContent: "center",
    },
    checkoutText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  });

  if (items.length === 0) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Keranjang</Text>
        </View>
        <View style={s.empty}>
          <Feather name="shopping-cart" size={56} color={colors.mutedForeground} />
          <Text style={s.emptyTitle}>Keranjang Kosong</Text>
          <Text style={s.emptyText}>
            Tambahkan produk ke keranjang untuk mulai belanja
          </Text>
          <Pressable style={s.browseBtn} onPress={() => router.push("/(tabs)/search" as any)}>
            <Text style={s.browseBtnText}>Mulai Belanja</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Keranjang ({totalItems})</Text>
        <Pressable style={s.clearBtn} onPress={() => {
          Alert.alert("Kosongkan keranjang?", "Semua item akan dihapus.", [
            { text: "Batal", style: "cancel" },
            { text: "Hapus", style: "destructive", onPress: clearCart },
          ]);
        }}>
          <Feather name="trash-2" size={20} color={colors.destructive} />
        </Pressable>
      </View>

      <ScrollView style={s.scroll}>
        {items.map((item) => (
          <View key={item.id} style={s.itemCard}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={s.itemImg} contentFit="cover" />
            ) : (
              <View style={[s.itemImg, { alignItems: "center", justifyContent: "center" }]}>
                <Feather name="image" size={24} color={colors.mutedForeground} />
              </View>
            )}
            <View style={s.itemBody}>
              <Text style={s.itemTitle} numberOfLines={2}>{item.title}</Text>
              {item.sellerName && (
                <Text style={s.itemSeller}>{item.sellerName}</Text>
              )}
              <Text style={s.itemPrice}>{formatRupiah(item.price)}</Text>
              <View style={s.qtyRow}>
                <Pressable style={s.qtyBtn} onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  updateQty(item.productId, item.quantity - 1);
                }}>
                  <Feather name="minus" size={14} color={colors.foreground} />
                </Pressable>
                <Text style={s.qtyText}>{item.quantity}</Text>
                <Pressable style={s.qtyBtn} onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  updateQty(item.productId, item.quantity + 1);
                }}>
                  <Feather name="plus" size={14} color={colors.foreground} />
                </Pressable>
                <Pressable style={s.deleteBtn} onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  removeItem(item.productId);
                }}>
                  <Feather name="x" size={16} color={colors.destructive} />
                </Pressable>
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={s.summary}>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Subtotal ({totalItems} item)</Text>
          <Text style={s.summaryValue}>{formatRupiah(totalPrice)}</Text>
        </View>
        <View style={s.summaryRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>{formatRupiah(totalPrice)}</Text>
        </View>
        <View style={s.escrowNote}>
          <Feather name="shield" size={14} color={colors.secondary} />
          <Text style={s.escrowText}>
            Pembayaran dilindungi Rekening Bersama — uang aman sampai barang diterima
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [s.checkoutBtn, { opacity: pressed ? 0.8 : 1 }]}
          onPress={handleCheckout}
        >
          <Text style={s.checkoutText}>Beli Sekarang</Text>
        </Pressable>
      </View>
    </View>
  );
}
