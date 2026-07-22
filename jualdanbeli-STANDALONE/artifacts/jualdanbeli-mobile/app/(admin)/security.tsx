import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator, ScrollView, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const SECURITY_LAYERS = [
  { icon: "zap",           label: "Rate Limiting",             desc: "Maks 10 login/15 mnt per IP, 5 reset/jam, 300 request global/15 mnt" },
  { icon: "lock",          label: "Account Lockout",           desc: "Terkunci 30 menit setelah 5x login gagal berturut-turut" },
  { icon: "clock",         label: "Token Expiry",              desc: "Semua session token kedaluwarsa otomatis setelah 30 hari" },
  { icon: "shield",        label: "Helmet Security Headers",   desc: "HSTS, XSS Protection, CSP, No-Sniff, Referrer Policy aktif di semua response" },
  { icon: "eye",           label: "CORS Restriction",          desc: "Hanya domain jual-beli-aman.replit.app dan localhost yang diizinkan" },
  { icon: "alert-triangle",label: "SQLi & XSS Detection",     desc: "Pola berbahaya (UNION SELECT, <script>, ../etc) diblokir otomatis" },
  { icon: "key",           label: "Password Policy",           desc: "Min 8 karakter, huruf + angka, maks 128 karakter, tidak boleh spasi" },
  { icon: "server",        label: "Body Size Limit",           desc: "Request body dibatasi 5MB untuk mencegah payload DoS attack" },
  { icon: "database",      label: "Drizzle ORM (No Raw SQL)", desc: "Semua query pakai parameterized query — SQL injection tidak mungkin" },
  { icon: "user-check",    label: "Admin Role Guard",          desc: "Setiap route /api/admin/* memerlukan verifikasi role admin dari database" },
  { icon: "slash",         label: "Suspended/Banned Block",    desc: "User ban/suspend langsung diblokir di semua endpoint, termasuk sesi aktif" },
  { icon: "file-text",     label: "Admin Audit Log",           desc: "Semua aksi ban/suspend/unban dicatat dengan waktu, alasan, dan pelaku" },
];

export default function AdminSecurity() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();

  const { data, isLoading } = useQuery<any>({
    queryKey: ["admin-security-info"],
    queryFn: async () => {
      const base = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? "jual-beli-aman.replit.app"}`;
      const res = await fetch(`${base}/api/admin/monitoring`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal");
      return res.json();
    },
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const stats = data?.platformStats ?? {};

  const summaryCards = [
    { label: "Lapisan Aktif", value: SECURITY_LAYERS.length, icon: "shield", color: "#16a34a", bg: "#dcfce7" },
    { label: "Total User", value: stats.totalUsers ?? "—", icon: "users", color: "#2563eb", bg: "#dbeafe" },
    { label: "Banned+Suspend", value: (stats.bannedUsers ?? 0) + (stats.suspendedUsers ?? 0), icon: "x-circle", color: "#dc2626", bg: "#fee2e2" },
    { label: "Laporan Fraud", value: stats.pendingReports ?? "—", icon: "flag", color: "#d97706", bg: "#fef3c7" },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      {/* Hero */}
      <LinearGradient
        colors={["#064e3b", "#065f46"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
            <Feather name="shield" size={24} color="#fff" />
          </View>
          <View>
            <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 20 }}>Keamanan Sistem</Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", fontSize: 12 }}>
              Status proteksi server & aplikasi
            </Text>
          </View>
          <View style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(34,197,94,0.2)", borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#22c55e" }} />
            <Text style={{ color: "#86efac", fontSize: 12, fontFamily: "Inter_600SemiBold" }}>Aman</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Summary cards */}
      <View style={{ padding: 16, gap: 10 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {summaryCards.slice(0, 2).map(card => (
            <View key={card.label} style={{ flex: 1, backgroundColor: card.bg, borderRadius: 14, padding: 14 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Feather name={card.icon as any} size={17} color={card.color} />
              </View>
              <Text style={{ fontSize: 24, fontFamily: "Inter_700Bold", color: card.color }}>{isLoading ? "—" : card.value}</Text>
              <Text style={{ fontSize: 11, color: card.color, fontFamily: "Inter_500Medium", marginTop: 2, opacity: 0.8 }}>{card.label}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {summaryCards.slice(2, 4).map(card => (
            <View key={card.label} style={{ flex: 1, backgroundColor: card.bg, borderRadius: 14, padding: 14 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Feather name={card.icon as any} size={17} color={card.color} />
              </View>
              <Text style={{ fontSize: 24, fontFamily: "Inter_700Bold", color: card.color }}>{isLoading ? "—" : card.value}</Text>
              <Text style={{ fontSize: 11, color: card.color, fontFamily: "Inter_500Medium", marginTop: 2, opacity: 0.8 }}>{card.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Security layers */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 10 }}>
          LAPISAN KEAMANAN ({SECURITY_LAYERS.length} AKTIF)
        </Text>
        <View style={{ backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
          {SECURITY_LAYERS.map((layer, i) => (
            <View key={layer.label} style={{
              flexDirection: "row", alignItems: "flex-start", gap: 12,
              paddingHorizontal: 16, paddingVertical: 14,
              borderBottomWidth: i < SECURITY_LAYERS.length - 1 ? 1 : 0, borderBottomColor: colors.border,
              backgroundColor: "#f0fdf4",
            }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                <Feather name={layer.icon as any} size={15} color="#16a34a" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: "#166534" }}>{layer.label}</Text>
                  <View style={{ backgroundColor: "#16a34a", borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff" }}>AKTIF</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: "#15803d", lineHeight: 17 }}>
                  {layer.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Identity card */}
      <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 10 }}>
          IDENTITAS OPERATOR LEGAL
        </Text>
        <View style={{
          backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
          borderLeftWidth: 4, borderLeftColor: "#2563eb", padding: 16, gap: 10,
        }}>
          {[
            { label: "Nama Operator", value: "Radjapamungkas" },
            { label: "Email Admin", value: "radjapamungkas007@gmail.com" },
            { label: "NIB", value: "2403240017145" },
            { label: "KBLI", value: "47911 (Perdagangan via Internet)" },
            { label: "Session Aktif", value: `${user?.name} (${user?.email})` },
          ].map(item => (
            <View key={item.label} style={{ gap: 2 }}>
              <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>{item.label}</Text>
              <Text style={{ fontSize: 13, color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tips */}
      <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
        <View style={{ backgroundColor: "#fef3c7", borderRadius: 14, borderWidth: 1, borderColor: "#fcd34d", padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Feather name="alert-triangle" size={16} color="#d97706" />
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: "#92400e" }}>Tips Keamanan Admin</Text>
          </View>
          {[
            "Jangan bagikan token/password admin ke siapapun",
            "Selalu logout setelah selesai di perangkat bersama",
            "Perubahan role admin hanya bisa via database langsung",
            "Pantau halaman Monitoring secara berkala",
            "Session aktif otomatis berakhir setelah 30 hari",
          ].map((tip, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <Feather name="check-circle" size={13} color="#d97706" style={{ marginTop: 2 }} />
              <Text style={{ flex: 1, fontSize: 12, color: "#92400e", fontFamily: "Inter_400Regular", lineHeight: 18 }}>
                {tip}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
