import { Feather } from "@expo/vector-icons";
import { useAdminGetUsers, useAdminUpdateUserStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator, Alert, Pressable, RefreshControl,
  ScrollView, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  active: { label: "Aktif", color: "#16a34a", bg: "#dcfce7", icon: "check-circle" },
  suspended: { label: "Suspend", color: "#d97706", bg: "#fef3c7", icon: "pause-circle" },
  banned: { label: "Banned", color: "#dc2626", bg: "#fee2e2", icon: "x-circle" },
};

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  buyer: { label: "Pembeli", color: "#2563eb", bg: "#dbeafe" },
  seller: { label: "Penjual", color: "#7c3aed", bg: "#ede9fe" },
  admin: { label: "Admin", color: "#fff", bg: "#0f172a" },
};

const AVATAR_COLORS = [
  ["#2563eb", "#1d4ed8"],
  ["#7c3aed", "#6d28d9"],
  ["#059669", "#047857"],
  ["#ea580c", "#c2410c"],
  ["#0891b2", "#0e7490"],
];

function getAvatarGradient(id: number): [string, string] {
  return AVATAR_COLORS[id % AVATAR_COLORS.length] as [string, string];
}

export default function AdminUsers() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: usersData, isLoading, refetch, isRefetching } = useAdminGetUsers(
    { q: search || undefined },
    { query: { enabled: !!token } as any }
  );
  const updateStatus = useAdminUpdateUserStatus();

  const users: any[] = (usersData as any)?.users ?? [];

  const handleAction = (userId: number, userName: string, currentStatus: string) => {
    const actions = [];
    if (currentStatus !== "banned") {
      actions.push({
        text: "🚫 Ban Permanen",
        style: "destructive" as const,
        onPress: () => confirmAction(userId, userName, "banned"),
      });
    }
    if (currentStatus !== "suspended") {
      actions.push({
        text: "⏸ Suspend Sementara",
        onPress: () => confirmAction(userId, userName, "suspended"),
      });
    }
    if (currentStatus !== "active") {
      actions.push({
        text: "✅ Aktifkan Kembali",
        onPress: () => confirmAction(userId, userName, "active"),
      });
    }
    actions.push({ text: "Batal", style: "cancel" as const });
    Alert.alert(`Kelola: ${userName}`, "Pilih tindakan moderasi:", actions);
  };

  const confirmAction = (userId: number, userName: string, newStatus: string) => {
    const labels: Record<string, string> = {
      banned: "ban permanen",
      suspended: "suspend",
      active: "aktifkan kembali",
    };
    Alert.alert(
      "Konfirmasi Tindakan",
      `${labels[newStatus]} akun ${userName}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Lanjutkan",
          style: newStatus === "banned" ? "destructive" : "default",
          onPress: () => {
            updateStatus.mutate(
              { userId, data: { status: newStatus as any, reason: "Admin action via mobile" } },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["admin"] });
                  refetch();
                  Alert.alert("✅ Berhasil", `Akun ${userName} berhasil di-${labels[newStatus]}`);
                },
                onError: () => Alert.alert("❌ Gagal", "Terjadi kesalahan, coba lagi."),
              }
            );
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Search Bar */}
      <View style={{
        backgroundColor: colors.card,
        paddingHorizontal: 16, paddingVertical: 12,
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
            placeholder="Cari nama atau email..."
            placeholderTextColor={colors.mutedForeground}
            style={{
              flex: 1, fontFamily: "Inter_400Regular",
              fontSize: 14, color: colors.foreground,
            }}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search ? (
            <Pressable
              onPress={() => setSearch("")}
              style={{
                width: 22, height: 22, borderRadius: 11,
                backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
              }}
            >
              <Feather name="x" size={13} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginTop: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14 }}>
            Memuat pengguna...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563eb" />}
        >
          {/* Count */}
          <View style={{
            paddingHorizontal: 16, paddingVertical: 8,
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          }}>
            <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground }}>
              {users.length} pengguna ditemukan
            </Text>
            {search ? (
              <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                Filter: "{search}"
              </Text>
            ) : null}
          </View>

          {/* User List */}
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {users.map((u: any) => {
              const statusInfo = STATUS_CONFIG[u.status] ?? STATUS_CONFIG.active;
              const roleInfo = ROLE_CONFIG[u.role] ?? { label: u.role, color: "#6b7280", bg: "#f3f4f6" };
              const isAdmin = u.role === "admin";
              const [c1, c2] = getAvatarGradient(u.id);

              return (
                <Pressable
                  key={u.id}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? colors.muted : colors.card,
                    borderRadius: 16, borderWidth: 1, borderColor: colors.border,
                    padding: 14, flexDirection: "row", alignItems: "center", gap: 14,
                  })}
                  onPress={() => !isAdmin && handleAction(u.id, u.name, u.status)}
                  disabled={isAdmin}
                >
                  {/* Avatar */}
                  <View style={{
                    width: 50, height: 50, borderRadius: 14,
                    backgroundColor: isAdmin ? "#0f172a" : c1,
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Text style={{
                      fontSize: 20, fontFamily: "Inter_700Bold",
                      color: "#fff",
                    }}>
                      {u.name?.charAt(0)?.toUpperCase()}
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={{ fontFamily: "Inter_700Bold", fontSize: 15, color: colors.foreground }}>
                      {u.name}
                    </Text>
                    <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground }}>
                      {u.email}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 6, marginTop: 2 }}>
                      <View style={{
                        backgroundColor: roleInfo.bg, borderRadius: 6,
                        paddingHorizontal: 7, paddingVertical: 2,
                      }}>
                        <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: roleInfo.color }}>
                          {roleInfo.label}
                        </Text>
                      </View>
                      <View style={{
                        backgroundColor: statusInfo.bg, borderRadius: 6,
                        paddingHorizontal: 7, paddingVertical: 2,
                        flexDirection: "row", alignItems: "center", gap: 3,
                      }}>
                        <Feather name={statusInfo.icon as any} size={9} color={statusInfo.color} />
                        <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: statusInfo.color }}>
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action */}
                  {!isAdmin ? (
                    <View style={{
                      width: 36, height: 36, borderRadius: 10,
                      backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
                    }}>
                      <Feather name="more-vertical" size={16} color={colors.mutedForeground} />
                    </View>
                  ) : (
                    <View style={{
                      width: 36, height: 36, borderRadius: 10,
                      backgroundColor: "#0f172a20", alignItems: "center", justifyContent: "center",
                    }}>
                      <Feather name="shield" size={15} color="#0f172a" />
                    </View>
                  )}
                </Pressable>
              );
            })}

            {users.length === 0 && (
              <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
                <View style={{
                  width: 72, height: 72, borderRadius: 20,
                  backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
                }}>
                  <Feather name="users" size={34} color={colors.mutedForeground} />
                </View>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold", fontSize: 15 }}>
                  Tidak ada pengguna ditemukan
                </Text>
                {search ? (
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13 }}>
                    Coba kata kunci yang berbeda
                  </Text>
                ) : null}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
