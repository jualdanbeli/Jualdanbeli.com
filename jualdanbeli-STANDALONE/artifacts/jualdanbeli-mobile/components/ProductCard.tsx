import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface Product {
  id: number;
  title: string;
  price: number;
  images?: string[];
  condition?: string;
  averageRating?: number;
  totalReviews?: number;
  seller?: { name: string; city?: string };
  location?: string;
}

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function formatRupiah(amount: number): string {
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1).replace(".0", "")} jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} rb`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const colors = useColors();
  const router = useRouter();
  const image = product.images?.[0];

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      flex: 1,
    },
    image: {
      width: "100%",
      aspectRatio: 1,
      backgroundColor: colors.muted,
    },
    noImage: {
      width: "100%",
      aspectRatio: 1,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    body: {
      padding: compact ? 8 : 10,
    },
    title: {
      fontSize: compact ? 12 : 13,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
      lineHeight: 18,
      marginBottom: 4,
    },
    price: {
      fontSize: compact ? 13 : 15,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
      marginBottom: 2,
    },
    meta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    metaText: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    conditionBadge: {
      backgroundColor: product.condition === "new" ? colors.secondary + "22" : colors.muted,
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 4,
    },
    conditionText: {
      fontSize: 10,
      color: product.condition === "new" ? colors.secondary : colors.mutedForeground,
      fontFamily: "Inter_600SemiBold",
    },
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
      onPress={() => router.push(`/product/${product.id}` as any)}
    >
      {image ? (
        <Image
          source={{ uri: image }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={styles.noImage}>
          <Feather name="image" size={28} color={colors.mutedForeground} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.price}>{formatRupiah(product.price)}</Text>
        <View style={styles.meta}>
          {product.condition && (
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>
                {product.condition === "new" ? "Baru" : "Bekas"}
              </Text>
            </View>
          )}
          {product.averageRating && product.averageRating > 0 ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
              <Feather name="star" size={10} color="#F59E0B" />
              <Text style={styles.metaText}>{product.averageRating.toFixed(1)}</Text>
            </View>
          ) : null}
        </View>
        {product.seller?.city || product.seller?.name ? (
          <Text style={[styles.metaText, { marginTop: 4 }]} numberOfLines={1}>
            {product.seller?.city ?? product.seller?.name}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
