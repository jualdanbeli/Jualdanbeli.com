import { Feather } from "@expo/vector-icons";
import {
  useAdminGetDisputes,
  useAdminResolveDispute,
  getAdminGetDisputesQueryKey,
  DisputeResolutionOutcome,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator, Alert, Modal, Pressable, RefreshControl,
  ScrollView, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  open:          { label: "Terbuka",   color: "#dc2626", bg: "#fee2e2", icon: "alert-triangle" },
  investigating: { label: "Ditinjau",  color: "#2563eb", bg: "#dbeafe", icon: "search" },
  resolved:      { label: "Selesai",   color: "#16a34a", bg: "#dcfce7", icon: "check-circle" },
  closed:        { label: "Ditutup",   color: "#6b7280", bg: "#f3f4f6", icon: "x" },
};

const OUTCOME_OPTIONS = [
  { value: "resolved_buyer" as DisputeResolutionOutcome, label: "Menangkan Pembeli (Refund)", color: "#2563eb" },
  { value: "resolved_seller" as DisputeResolutionOutcome, label: "Menangkan Penjual (Dana Cair)", color: "#16a34a" },
];

export default function AdminDisputes() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const qc = useQueryClient();

  const { data: disputes, isLoading, refetch, isRefetching } = useAdminGetDisputes(
    { query: { enabled: !!token } } as any
  );
  const resolveDispute = useAdminResolveDispute();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<DisputeResolutionOutcome>("resolved_buyer");
  const [ruling, setRuling] = useState("");

  const list: any[] = Array.isArray(disputes) ? disputes : [];
  const active = list.filter(d => d.status === "open" || d.status === "investigating");
  const resolved = list.filter(d => d.status === "resolved" || d.status === "closed");

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const handleResolve = () => {
    if (!selectedId || !ruling.trim()) {
      Alert.alert("Tidak Lengkap", "Masukkan keputusan/alasan terlebih dahulu.");
      return;
    }
    resolveDispute.mutate(
      { disputeId: selectedId, data: { outcome, ruling } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getAdminGetDisputesQueryKey() });
          setSelectedId(null);
          setRuling("");
          Alert.alert("✅ Berhasil", "Sengketa berhasil diselesaikan.");
        },
        onError: () => Alert.alert("Gagal", "Terjadi kesalahan."),
      }
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const selectedDispute = list.find(d => d.id === selectedId);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563eb" />}
      >
        {/* Summary */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: "#fee2e2", borderRadius: 14, padding: 14, alignItems: "center" }}>
            <Text style={{ fontSize: 26, fontFamily: "Inter_700Bold", color: "#dc2626" }}>{active.length}</Text>
            <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: "#dc2626", marginTop: 2 }}>Aktif</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#dcfce7", borderRadius: 14, padding: 14, alignItems: "center" }}>
            <Text style={{ fontSize: 26, fontFamily: "Inter_700Bold", color: "#16a34a" }}>{resolved.length}</Text>
            <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: "#16a34a", marginTop: 2 }}>Selesai</Text>
          </View>
        </View>

        {/* Active Disputes */}
        {active.length > 0 && (
          <>
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 10 }}>
              SENGKETA AKTIF ({active.length})
            </Text>
            {active.map(dispute => {
              const sc = STATUS_CONFIG[dispute.status] ?? STATUS_CONFIG.open;
              return (
                <View key={dispute.id} style={{
                  backgroundColor: colors.card, borderRadius: 16,
                  borderWidth: 1, borderColor: "#fecaca",
                  overflow: "hidden", marginBottom: 12,
                }}>
                  <View style={{
                    paddingHorizontal: 16, paddingVertical: 12,
                    borderBottomWidth: 1, borderBottomColor: colors.border,
                    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: sc.bg, alignItems: "center", justifyContent: "center" }}>
                        <Feather name={sc.icon as any} size={16} color={sc.color} />
                      </View>
                      <View>
                        <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: colors.foreground }}>
                          Pesanan #{dispute.orderId}
                        </Text>
                        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: colors.mutedForeground }}>
                          {formatDate(dispute.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={{ backgroundColor: sc.bg, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: sc.color }}>{sc.label}</Text>
                    </View>
                  </View>

                  <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
                    <View>
                      <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Alasan</Text>
                      <Text style={{ fontSize: 13, color: colors.foreground, fontFamily: "Inter_600SemiBold", marginTop: 2 }}>
                        {dispute.reason?.replace(/_/g, " ")}
                      </Text>
                    </View>
                    {dispute.description ? (
                      <View style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12 }}>
                        <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", lineHeight: 18 }}>
                          {dispute.description}
                        </Text>
                      </View>
                    ) : null}
                    <Pressable
                      style={({ pressed }) => ({
                        paddingVertical: 12, borderRadius: 12,
                        backgroundColor: pressed ? "#1e40af" : "#2563eb",
                        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
                      })}
                      onPress={() => {
                        setSelectedId(dispute.id);
                        setOutcome("resolved_buyer");
                        setRuling("");
                      }}
                    >
                      <Feather name="edit-2" size={15} color="#fff" />
                      <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: "#fff" }}>
                        Selesaikan Sengketa
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Resolved */}
        {resolved.length > 0 && (
          <>
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 10, marginTop: 8 }}>
              RIWAYAT SENGKETA ({resolved.length})
            </Text>
            {resolved.map(dispute => {
              const sc = STATUS_CONFIG[dispute.status] ?? STATUS_CONFIG.resolved;
              return (
                <View key={dispute.id} style={{
                  backgroundColor: colors.card, borderRadius: 14,
                  borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 10,
                }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: colors.foreground }}>
                      Pesanan #{dispute.orderId}
                    </Text>
                    <View style={{ backgroundColor: sc.bg, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: sc.color }}>{sc.label}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                    {dispute.reason?.replace(/_/g, " ")} · {formatDate(dispute.createdAt)}
                  </Text>
                  {dispute.ruling ? (
                    <View style={{ backgroundColor: "#dbeafe", borderRadius: 8, padding: 10, marginTop: 8 }}>
                      <Text style={{ fontSize: 12, color: "#1d4ed8", fontFamily: "Inter_500Medium" }}>
                        Keputusan: {dispute.ruling}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </>
        )}

        {list.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 80, gap: 12 }}>
            <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center" }}>
              <Feather name="shield" size={34} color="#16a34a" />
            </View>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: colors.foreground }}>Tidak ada sengketa</Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.mutedForeground, textAlign: "center" }}>
              Semua transaksi berjalan dengan lancar
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Resolve Modal */}
      <Modal visible={!!selectedId} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{
            backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 20, paddingBottom: insets.bottom + 20,
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 18, color: colors.foreground }}>
                Selesaikan Sengketa
              </Text>
              <Pressable onPress={() => setSelectedId(null)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 10 }}>
              Keputusan
            </Text>
            {OUTCOME_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 12,
                  padding: 14, borderRadius: 12, marginBottom: 8,
                  backgroundColor: outcome === opt.value ? opt.color + "18" : colors.muted,
                  borderWidth: 2,
                  borderColor: outcome === opt.value ? opt.color : "transparent",
                }}
                onPress={() => setOutcome(opt.value)}
              >
                <View style={{
                  width: 20, height: 20, borderRadius: 10,
                  borderWidth: 2, borderColor: outcome === opt.value ? opt.color : colors.mutedForeground,
                  alignItems: "center", justifyContent: "center",
                }}>
                  {outcome === opt.value && (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: opt.color }} />
                  )}
                </View>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: outcome === opt.value ? opt.color : colors.foreground }}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}

            <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 8, marginTop: 12 }}>
              Penjelasan Keputusan *
            </Text>
            <TextInput
              value={ruling}
              onChangeText={setRuling}
              placeholder="Jelaskan dasar keputusan admin..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={{
                backgroundColor: colors.muted, borderRadius: 12, padding: 14,
                fontFamily: "Inter_400Regular", fontSize: 14, color: colors.foreground,
                minHeight: 100, textAlignVertical: "top", marginBottom: 16,
              }}
            />

            <Pressable
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#1e40af" : "#2563eb",
                paddingVertical: 16, borderRadius: 14,
                alignItems: "center", opacity: resolveDispute.isPending ? 0.6 : 1,
              })}
              onPress={handleResolve}
              disabled={resolveDispute.isPending}
            >
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" }}>
                {resolveDispute.isPending ? "Memproses..." : "Konfirmasi Keputusan"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
