import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  useGetCategories,
  useGetFeaturedProducts,
  useGetProducts,
  useGetTrendingProducts,
} from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProductCard } from "@/components/ProductCard";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

const CATEGORY_ICONS: Record<string, string> = {
  Elektronik: "cpu",
  Fashion: "shopping-bag",
  Rumah: "home",
  Olahraga: "activity",
  Otomotif: "truck",
  Makanan: "coffee",
  Kecantikan: "heart",
  Buku: "book",
};

export default function BerandaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState("");

  const { data: categories } = useGetCategories();
  const { data: featuredRaw } = useGetFeaturedProducts();
  const { data: trendingRaw } = useGetTrendingProducts();
  const { data: productsPage, isLoading: loadingProducts } = useGetProducts({ limit: 20 });

  const featured = Array.isArray(featuredRaw) ? featuredRaw : [];
  const trending = Array.isArray(trendingRaw) ? trendingRaw : [];
  const allProducts: any[] = productsPage ? (productsPage as any).data ?? [] : [];

  const webTop = Platform.OS === "web" ? 67 : 0;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerWrap: {
      backgroundColor: colors.primary,
      paddingTop: insets.top + webTop + 12,
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    logo: { flexDirection: "row", alignItems: "center", gap: 8 },
    logoText: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFF" },
    logoSub: { fontSize: 11, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular" },
    notifBtn: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center", justifyContent: "center",
    },
    searchBar: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: "#FFF", borderRadius: 12,
      paddingHorizontal: 14, height: 46, gap: 10,
    },
    searchInput: {
      flex: 1, fontSize: 14, color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    section: { paddingHorizontal: 16, marginTop: 20 },
    sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground },
    seeAll: { fontSize: 13, color: colors.primary, fontFamily: "Inter_600SemiBold" },
    categoryItem: { alignItems: "center", width: 70, marginRight: 12 },
    catIcon: {
      width: 52, height: 52, borderRadius: 16,
      alignItems: "center", justifyContent: "center",
      marginBottom: 6,
    },
    catLabel: { fontSize: 11, color: colors.foreground, fontFamily: "Inter_500Medium", textAlign: "center" },
    featCard: {
      width: width * 0.75,
      height: 180,
      borderRadius: 16,
      overflow: "hidden",
      marginRight: 12,
    },
    featImage: { width: "100%", height: "100%" },
    featGrad: { ...StyleSheet.absoluteFillObject, padding: 16, justifyContent: "flex-end" },
    featTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFF", marginBottom: 4 },
    featPrice: { fontSize: 13, color: "rgba(255,255,255,0.9)", fontFamily: "Inter_500Medium" },
    gridWrap: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 16 },
    gridCard: { width: CARD_W },
    bottom: { height: Platform.OS === "web" ? 84 + 34 : 100 },
  });

  const handleSearch = () => {
    if (searchText.trim()) {
      router.push({ pathname: "/(tabs)/search", params: { q: searchText } } as any);
    }
  };

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {/* Sticky Header */}
        <View style={s.headerWrap}>
          <View style={s.topRow}>
            <View>
              <View style={s.logo}>
                <Feather name="shopping-bag" size={20} color="#FFF" />
                <Text style={s.logoText}>jualdanbeli</Text>
              </View>
              <Text style={s.logoSub}>
                {user ? `Halo, ${user.name.split(" ")[0]}!` : "Belanja aman & mudah"}
              </Text>
            </View>
            <Pressable style={s.notifBtn}>
              <Feather name="bell" size={20} color="#FFF" />
            </Pressable>
          </View>
          <Pressable style={s.searchBar} onPress={handleSearch}>
            <Feather name="search" size={18} color={colors.mutedForeground} />
            <TextInput
              style={s.searchInput}
              placeholder="Cari produk..."
              placeholderTextColor={colors.mutedForeground}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </Pressable>
        </View>

        {/* Categories */}
        {Array.isArray(categories) && categories.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Kategori</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat: any) => (
                <Pressable
                  key={cat.id}
                  style={s.categoryItem}
                  onPress={() => router.push({ pathname: "/(tabs)/search", params: { categoryId: cat.id } } as any)}
                >
                  <LinearGradient
                    colors={[colors.primary + "33", colors.secondary + "22"]}
                    style={s.catIcon}
                  >
                    <Feather
                      name={(CATEGORY_ICONS[cat.name] ?? "grid") as any}
                      size={22}
                      color={colors.primary}
                    />
                  </LinearGradient>
                  <Text style={s.catLabel} numberOfLines={2}>{cat.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <View style={[s.section, { paddingHorizontal: 0 }]}>
            <View style={[s.sectionRow, { paddingHorizontal: 16 }]}>
              <Text style={s.sectionTitle}>Pilihan Unggulan</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, paddingRight: 4 }}>
              {featured.map((p: any) => (
                <Pressable
                  key={p.id}
                  style={s.featCard}
                  onPress={() => router.push(`/product/${p.id}` as any)}
                >
                  {p.images?.[0] ? (
                    <Image source={{ uri: p.images[0] }} style={s.featImage as any} contentFit="cover" />
                  ) : (
                    <View style={[s.featImage, { backgroundColor: colors.muted }]} />
                  )}
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.75)"]}
                    style={s.featGrad}
                  >
                    <Text style={s.featTitle} numberOfLines={1}>{p.name}</Text>
                    <Text style={s.featPrice}>
                      Rp {p.price?.toLocaleString("id-ID")}
                    </Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Trending */}
        {trending.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Sedang Trending</Text>
              <Pressable onPress={() => router.push("/(tabs)/search" as any)}>
                <Text style={s.seeAll}>Lihat semua</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {trending.slice(0, 6).map((p: any) => (
                <View key={p.id} style={{ width: CARD_W + 8, marginRight: 10 }}>
                  <ProductCard product={p} compact />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Products Grid */}
        <View style={[s.section, { paddingHorizontal: 0 }]}>
          <View style={[s.sectionRow, { paddingHorizontal: 16 }]}>
            <Text style={s.sectionTitle}>Semua Produk</Text>
          </View>
          {loadingProducts ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : allProducts.length === 0 ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Feather name="package" size={36} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, marginTop: 8, fontFamily: "Inter_400Regular" }}>
                Belum ada produk
              </Text>
            </View>
          ) : (
            <View style={s.gridWrap}>
              {allProducts.map((p: any) => (
                <View key={p.id} style={s.gridCard}>
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={s.bottom} />
      </ScrollView>
    </View>
  );
}
