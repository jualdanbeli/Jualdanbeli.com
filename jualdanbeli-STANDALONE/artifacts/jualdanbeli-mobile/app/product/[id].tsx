import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetProduct } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/components/ProductCard";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, items } = useCart();
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const productId = parseInt(id ?? "0", 10);
  const { data: product, isLoading, error } = useGetProduct(productId, {
    query: { enabled: productId > 0 } as any,
  });

  const inCart = items.some((i) => i.productId === productId);

  const handleAddToCart = () => {
    if (!product) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem({
      productId: product.id,
      title: product.name,
      price: product.price,
      image: product.images?.[0],
      quantity: 1,
      sellerName: (product as any).seller?.name,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      position: "absolute",
      top: insets.top + 8,
      left: 0, right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      zIndex: 10,
    },
    headerBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.4)",
      alignItems: "center", justifyContent: "center",
    },
    image: { width, height: width, backgroundColor: colors.muted },
    dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 12 },
    dot: { width: 6, height: 6, borderRadius: 3 },
    body: { padding: 16 },
    price: { fontSize: 26, fontFamily: "Inter_700Bold", color: colors.primary, marginBottom: 6 },
    productName: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: colors.foreground, lineHeight: 26, marginBottom: 12 },
    metaRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
    metaBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.muted, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 },
    metaText: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
    sectionTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 8 },
    desc: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", lineHeight: 22 },
    sellerCard: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: colors.card, borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.border,
      padding: 12, marginTop: 16,
    },
    sellerAvatar: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.primary + "30",
      alignItems: "center", justifyContent: "center",
    },
    sellerName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    sellerSub: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    bottomBar: {
      borderTopWidth: 1, borderTopColor: colors.border,
      padding: 16, paddingBottom: insets.bottom + 16,
      backgroundColor: colors.card,
      flexDirection: "row", gap: 10,
    },
    addBtn: {
      flex: 1, height: 52, borderRadius: colors.radius,
      alignItems: "center", justifyContent: "center",
    },
    addBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFF" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  });

  if (isLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={s.center}>
        <Feather name="alert-circle" size={48} color={colors.mutedForeground} />
        <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular" }}>
          Produk tidak ditemukan
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const images = product.images ?? [];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable style={s.headerBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#FFF" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {images.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setImgIdx(Math.round(e.nativeEvent.contentOffset.x / width));
            }}
          >
            {images.map((uri, i) => (
              <Image key={i} source={{ uri }} style={s.image} contentFit="cover" transition={150} />
            ))}
          </ScrollView>
        ) : (
          <View style={[s.image, { alignItems: "center", justifyContent: "center" }]}>
            <Feather name="image" size={48} color={colors.mutedForeground} />
          </View>
        )}

        {images.length > 1 && (
          <View style={s.dots}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[s.dot, { backgroundColor: i === imgIdx ? colors.primary : colors.border }]}
              />
            ))}
          </View>
        )}

        <View style={s.body}>
          <Text style={s.price}>{formatRupiah(product.price)}</Text>
          <Text style={s.productName}>{product.name}</Text>

          <View style={s.metaRow}>
            {product.condition && (
              <View style={s.metaBadge}>
                <Feather name="tag" size={12} color={colors.mutedForeground} />
                <Text style={s.metaText}>{product.condition === "new" ? "Baru" : "Bekas"}</Text>
              </View>
            )}
            {product.stock !== undefined && (
              <View style={s.metaBadge}>
                <Feather name="package" size={12} color={colors.mutedForeground} />
                <Text style={s.metaText}>Stok {product.stock}</Text>
              </View>
            )}
          </View>

          <Text style={s.sectionTitle}>Deskripsi</Text>
          <Text style={s.desc}>{product.description || "Tidak ada deskripsi"}</Text>

          {(product as any).seller && (
            <Pressable style={s.sellerCard}>
              <View style={s.sellerAvatar}>
                <Feather name="user" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.sellerName}>{(product as any).seller.name}</Text>
                <Text style={s.sellerSub}>{(product as any).seller.city ?? "Indonesia"}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </ScrollView>

      <View style={s.bottomBar}>
        <Pressable
          style={[s.addBtn, {
            backgroundColor: added || inCart ? colors.secondary : colors.primary,
            opacity: product.stock === 0 ? 0.5 : 1,
          }]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <Text style={s.addBtnText}>
            {product.stock === 0
              ? "Stok Habis"
              : added || inCart
              ? "Ada di Keranjang"
              : "Tambah ke Keranjang"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
