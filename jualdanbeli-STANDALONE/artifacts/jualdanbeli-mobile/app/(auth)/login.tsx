import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useLogin } from "@workspace/api-client-react";
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

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useLogin();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loginMutation.mutate(
      { data: { email, password } },
      {
        onSuccess: (data: any) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setAuth(data.token, data.user);
          router.back();
        },
        onError: (err: any) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setError(err?.response?.data?.error ?? "Login gagal. Periksa email & password.");
        },
      }
    );
  };

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: 24,
    },
    topSpace: {
      height: insets.top + 48,
    },
    back: {
      position: "absolute",
      top: insets.top + 16,
      left: 24,
      zIndex: 10,
      padding: 8,
    },
    logo: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    heading: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 8,
    },
    sub: {
      fontSize: 15,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginBottom: 36,
    },
    label: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 8,
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      paddingHorizontal: 14,
      marginBottom: 16,
      height: 52,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    errorBox: {
      backgroundColor: colors.destructive + "18",
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      color: colors.destructive,
      fontSize: 13,
      fontFamily: "Inter_400Regular",
    },
    btn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    btnText: {
      color: "#FFF",
      fontSize: 16,
      fontFamily: "Inter_700Bold",
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 24,
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    registerRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 4,
      paddingBottom: insets.bottom + 24,
    },
    registerText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    registerLink: {
      fontSize: 14,
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
    },
  });

  return (
    <View style={s.container}>
      <Pressable style={s.back} onPress={() => router.back()}>
        <Feather name="x" size={24} color={colors.foreground} />
      </Pressable>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.topSpace} />
          <View style={s.logo}>
            <Feather name="shopping-bag" size={28} color="#FFF" />
          </View>
          <Text style={s.heading}>Masuk</Text>
          <Text style={s.sub}>Selamat datang kembali di jualdanbeli</Text>

          <Text style={s.label}>Email</Text>
          <View style={s.inputWrap}>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={s.label}>Password</Text>
          <View style={s.inputWrap}>
            <TextInput
              style={s.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPass}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPass(!showPass)}>
              <Feather
                name={showPass ? "eye-off" : "eye"}
                size={18}
                color={colors.mutedForeground}
              />
            </Pressable>
          </View>

          {!!error && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [s.btn, { opacity: pressed || loginMutation.isPending ? 0.75 : 1 }]}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={s.btnText}>Masuk</Text>
            )}
          </Pressable>

          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>atau</Text>
            <View style={s.dividerLine} />
          </View>

          <View style={s.registerRow}>
            <Text style={s.registerText}>Belum punya akun?</Text>
            <Pressable onPress={() => router.push("/(auth)/register" as any)}>
              <Text style={s.registerLink}>Daftar sekarang</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
