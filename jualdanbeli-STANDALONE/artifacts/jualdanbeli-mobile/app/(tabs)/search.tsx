import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetCategories, useGetProducts } from "@workspace/api-client-react";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ProductCard } from "@/components/ProductCard";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

const SORT_OPTIONS = [
  { key: "newest", label: "Terbaru" },
  { key: "popular", label: "Populer" },
  { key: "price_asc", label: "Termurah" },
  { key: "price_desc", label: "Termahal" },
];

const CONDITION_OPTIONS = [
  { key: "", label: "Semua" },
  { key: "new", label: "Baru" },
  { key: "used", label: "Bekas" },
];

export default function SearchScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ q?: string; categoryId?: string }>();

  const [query, setQuery] = useState(params.q ?? "");
  const [activeQuery, setActiveQuery] = useState(params.q ?? "");
  const [selectedCat, setSelectedCat] = useState<number | undefined>(
    params.categoryId ? parseInt(params.categoryId, 10) : undefined
  );
  const [sort, setSort] = useState("newest");
  const [condition, setCondition] = useState("");

  useEffect(() => {
    if (params.q) { setQuery(params.q); setActiveQuery(params.q); }
    if (params.categoryId) setSelectedCat(parseInt(params.categoryId, 10));
  }, [params.q, params.categoryId]);

  const { data: categories } = useGetCategories();
  const { data: productsPage, isLoading, isFetching } = useGetProducts({
    q: activeQuery || undefined,
    categoryId: selectedCat,
    sort: sort as any,
    condition: condition as any || undefined,
    limit: 40,
  });

  const allProducts: any[] = productsPage ? (productsPage as any).data ?? [] : [];
  const totalCount: number = productsPage ? (productsPage as any).total ?? allProducts.length : 0;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    searchWrap: {
      backgroundColor: colors.card,
      paddingTop: Platform.OS === "web" ? 67 + 8 : 52,
      paddingBottom: 8,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchBar: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.muted, borderRadius: 12,
      paddingHorizontal: 14, height: 46, gap: 10,
    },
    searchInput: { flex: 1, fontSize: 15, color: colors.foreground, fontFamily: "Inter_400Regular" },
    filterRow: { marginTop: 10 },
    chip: {
      paddingHorizontal: 14, paddingVertical: 7,
      borderRadius: 99, borderWidth: 1.5,
      marginRight: 8,
    },
    chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
    resultCount: {
      paddingHorizontal: 16, paddingVertical: 10,
      fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular",
    },
    gridCard: { width: CARD_W },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 48 },
    emptyText: { color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  });

  return (
    <View style={s.container}>
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={s.searchInput}
            placeholder="Cari produk, merek, toko..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => setActiveQuery(query)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(""); setActiveQuery(""); }}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Category filters */}
        {Array.isArray(categories) && categories.length > 0 && (
          <View style={s.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Pressable
                style={[s.chip, {
                  borderColor: !selectedCat ? colors.primary : colors.border,
                  backgroundColor: !selectedCat ? colors.primary + "15" : "transparent",
                }]}
                onPress={() => setSelectedCat(undefined)}
              >
                <Text style={[s.chipText, { color: !selectedCat ? colors.primary : colors.mutedForeground }]}>Semua</Text>
              </Pressable>
              {categories.map((cat: any) => (
                <Pressable
                  key={cat.id}
                  style={[s.chip, {
                    borderColor: selectedCat === cat.id ? colors.primary : colors.border,
                    backgroundColor: selectedCat === cat.id ? colors.primary + "15" : "transparent",
                  }]}
                  onPress={() => setSelectedCat(selectedCat === cat.id ? undefined : cat.id)}
                >
                  <Text style={[s.chipText, { color: selectedCat === cat.id ? colors.primary : colors.mutedForeground }]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Sort & condition */}
        <View style={[s.filterRow, { marginTop: 8 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                style={[s.chip, {
                  borderColor: sort === opt.key ? colors.secondary : colors.border,
                  backgroundColor: sort === opt.key ? colors.secondary + "15" : "transparent",
                }]}
                onPress={() => setSort(opt.key)}
              >
                <Text style={[s.chipText, { color: sort === opt.key ? colors.secondary : colors.mutedForeground }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
            <View style={{ width: 1, backgroundColor: colors.border, height: 20, alignSelf: "center", marginRight: 8 }} />
            {CONDITION_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                style={[s.chip, {
                  borderColor: condition === opt.key ? colors.foreground : colors.border,
                  backgroundColor: condition === opt.key ? colors.foreground + "12" : "transparent",
                }]}
                onPress={() => setCondition(opt.key)}
              >
                <Text style={[s.chipText, { color: condition === opt.key ? colors.foreground : colors.mutedForeground }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : allProducts.length === 0 ? (
        <View style={s.empty}>
          <Feather name="search" size={48} color={colors.mutedForeground} />
          <Text style={s.emptyText}>
            {activeQuery ? `Tidak ada produk untuk "${activeQuery}"` : "Belum ada produk tersedia"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={allProducts}
          keyExtractor={(item: any) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: Platform.OS === "web" ? 84 + 34 : 100 }}
          columnWrapperStyle={{ gap: 12 }}
          ListHeaderComponent={
            <Text style={s.resultCount}>
              {isFetching ? "Memuat..." : `${totalCount} produk ditemukan`}
            </Text>
          }
          renderItem={({ item }: { item: any }) => (
            <View style={s.gridCard}>
              <ProductCard product={item} />
            </View>
          )}
        />
      )}
    </View>
  );
}
