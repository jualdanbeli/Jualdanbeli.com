import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useGetMe, useGetWallet } from "@workspace/api-client-react";
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
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/components/ProductCard";

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
  value?: string;
}

function MenuItem({ icon, label, onPress, danger, value }: MenuItemProps) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row", alignItems: "center",
        paddingVertical: 14, paddingHorizontal: 16,
        backgroundColor: pressed ? colors.muted : colors.card,
        borderBottomWidth: 1, borderBottomColor: colors.border,
        gap: 14,
      })}
      onPress={onPress}
    >
      <View style={{
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: danger ? colors.destructive + "18" : colors.primary + "18",
        alignItems: "center", justifyContent: "center",
      }}>
        <Feather name={icon as any} size={18} color={danger ? colors.destructive : colors.primary} />
      </View>
      <Text style={{ flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", color: danger ? colors.destructive : colors.foreground }}>
        {label}
      </Text>
      {value ? (
        <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginRight: 4 }}>{value}</Text>
      ) : null}
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token, user, logout } = useAuth();

  const { data: meData } = useGetMe({ query: { enabled: !!token } as any });
  const { data: walletData } = useGetWallet({ query: { enabled: !!token } as any });

  const displayUser: any = meData ?? user;
  const walletBalance: number = (walletData as any)?.balance ?? 0;

  const webTop = Platform.OS === "web" ? 67 : 0;

  const handleLogout = () => {
    Alert.alert("Keluar", "Apakah kamu yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          logout();
        },
      },
    ]);
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
    },
    title: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground },
    scroll: { flex: 1 },
    avatarSection: {
      padding: 20,
      backgroundColor: colors.card,
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatar: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: colors.primary + "30",
      alignItems: "center", justifyContent: "center",
      marginBottom: 12,
    },
    userName: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground },
    userEmail: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    roleBadge: {
      marginTop: 8, paddingHorizontal: 12, paddingVertical: 4,
      backgroundColor: colors.primary + "20", borderRadius: 99,
    },
    roleText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.primary },
    walletCard: {
      margin: 16,
      backgroundColor: colors.primary,
      borderRadius: 16, padding: 20,
    },
    walletLabel: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular", marginBottom: 4 },
    walletAmount: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFF" },
    walletRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
    walletBtn: {
      backgroundColor: "rgba(255,255,255,0.25)",
      paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99,
    },
    walletBtnText: { color: "#FFF", fontSize: 12, fontFamily: "Inter_600SemiBold" },
    sectionTitle: {
      paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
      fontSize: 12, fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.5,
    },
    guestCard: {
      margin: 16, padding: 24,
      backgroundColor: colors.card,
      borderRadius: 16, borderWidth: 1, borderColor: colors.border,
      alignItems: "center",
    },
    guestTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, marginTop: 14, marginBottom: 8 },
    guestText: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
    loginBtn: {
      marginTop: 20, backgroundColor: colors.primary, width: "100%",
      height: 48, borderRadius: colors.radius,
      alignItems: "center", justifyContent: "center",
    },
    loginBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },
    registerBtn: {
      marginTop: 10, borderWidth: 1.5, borderColor: colors.primary, width: "100%",
      height: 48, borderRadius: colors.radius,
      alignItems: "center", justifyContent: "center",
    },
    registerBtnText: { color: colors.primary, fontSize: 15, fontFamily: "Inter_600SemiBold" },
    bottom: { height: Platform.OS === "web" ? 84 + 34 : 100 },
  });

  if (!token) {
    return (
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Profil</Text>
        </View>
        <ScrollView>
          <View style={s.guestCard}>
            <View style={[s.avatar, { width: 72, height: 72, borderRadius: 36 }]}>
              <Feather name="user" size={32} color={colors.primary} />
            </View>
            <Text style={s.guestTitle}>Belum Masuk</Text>
            <Text style={s.guestText}>
              Masuk untuk mengakses profil, pesanan, dan fitur lengkap jualdanbeli
            </Text>
            <Pressable style={s.loginBtn} onPress={() => router.push("/(auth)/login" as any)}>
              <Text style={s.loginBtnText}>Masuk</Text>
            </Pressable>
            <Pressable style={s.registerBtn} onPress={() => router.push("/(auth)/register" as any)}>
              <Text style={s.registerBtnText}>Daftar</Text>
            </Pressable>
          </View>

          <Text style={s.sectionTitle}>Jelajahi</Text>
          <MenuItem icon="shopping-bag" label="Mulai Belanja" onPress={() => router.push("/(tabs)/search" as any)} />
          <MenuItem icon="shield" label="Keamanan Rekening Bersama" onPress={() => {
            Alert.alert("Rekening Bersama", "Dana pembayaran dijaga dengan sistem escrow. Uang kamu aman sampai barang diterima.");
          }} />

          <View style={s.bottom} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Profil</Text>
      </View>
      <ScrollView style={s.scroll}>
        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={{ fontSize: 32, fontFamily: "Inter_700Bold", color: colors.primary }}>
              {displayUser?.name?.charAt(0).toUpperCase() ?? "U"}
            </Text>
          </View>
          <Text style={s.userName}>{displayUser?.name ?? "Pengguna"}</Text>
          <Text style={s.userEmail}>{displayUser?.email ?? ""}</Text>
          <View style={s.roleBadge}>
            <Text style={s.roleText}>
              {displayUser?.role === "seller" ? "Penjual" : displayUser?.role === "admin" ? "Admin" : "Pembeli"}
            </Text>
          </View>
        </View>

        {/* Wallet Card */}
        <View style={s.walletCard}>
          <View style={s.walletRow}>
            <View>
              <Text style={s.walletLabel}>Saldo Dompet</Text>
              <Text style={s.walletAmount}>{formatRupiah(walletBalance)}</Text>
            </View>
            <Pressable style={s.walletBtn}>
              <Text style={s.walletBtnText}>Tarik Dana</Text>
            </Pressable>
          </View>
        </View>

        {/* Menu */}
        <Text style={s.sectionTitle}>Akun</Text>
        <MenuItem icon="user" label="Edit Profil" onPress={() => {}} />
        <MenuItem icon="bell" label="Notifikasi" onPress={() => {}} />
        <MenuItem icon="shield" label="Keamanan" onPress={() => {}} />

        {displayUser?.role === "seller" && (
          <>
            <Text style={s.sectionTitle}>Toko</Text>
            <MenuItem icon="box" label="Kelola Produk" onPress={() => {}} />
            <MenuItem icon="bar-chart-2" label="Laporan Penjualan" onPress={() => {}} />
          </>
        )}

        {displayUser?.role === "admin" && (
          <>
            <Text style={s.sectionTitle}>Panel Admin</Text>
            <Pressable
              style={({ pressed }) => ({
                flexDirection: "row", alignItems: "center",
                paddingVertical: 14, paddingHorizontal: 16,
                backgroundColor: pressed ? "#1e293b" : "#0f172a",
                borderBottomWidth: 1, borderBottomColor: "#1e293b",
                gap: 14,
              })}
              onPress={() => router.push("/(admin)" as any)}
            >
              <View style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center", justifyContent: "center",
              }}>
                <Feather name="shield" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" }}>
                  Buka Panel Admin
                </Text>
                <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", marginTop: 1 }}>
                  Dashboard, pengguna, pesanan, laporan
                </Text>
              </View>
              <View style={{
                backgroundColor: "#22c55e", width: 8, height: 8, borderRadius: 4, marginRight: 6,
              }} />
              <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.5)" />
            </Pressable>
            <MenuItem
              icon="activity"
              label="Monitoring Realtime"
              onPress={() => router.push("/(admin)/monitoring" as any)}
            />
            <MenuItem
              icon="users"
              label="Kelola Pengguna"
              onPress={() => router.push("/(admin)/users" as any)}
            />
          </>
        )}

        <Text style={s.sectionTitle}>Bantuan</Text>
        <MenuItem icon="help-circle" label="Pusat Bantuan" onPress={() => {}} />
        <MenuItem icon="message-circle" label="Hubungi CS" onPress={() => {}} />
        <MenuItem icon="info" label="Tentang Aplikasi" onPress={() => {
          Alert.alert("jualdanbeli v1.0", "Marketplace terpercaya Indonesia\nDengan perlindungan Rekening Bersama");
        }} />

        <Text style={s.sectionTitle}>Keluar</Text>
        <MenuItem icon="log-out" label="Keluar" onPress={handleLogout} danger />

        <View style={s.bottom} />
      </ScrollView>
    </View>
  );
}
