import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function AdminLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerBackground: () => (
          <LinearGradient
            colors={["#0f172a", "#1e3a5f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        ),
        headerTintColor: "#fff",
        headerTitleStyle: { fontFamily: "Inter_700Bold", fontSize: 16 },
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: "rgba(255,255,255,0.12)",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Feather name="arrow-left" size={18} color="#fff" />
          </Pressable>
        ),
        headerRight: () => (
          <View style={{
            backgroundColor: "rgba(34,197,94,0.2)",
            paddingHorizontal: 10, paddingVertical: 5,
            borderRadius: 99, borderWidth: 1,
            borderColor: "rgba(34,197,94,0.4)",
            flexDirection: "row", alignItems: "center", gap: 5,
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#22c55e" }} />
            <Text style={{ color: "#86efac", fontSize: 11, fontFamily: "Inter_600SemiBold" }}>
              Admin
            </Text>
          </View>
        ),
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index"       options={{ title: "Panel Admin" }} />
      <Stack.Screen name="monitoring"  options={{ title: "Monitoring Realtime" }} />
      <Stack.Screen name="users"       options={{ title: "Manajemen Pengguna" }} />
      <Stack.Screen name="orders"      options={{ title: "Semua Pesanan" }} />
      <Stack.Screen name="reports"     options={{ title: "Laporan & Fraud" }} />
      <Stack.Screen name="disputes"    options={{ title: "Sengketa Transaksi" }} />
      <Stack.Screen name="withdrawals" options={{ title: "Penarikan Dana" }} />
      <Stack.Screen name="products"    options={{ title: "Moderasi Produk" }} />
      <Stack.Screen name="vouchers"    options={{ title: "Manajemen Voucher" }} />
      <Stack.Screen name="analytics"   options={{ title: "Analytics Operator" }} />
      <Stack.Screen name="support"     options={{ title: "Inbox CS & Pengaduan" }} />
      <Stack.Screen name="security"    options={{ title: "Keamanan Sistem" }} />
      <Stack.Screen name="settings"    options={{ title: "Pengaturan Platform" }} />
    </Stack>
  );
}
