import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useRegister } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setAuth } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const registerMutation = useRegister();

  const handleRegister = () => {
    setError("");
    if (!name || !email || !password) {
      setError("Nama, email, dan password wajib diisi");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    registerMutation.mutate(
      { data: { name, email, password, phone: phone || "", role } },
      {
        onSuccess: (data: any) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setAuth(data.token, data.user);
          router.back();
        },
        onError: (err: any) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setError(err?.response?.data?.error ?? "Pendaftaran gagal. Coba lagi.");
        },
      }
    );
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, paddingHorizontal: 24 },
    topSpace: { height: insets.top + 48 },
    back: { position: "absolute", top: insets.top + 16, left: 24, zIndex: 10, padding: 8 },
    logo: {
      width: 56, height: 56, borderRadius: 16,
      backgroundColor: colors.secondary,
      alignItems: "center", justifyContent: "center", marginBottom: 24,
    },
    heading: { fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 8 },
    sub: { fontSize: 15, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 28 },
    label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 8 },
    inputWrap: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: colors.radius, paddingHorizontal: 14, marginBottom: 14, height: 52,
    },
    input: { flex: 1, fontSize: 15, color: colors.foreground, fontFamily: "Inter_400Regular" },
    roleRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    roleBtn: {
      flex: 1, height: 44, borderRadius: colors.radius, borderWidth: 1.5,
      alignItems: "center", justifyContent: "center",
    },
    roleBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
    errorBox: { backgroundColor: colors.destructive + "18", borderRadius: 10, padding: 12, marginBottom: 14 },
    errorText: { color: colors.destructive, fontSize: 13, fontFamily: "Inter_400Regular" },
    btn: {
      backgroundColor: colors.primary, borderRadius: colors.radius,
      height: 52, alignItems: "center", justifyContent: "center", marginTop: 8,
    },
    btnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
    loginRow: { flexDirection: "row", justifyContent: "center", gap: 4, paddingVertical: 24, paddingBottom: insets.bottom + 24 },
    loginText: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    loginLink: { fontSize: 14, color: colors.primary, fontFamily: "Inter_600SemiBold" },
  });

  return (
    <View style={s.container}>
      <Pressable style={s.back} onPress={() => router.back()}>
        <Feather name="x" size={24} color={colors.foreground} />
      </Pressable>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.topSpace} />
          <View style={s.logo}>
            <Feather name="user-plus" size={26} color="#FFF" />
          </View>
          <Text style={s.heading}>Daftar</Text>
          <Text style={s.sub}>Bergabung dengan jutaan pengguna jualdanbeli</Text>

          <Text style={s.label}>Saya ingin</Text>
          <View style={s.roleRow}>
            {(["buyer", "seller"] as const).map((r) => (
              <Pressable
                key={r}
                style={[s.roleBtn, { borderColor: role === r ? colors.primary : colors.border, backgroundColor: role === r ? colors.primary + "15" : "transparent" }]}
                onPress={() => setRole(r)}
              >
                <Text style={[s.roleBtnText, { color: role === r ? colors.primary : colors.mutedForeground }]}>
                  {r === "buyer" ? "Pembeli" : "Penjual"}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={s.label}>Nama Lengkap</Text>
          <View style={s.inputWrap}>
            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Nama kamu" placeholderTextColor={colors.mutedForeground} />
          </View>

          <Text style={s.label}>Email</Text>
          <View style={s.inputWrap}>
            <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="nama@email.com" placeholderTextColor={colors.mutedForeground} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <Text style={s.label}>No. HP (opsional)</Text>
          <View style={s.inputWrap}>
            <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="08xxx" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad" />
          </View>

          <Text style={s.label}>Password</Text>
          <View style={s.inputWrap}>
            <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="Min. 8 karakter" placeholderTextColor={colors.mutedForeground} secureTextEntry={!showPass} autoCapitalize="none" />
            <Pressable onPress={() => setShowPass(!showPass)}>
              <Feather name={showPass ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {!!error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}

          <Pressable style={({ pressed }) => [s.btn, { opacity: pressed || registerMutation.isPending ? 0.75 : 1 }]} onPress={handleRegister} disabled={registerMutation.isPending}>
            {registerMutation.isPending ? <ActivityIndicator color="#FFF" /> : <Text style={s.btnText}>Buat Akun</Text>}
          </Pressable>

          <View style={s.loginRow}>
            <Text style={s.loginText}>Sudah punya akun?</Text>
            <Pressable onPress={() => router.push("/(auth)/login" as any)}>
              <Text style={s.loginLink}>Masuk</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
