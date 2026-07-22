import { Feather } from "@expo/vector-icons";
import {
  useAdminGetProducts,
  useAdminModerateProduct,
  getAdminGetProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator, Alert, Image, Pressable, RefreshControl,
  ScrollView, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/components/ProductCard";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:  { label: "Aktif",    color: "#16a34a", bg: "#dcfce7" },
  flagged: { label: "Ditandai", color: "#d97706", bg: "#fef3c7" },
  removed: { label: "Dihapus",  color: "#dc2626", bg: "#fee2e2" },
  draft:   { label: "Draft",    color: "#6b7280", bg: "#f3f4f6" },
};

const FILTER_TABS = [
  { key: "all",     label: "Semua" },
  { key: "active",  label: "Aktif" },
  { key: "flagged", label: "Ditandai" },
  { key: "removed", label: "Dihapus" },
];

export default function AdminProducts() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: productsData, isLoading, refetch, isRefetching } = useAdminGetProducts(
    {},
    { query: { enabled: !!token } as any }
  );
  const moderate = useAdminModerateProduct();

  const allProducts: any[] = Array.isArray(productsData) ? productsData : [];
  const filtered = allProducts
    .filter(p => filter === "all" || p.status === filter)
    .filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.seller?.name?.toLowerCase().includes(search.toLowerCase()));

  const handleModerate = (productId: number, name: string, action: "active" | "removed") => {
    Alert.alert(
      action === "active" ? "✅ Setujui Produk" : "🗑 Hapus Produk",
      `${action === "active" ? "Aktifkan kembali" : "Hapus"} produk "${name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: action === "active" ? "Setujui" : "Hapus",
          style: action === "removed" ? "destructive" : "default",
          onPress: () => {
            moderate.mutate(
              { productId, data: { status: action } },
              {
                onSuccess: () => {
                  qc.invalidateQueries({ queryKey: getAdminGetProductsQueryKey() });
                  Alert.alert("Berhasil", `Produk berhasil di-${action === "active" ? "aktifkan" : "hapus"}.`);
                },
                onError: () => Alert.alert("Gagal", "Terjadi kesalahan."),
              }
            );
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Search */}
      <View style={{
        backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 10,
          backgroundColor: colors.background, borderRadius: 12,
          paddingHorizontal: 14, paddingVertical: 10,
          borderWidth: 1, borderColor: colors.border,
        }}>
          <Feather name="search" size={17} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari produk atau penjual..."
            placeholderTextColor={colors.mutedForeground}
            style={{ flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: colors.foreground }}
            autoCorrect={false}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 10, gap: 8, flexDirection: "row" }}
      >
        {FILTER_TABS.map(tab => (
          <Pressable
            key={tab.key}
            onPress={() => setFilter(tab.key)}
            style={{
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
              backgroundColor: filter === tab.key ? "#0f172a" : colors.muted,
            }}
          >
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: filter === tab.key ? "#fff" : colors.foreground }}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 10 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563eb" />}
      >
        <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginBottom: 2 }}>
          {filtered.length} produk
        </Text>

        {filtered.map((product: any) => {
          const sc = STATUS_CONFIG[product.status] ?? STATUS_CONFIG.active;
          return (
            <View key={product.id} style={{
              backgroundColor: colors.card, borderRadius: 16,
              borderWidth: 1, borderColor: product.status === "flagged" ? "#fcd34d" : colors.border,
              overflow: "hidden",
            }}>
              <View style={{ flexDirection: "row", padding: 14, gap: 12 }}>
                {/* Image */}
                <View style={{
                  width: 64, height: 64, borderRadius: 12,
                  backgroundColor: colors.muted, overflow: "hidden",
                }}>
                  {product.images?.[0] ? (
                    <Image source={{ uri: product.images[0] }} style={{ width: 64, height: 64 }} resizeMode="cover" />
                  ) : (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                      <Feather name="package" size={24} color={colors.mutedForeground} />
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: colors.foreground, flex: 1, marginRight: 8 }} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <View style={{ backgroundColor: sc.bg, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 }}>
                      <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: sc.color }}>{sc.label}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 }}>
                    {product.seller?.name ?? "—"} · {product.category?.name ?? "—"}
                  </Text>
                  <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: "#2563eb", marginTop: 4 }}>
                    {formatRupiah(product.price ?? 0)}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              {product.status !== "removed" ? (
                <View style={{
                  flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border,
                }}>
                  {product.status !== "active" && (
                    <Pressable
                      style={({ pressed }) => ({
                        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
                        gap: 6, paddingVertical: 11,
                        backgroundColor: pressed ? "#dcfce7" : "#f0fdf4",
                        borderRightWidth: product.status !== "removed" ? 1 : 0,
                        borderRightColor: colors.border,
                      })}
                      onPress={() => handleModerate(product.id, product.name, "active")}
                    >
                      <Feather name="check-circle" size={14} color="#16a34a" />
                      <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: "#16a34a" }}>Aktifkan</Text>
                    </Pressable>
                  )}
                  <Pressable
                    style={({ pressed }) => ({
                      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
                      gap: 6, paddingVertical: 11,
                      backgroundColor: pressed ? "#fee2e2" : "#fef2f2",
                    })}
                    onPress={() => handleModerate(product.id, product.name, "removed")}
                  >
                    <Feather name="trash-2" size={14} color="#dc2626" />
                    <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: "#dc2626" }}>Hapus</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
            <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}>
              <Feather name="package" size={34} color={colors.mutedForeground} />
            </View>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 15, color: colors.foreground }}>Tidak ada produk</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
