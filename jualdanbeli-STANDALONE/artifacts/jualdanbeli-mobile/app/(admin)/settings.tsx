import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Pressable, ScrollView,
  Switch, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/components/ProductCard";

function useSettings(token: string) {
  return useQuery<any>({
    queryKey: ["admin-platform-settings"],
    queryFn: async () => {
      const base = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? "jual-beli-aman.replit.app"}`;
      const res = await fetch(`${base}/api/admin/platform-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal");
      return res.json();
    },
    enabled: !!token,
  });
}

function useSaveSettings(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const base = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? "jual-beli-aman.replit.app"}`;
      const res = await fetch(`${base}/api/admin/platform-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-platform-settings"] }),
  });
}

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
  const colors = useColors();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 6 }}>
        {label}
      </Text>
      {children}
      {hint ? (
        <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 5, lineHeight: 16 }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center" }}>
          <Feather name={icon as any} size={15} color="#2563eb" />
        </View>
        <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground }}>{title}</Text>
      </View>
      <View style={{ backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
        {children}
      </View>
    </View>
  );
}

export default function AdminSettings() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [form, setForm] = useState<Record<string, any>>({});
  const [dirty, setDirty] = useState(false);

  const { data: settings, isLoading } = useSettings(token ?? "");
  const saveSettings = useSaveSettings(token ?? "");

  useEffect(() => {
    if (settings) { setForm(settings); setDirty(false); }
  }, [settings]);

  const set = (key: string, value: any) => {
    setForm(f => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    Alert.alert("Simpan Perubahan", "Yakin ingin menyimpan pengaturan platform?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Simpan",
        onPress: () => {
          saveSettings.mutate(form, {
            onSuccess: () => {
              setDirty(false);
              Alert.alert("✅ Tersimpan", "Pengaturan platform berhasil diperbarui.");
            },
            onError: () => Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan."),
          });
        },
      },
    ]);
  };

  const inputStyle = {
    backgroundColor: colors.muted, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, fontFamily: "Inter_400Regular" as const, fontSize: 14,
    color: colors.foreground,
  };

  const commissionRate = form.commissionRate ?? 1;
  const umkmTaxRate = form.umkmTaxRate ?? 0.5;
  const totalDeduction = commissionRate + umkmTaxRate;
  const sellerReceives = 100 - totalDeduction;

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
          Memuat pengaturan...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Deduction summary */}
        <View style={{
          backgroundColor: "#eff6ff", borderRadius: 16, padding: 16,
          borderWidth: 1, borderColor: "#bfdbfe", marginBottom: 20,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Feather name="info" size={15} color="#2563eb" />
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: "#1d4ed8" }}>
              Ringkasan Potongan Penjual
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 12, alignItems: "center" }}>
              <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: "#2563eb" }}>{commissionRate}%</Text>
              <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 2 }}>Biaya Platform</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 12, alignItems: "center" }}>
              <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: "#7c3aed" }}>{umkmTaxRate}%</Text>
              <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 2 }}>Pajak UMKM</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "#dcfce7", borderRadius: 12, padding: 12, alignItems: "center" }}>
              <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: "#16a34a" }}>{sellerReceives.toFixed(1)}%</Text>
              <Text style={{ fontSize: 10, color: "#16a34a", fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 2 }}>Ke Penjual</Text>
            </View>
          </View>
          <Text style={{ fontSize: 11, color: "#2563eb", fontFamily: "Inter_400Regular", marginTop: 10, lineHeight: 16 }}>
            Contoh: Penjualan Rp 100.000 → Biaya {formatRupiah(commissionRate * 1000)} + Pajak {formatRupiah(umkmTaxRate * 1000)} → Penjual terima {formatRupiah(sellerReceives * 1000)}
          </Text>
        </View>

        {/* Platform Info */}
        <Section title="Informasi Platform" icon="building">
          <Field label="Nama Platform">
            <TextInput
              value={form.platformName ?? ""}
              onChangeText={v => set("platformName", v)}
              style={inputStyle}
              placeholderTextColor={colors.mutedForeground}
              placeholder="jualdanbeli"
            />
          </Field>
          <Field label="Email Kontak Resmi">
            <TextInput
              value={form.contactEmail ?? ""}
              onChangeText={v => set("contactEmail", v)}
              style={inputStyle}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.mutedForeground}
              placeholder="admin@jualdanbeli.com"
            />
          </Field>
        </Section>

        {/* Biaya & Pajak */}
        <Section title="Biaya & Pajak Penjual" icon="dollar-sign">
          <Field label="Biaya Platform (%)" hint="Pendapatan platform dari setiap transaksi penjual">
            <TextInput
              value={String(form.commissionRate ?? 1)}
              onChangeText={v => set("commissionRate", parseFloat(v) || 0)}
              style={inputStyle}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.mutedForeground}
            />
          </Field>
          <Field label="Pajak UMKM — PPh Final (%)" hint="PP No. 23 Tahun 2018: 0,5% dari omzet bruto untuk UMKM <Rp 4,8M/tahun">
            <TextInput
              value={String(form.umkmTaxRate ?? 0.5)}
              onChangeText={v => set("umkmTaxRate", parseFloat(v) || 0)}
              style={inputStyle}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.mutedForeground}
            />
          </Field>
        </Section>

        {/* Penarikan */}
        <Section title="Batas Penarikan Dana" icon="credit-card">
          <Field label="Minimum Penarikan (Rp)">
            <TextInput
              value={String(form.minWithdrawalAmount ?? 50000)}
              onChangeText={v => set("minWithdrawalAmount", parseInt(v) || 0)}
              style={inputStyle}
              keyboardType="number-pad"
              placeholderTextColor={colors.mutedForeground}
            />
          </Field>
          <Field label="Maksimum Penarikan per Hari (Rp)">
            <TextInput
              value={String(form.maxWithdrawalAmount ?? 50000000)}
              onChangeText={v => set("maxWithdrawalAmount", parseInt(v) || 0)}
              style={inputStyle}
              keyboardType="number-pad"
              placeholderTextColor={colors.mutedForeground}
            />
          </Field>
        </Section>

        {/* Escrow */}
        <Section title="Rekening Bersama (Escrow)" icon="shield">
          <Field
            label="Auto-release Escrow (hari)"
            hint="Dana otomatis diteruskan ke penjual jika pembeli tidak konfirmasi dalam X hari setelah pengiriman"
          >
            <TextInput
              value={String(form.autoReleaseEscrowDays ?? 7)}
              onChangeText={v => set("autoReleaseEscrowDays", parseInt(v) || 1)}
              style={inputStyle}
              keyboardType="number-pad"
              placeholderTextColor={colors.mutedForeground}
            />
          </Field>
        </Section>

        {/* Maintenance Mode */}
        <Section title="Status Platform" icon="settings">
          <View style={{
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            backgroundColor: form.maintenanceMode ? "#fee2e2" : colors.muted,
            borderRadius: 12, padding: 16,
          }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontFamily: "Inter_700Bold", fontSize: 14, color: form.maintenanceMode ? "#dc2626" : colors.foreground }}>
                Mode Maintenance
              </Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, marginTop: 3 }}>
                {form.maintenanceMode
                  ? "Platform hanya bisa diakses admin"
                  : "Jika aktif, user biasa melihat halaman maintenance"}
              </Text>
            </View>
            <Switch
              value={form.maintenanceMode ?? false}
              onValueChange={v => set("maintenanceMode", v)}
              trackColor={{ false: "#d1d5db", true: "#fca5a5" }}
              thumbColor={form.maintenanceMode ? "#dc2626" : "#fff"}
            />
          </View>
        </Section>
      </ScrollView>

      {/* Save FAB */}
      {dirty && (
        <Pressable
          style={({ pressed }) => ({
            position: "absolute", bottom: insets.bottom + 24, left: 20, right: 20,
            backgroundColor: pressed ? "#1e40af" : "#2563eb",
            borderRadius: 16, paddingVertical: 18,
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
            shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
            opacity: saveSettings.isPending ? 0.7 : 1,
          })}
          onPress={handleSave}
          disabled={saveSettings.isPending}
        >
          <Feather name="save" size={18} color="#fff" />
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" }}>
            {saveSettings.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
