import { Feather } from "@expo/vector-icons";
import {
  useAdminGetWithdrawals,
  useAdminProcessWithdrawal,
  getAdminGetWithdrawalsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator, Alert, Pressable, RefreshControl,
  ScrollView, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/components/ProductCard";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:   { label: "Menunggu",  color: "#d97706", bg: "#fef3c7", icon: "clock" },
  approved:  { label: "Disetujui", color: "#16a34a", bg: "#dcfce7", icon: "check-circle" },
  completed: { label: "Selesai",   color: "#16a34a", bg: "#dcfce7", icon: "check-circle" },
  rejected:  { label: "Ditolak",   color: "#dc2626", bg: "#fee2e2", icon: "x-circle" },
};

export default function AdminWithdrawals() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const qc = useQueryClient();
  const [processing, setProcessing] = useState<number | null>(null);

  const { data: withdrawals, isLoading, refetch, isRefetching } = useAdminGetWithdrawals(
    {},
    { query: { enabled: !!token } as any }
  );
  const processWithdrawal = useAdminProcessWithdrawal();

  const list: any[] = Array.isArray(withdrawals) ? withdrawals : [];
  const pending = list.filter(w => w.status === "pending");
  const done = list.filter(w => w.status !== "pending");

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const handleProcess = (id: number, name: string, amount: number, action: "approved" | "rejected") => {
    Alert.alert(
      action === "approved" ? "✅ Setujui Penarikan" : "❌ Tolak Penarikan",
      `${action === "approved" ? "Setujui" : "Tolak"} penarikan ${formatRupiah(amount)} dari ${name}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: action === "approved" ? "Setujui" : "Tolak",
          style: action === "rejected" ? "destructive" : "default",
          onPress: () => {
            setProcessing(id);
            processWithdrawal.mutate(
              { withdrawalId: id, data: { status: action, notes: `Admin ${action} via mobile` } },
              {
                onSuccess: () => {
                  qc.invalidateQueries({ queryKey: getAdminGetWithdrawalsQueryKey() });
                  refetch();
                  Alert.alert("Berhasil", `Penarikan berhasil di-${action === "approved" ? "setujui" : "tolak"}.`);
                },
                onError: () => Alert.alert("Gagal", "Terjadi kesalahan, coba lagi."),
                onSettled: () => setProcessing(null),
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
        <Text style={{ marginTop: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
          Memuat permintaan penarikan...
        </Text>
      </View>
    );
  }

  const renderWithdrawal = (item: any, showActions: boolean) => {
    const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
    const bank = item.description?.split("-")?.[0]?.trim() ?? "Bank";
    return (
      <View
        key={item.id}
        style={{
          backgroundColor: colors.card, borderRadius: 16,
          borderWidth: 1, borderColor: colors.border,
          overflow: "hidden", marginBottom: 10,
        }}
      >
        <View style={{
          paddingHorizontal: 16, paddingVertical: 12,
          borderBottomWidth: 1, borderBottomColor: colors.border,
          flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{
              width: 38, height: 38, borderRadius: 11,
              backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center",
            }}>
              <Feather name="credit-card" size={17} color="#2563eb" />
            </View>
            <View>
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: colors.foreground }}>
                User #{item.userId ?? "—"}
              </Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground }}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
          <View style={{ backgroundColor: sc.bg, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: sc.color }}>{sc.label}</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Bank Tujuan</Text>
              <Text style={{ fontSize: 13, color: colors.foreground, fontFamily: "Inter_600SemiBold", marginTop: 2 }}>
                {bank}
              </Text>
              {item.description ? (
                <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 }}>
                  {item.description}
                </Text>
              ) : null}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Jumlah</Text>
              <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: "#2563eb", marginTop: 2 }}>
                {formatRupiah(item.amount ?? 0)}
              </Text>
            </View>
          </View>

          {showActions && (
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <Pressable
                style={({ pressed }) => ({
                  flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
                  gap: 6, paddingVertical: 10, borderRadius: 10,
                  backgroundColor: pressed ? "#fca5a5" : "#fee2e2",
                  opacity: processing === item.id ? 0.5 : 1,
                })}
                onPress={() => handleProcess(item.id, `User #${item.userId}`, item.amount, "rejected")}
                disabled={processing === item.id}
              >
                <Feather name="x" size={15} color="#dc2626" />
                <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: "#dc2626" }}>Tolak</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => ({
                  flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
                  gap: 6, paddingVertical: 10, borderRadius: 10,
                  backgroundColor: pressed ? "#86efac" : "#dcfce7",
                  opacity: processing === item.id ? 0.5 : 1,
                })}
                onPress={() => handleProcess(item.id, `User #${item.userId}`, item.amount, "approved")}
                disabled={processing === item.id}
              >
                <Feather name="check" size={15} color="#16a34a" />
                <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: "#16a34a" }}>Setujui</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563eb" />}
    >
      {/* Summary */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
        <View style={{
          flex: 1, backgroundColor: "#fef3c7", borderRadius: 14,
          padding: 14, alignItems: "center",
        }}>
          <Text style={{ fontSize: 26, fontFamily: "Inter_700Bold", color: "#d97706" }}>{pending.length}</Text>
          <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: "#d97706", marginTop: 2 }}>Menunggu</Text>
        </View>
        <View style={{
          flex: 1, backgroundColor: "#dcfce7", borderRadius: 14,
          padding: 14, alignItems: "center",
        }}>
          <Text style={{ fontSize: 26, fontFamily: "Inter_700Bold", color: "#16a34a" }}>{done.length}</Text>
          <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: "#16a34a", marginTop: 2 }}>Diproses</Text>
        </View>
      </View>

      {/* Pending */}
      {pending.length > 0 && (
        <>
          <Text style={{
            fontSize: 11, fontFamily: "Inter_700Bold",
            color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 10,
          }}>
            MENUNGGU PERSETUJUAN ({pending.length})
          </Text>
          {pending.map(w => renderWithdrawal(w, true))}
        </>
      )}

      {/* Done */}
      {done.length > 0 && (
        <>
          <Text style={{
            fontSize: 11, fontFamily: "Inter_700Bold",
            color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 10, marginTop: pending.length > 0 ? 12 : 0,
          }}>
            RIWAYAT ({done.length})
          </Text>
          {done.map(w => renderWithdrawal(w, false))}
        </>
      )}

      {list.length === 0 && (
        <View style={{ alignItems: "center", paddingTop: 80, gap: 12 }}>
          <View style={{
            width: 72, height: 72, borderRadius: 20,
            backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
          }}>
            <Feather name="credit-card" size={34} color={colors.mutedForeground} />
          </View>
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: colors.foreground }}>
            Belum ada permintaan
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.mutedForeground }}>
            Permintaan penarikan penjual akan muncul di sini
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
