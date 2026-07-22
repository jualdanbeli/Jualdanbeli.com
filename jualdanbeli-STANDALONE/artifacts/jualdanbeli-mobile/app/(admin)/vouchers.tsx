import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator, Alert, Modal, Pressable, RefreshControl,
  ScrollView, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/components/ProductCard";

function useVouchers(token: string) {
  return useQuery<any[]>({
    queryKey: ["admin-vouchers"],
    queryFn: async () => {
      const base = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? "jual-beli-aman.replit.app"}`;
      const res = await fetch(`${base}/api/vouchers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal");
      return res.json();
    },
    enabled: !!token,
  });
}

function useCreateVoucher(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const base = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? "jual-beli-aman.replit.app"}`;
      const res = await fetch(`${base}/api/vouchers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Gagal"); }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-vouchers"] }),
  });
}

function useToggleVoucher(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const base = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? "jual-beli-aman.replit.app"}`;
      await fetch(`${base}/api/vouchers/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-vouchers"] }),
  });
}

const EMPTY_FORM = {
  code: "", type: "percentage", value: "", minOrder: "",
  maxDiscount: "", maxUses: "", expiresAt: "", description: "",
};

export default function AdminVouchers() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: vouchers, isLoading, refetch, isRefetching } = useVouchers(token ?? "");
  const createVoucher = useCreateVoucher(token ?? "");
  const toggleVoucher = useToggleVoucher(token ?? "");

  const list: any[] = Array.isArray(vouchers) ? vouchers : [];
  const active = list.filter(v => v.isActive);
  const inactive = list.filter(v => !v.isActive);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleCreate = () => {
    if (!form.code || !form.value) {
      Alert.alert("Tidak Lengkap", "Kode dan nilai diskon wajib diisi.");
      return;
    }
    createVoucher.mutate(
      {
        code: form.code.toUpperCase(),
        type: form.type,
        value: parseFloat(form.value),
        minOrder: form.minOrder ? parseFloat(form.minOrder) : 0,
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
        maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
        description: form.description || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert("✅ Berhasil", "Voucher berhasil dibuat!");
          setShowCreate(false);
          setForm(EMPTY_FORM);
        },
        onError: (err: any) => Alert.alert("Gagal", err.message ?? "Terjadi kesalahan."),
      }
    );
  };

  const handleToggle = (id: number, code: string, isActive: boolean) => {
    Alert.alert(
      isActive ? "Nonaktifkan Voucher" : "Aktifkan Voucher",
      `${isActive ? "Nonaktifkan" : "Aktifkan"} voucher ${code}?`,
      [
        { text: "Batal", style: "cancel" },
        { text: "Ya", onPress: () => toggleVoucher.mutate(id) },
      ]
    );
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const renderVoucher = (v: any) => (
    <View key={v.id} style={{
      backgroundColor: colors.card, borderRadius: 16,
      borderWidth: 1, borderColor: v.isActive ? "#dbeafe" : colors.border,
      overflow: "hidden", marginBottom: 10,
      opacity: v.isActive ? 1 : 0.65,
    }}>
      <View style={{ height: 4, backgroundColor: v.isActive ? "#2563eb" : colors.muted }} />
      <View style={{ padding: 16, gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 18, color: colors.foreground, letterSpacing: 2 }}>
            {v.code}
          </Text>
          <View style={{
            backgroundColor: v.isActive ? "#dcfce7" : colors.muted,
            paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8,
          }}>
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: v.isActive ? "#16a34a" : colors.mutedForeground }}>
              {v.isActive ? "Aktif" : "Nonaktif"}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center" }}>
            <Feather name={v.type === "percentage" ? "percent" : "tag"} size={16} color="#2563eb" />
          </View>
          <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: "#2563eb" }}>
            {v.type === "percentage" ? `${v.value}%` : formatRupiah(v.value)}
          </Text>
          {v.type === "percentage" && v.maxDiscount ? (
            <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
              maks. {formatRupiah(v.maxDiscount)}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: 4 }}>
          {v.minOrder > 0 && (
            <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
              📦 Min. belanja: {formatRupiah(v.minOrder)}
            </Text>
          )}
          <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
            🔢 Digunakan: {v.usedCount}{v.maxUses ? ` / ${v.maxUses}` : " (tak terbatas)"}
          </Text>
          {v.expiresAt && (
            <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
              ⏰ Kadaluarsa: {formatDate(v.expiresAt)}
            </Text>
          )}
          {v.description && (
            <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontStyle: "italic" }}>
              {v.description}
            </Text>
          )}
        </View>

        <Pressable
          style={({ pressed }) => ({
            paddingVertical: 10, borderRadius: 10,
            backgroundColor: pressed ? colors.muted : v.isActive ? "#fee2e2" : "#dcfce7",
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
          })}
          onPress={() => handleToggle(v.id, v.code, v.isActive)}
        >
          <Feather name={v.isActive ? "toggle-left" : "toggle-right"} size={16} color={v.isActive ? "#dc2626" : "#16a34a"} />
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: v.isActive ? "#dc2626" : "#16a34a" }}>
            {v.isActive ? "Nonaktifkan" : "Aktifkan"}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563eb" />}
      >
        {/* Summary */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: "#dbeafe", borderRadius: 14, padding: 14, alignItems: "center" }}>
            <Text style={{ fontSize: 26, fontFamily: "Inter_700Bold", color: "#2563eb" }}>{active.length}</Text>
            <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: "#2563eb", marginTop: 2 }}>Aktif</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.muted, borderRadius: 14, padding: 14, alignItems: "center" }}>
            <Text style={{ fontSize: 26, fontFamily: "Inter_700Bold", color: colors.mutedForeground }}>{inactive.length}</Text>
            <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginTop: 2 }}>Nonaktif</Text>
          </View>
        </View>

        {active.length > 0 && (
          <>
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 10 }}>
              VOUCHER AKTIF ({active.length})
            </Text>
            {active.map(renderVoucher)}
          </>
        )}

        {inactive.length > 0 && (
          <>
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground, letterSpacing: 1.2, marginBottom: 10, marginTop: 8 }}>
              NONAKTIF ({inactive.length})
            </Text>
            {inactive.map(renderVoucher)}
          </>
        )}

        {list.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
            <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}>
              <Feather name="tag" size={34} color={colors.mutedForeground} />
            </View>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: colors.foreground }}>Belum ada voucher</Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: colors.mutedForeground, textAlign: "center" }}>
              Buat voucher diskon untuk menarik lebih banyak pembeli
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => ({
          position: "absolute", bottom: insets.bottom + 24, right: 20,
          backgroundColor: pressed ? "#1e40af" : "#2563eb",
          borderRadius: 18, paddingHorizontal: 20, paddingVertical: 16,
          flexDirection: "row", alignItems: "center", gap: 8,
          shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
        })}
        onPress={() => setShowCreate(true)}
      >
        <Feather name="plus" size={18} color="#fff" />
        <Text style={{ fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff" }}>Buat Voucher</Text>
      </Pressable>

      {/* Create Modal */}
      <Modal visible={showCreate} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <ScrollView
            style={{ backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%" }}
            contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 18, color: colors.foreground }}>Buat Voucher Baru</Text>
              <Pressable onPress={() => setShowCreate(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {/* Kode */}
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: colors.foreground, marginBottom: 6 }}>Kode Voucher *</Text>
            <TextInput
              value={form.code}
              onChangeText={v => set("code", v.toUpperCase())}
              placeholder="Contoh: DISKON50"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={{ backgroundColor: colors.muted, borderRadius: 12, padding: 14, fontFamily: "Inter_700Bold", fontSize: 15, color: colors.foreground, letterSpacing: 2, marginBottom: 14 }}
            />

            {/* Tipe */}
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: colors.foreground, marginBottom: 8 }}>Tipe Diskon</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
              {[{ v: "percentage", label: "Persentase (%)" }, { v: "fixed", label: "Nominal (Rp)" }].map(opt => (
                <Pressable
                  key={opt.v}
                  style={{
                    flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center",
                    backgroundColor: form.type === opt.v ? "#2563eb" : colors.muted,
                  }}
                  onPress={() => set("type", opt.v)}
                >
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: form.type === opt.v ? "#fff" : colors.foreground }}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Value */}
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: colors.foreground, marginBottom: 6 }}>
              Nilai {form.type === "percentage" ? "(%)" : "(Rp)"} *
            </Text>
            <TextInput
              value={form.value}
              onChangeText={v => set("value", v)}
              placeholder={form.type === "percentage" ? "10" : "50000"}
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              style={{ backgroundColor: colors.muted, borderRadius: 12, padding: 14, fontFamily: "Inter_400Regular", fontSize: 14, color: colors.foreground, marginBottom: 14 }}
            />

            {/* Min Order + Max Discount */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.foreground, marginBottom: 6 }}>Min. Belanja (Rp)</Text>
                <TextInput
                  value={form.minOrder}
                  onChangeText={v => set("minOrder", v)}
                  placeholder="100000"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, fontFamily: "Inter_400Regular", fontSize: 13, color: colors.foreground }}
                />
              </View>
              {form.type === "percentage" && (
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.foreground, marginBottom: 6 }}>Maks. Diskon (Rp)</Text>
                  <TextInput
                    value={form.maxDiscount}
                    onChangeText={v => set("maxDiscount", v)}
                    placeholder="100000"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                    style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, fontFamily: "Inter_400Regular", fontSize: 13, color: colors.foreground }}
                  />
                </View>
              )}
            </View>

            {/* Max Uses + Expires */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.foreground, marginBottom: 6 }}>Maks. Penggunaan</Text>
                <TextInput
                  value={form.maxUses}
                  onChangeText={v => set("maxUses", v)}
                  placeholder="Tak terbatas"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, fontFamily: "Inter_400Regular", fontSize: 13, color: colors.foreground }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.foreground, marginBottom: 6 }}>Kadaluarsa (YYYY-MM-DD)</Text>
                <TextInput
                  value={form.expiresAt}
                  onChangeText={v => set("expiresAt", v)}
                  placeholder="2025-12-31"
                  placeholderTextColor={colors.mutedForeground}
                  style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, fontFamily: "Inter_400Regular", fontSize: 13, color: colors.foreground }}
                />
              </View>
            </View>

            {/* Description */}
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 13, color: colors.foreground, marginBottom: 6 }}>Deskripsi (opsional)</Text>
            <TextInput
              value={form.description}
              onChangeText={v => set("description", v)}
              placeholder="Keterangan voucher..."
              placeholderTextColor={colors.mutedForeground}
              style={{ backgroundColor: colors.muted, borderRadius: 12, padding: 14, fontFamily: "Inter_400Regular", fontSize: 14, color: colors.foreground, marginBottom: 20 }}
            />

            <Pressable
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#1e40af" : "#2563eb",
                paddingVertical: 16, borderRadius: 14, alignItems: "center",
                opacity: createVoucher.isPending ? 0.6 : 1,
              })}
              onPress={handleCreate}
              disabled={createVoucher.isPending}
            >
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" }}>
                {createVoucher.isPending ? "Membuat..." : "Buat Voucher"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
