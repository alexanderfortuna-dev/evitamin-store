import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  useColorScheme,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getColors } from "@/constants/colors";
import { useStore } from "@/lib/store";
import { apiRequest } from "@/lib/query-client";

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();
  const { setAuth } = useStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = useCallback(async () => {
    setError("");
    if (!name.trim() || name.trim().length < 2) { setError("Nama minimal 2 karakter"); return; }
    if (!phone.trim() || phone.trim().length < 9) { setError("Nomor HP minimal 9 digit"); return; }
    if (!password || password.length < 6) { setError("Password minimal 6 karakter"); return; }
    if (password !== confirmPassword) { setError("Konfirmasi password tidak sama"); return; }

    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/register", {
        name: name.trim(),
        phone: phone.trim(),
        password,
      });
      // Auto-login after register
      const loginRes = await apiRequest("POST", "/api/auth/login", {
        phone: phone.trim(),
        password,
      });
      const data = await loginRes.json();
      setAuth(data.user, data.token);
      router.replace("/(tabs)");
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("409")) {
        setError("Nomor HP sudah terdaftar, silakan login");
      } else if (msg.includes("400")) {
        setError("Data tidak lengkap, periksa kembali");
      } else {
        setError("Gagal daftar, coba lagi");
      }
    } finally {
      setLoading(false);
    }
  }, [name, phone, password, confirmPassword, setAuth]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: topPad + 24, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <Ionicons name="leaf" size={32} color="#fff" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Daftar</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Buat akun untuk belanja lebih mudah
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.fieldWrapper}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Nama Lengkap</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Contoh: Budi Santoso"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
                autoComplete="name"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.fieldWrapper}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Nomor HP</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="call-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="08xx-xxxx-xxxx"
                placeholderTextColor={colors.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldWrapper}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Minimal 6 karakter"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                returnKeyType="next"
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textTertiary} />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldWrapper}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Konfirmasi Password</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Ulangi password"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <Pressable onPress={() => setShowConfirm((v) => !v)} hitSlop={8} style={styles.eyeBtn}>
                <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textTertiary} />
              </Pressable>
            </View>
          </View>

          {/* Error */}
          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Register button */}
          <Pressable
            style={[styles.ctaBtn, { backgroundColor: colors.cta }, loading && styles.ctaBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.ctaBtnText}>Daftar Sekarang</Text>
            )}
          </Pressable>

          {/* Login link */}
          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>Sudah punya akun? </Text>
            <Pressable onPress={() => router.replace("/(auth)/login")}>
              <Text style={[styles.switchLink, { color: colors.primary }]}>Masuk</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { paddingHorizontal: 24 },
  backBtn: { marginBottom: 8 },
  header: { alignItems: "center", marginBottom: 32, marginTop: 12 },
  logoBox: {
    width: 64, height: 64, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular" },
  form: { gap: 16 },
  fieldWrapper: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Inter_500Medium" },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", height: "100%" as any },
  eyeBtn: { padding: 4 },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#FEF2F2", borderRadius: 8, padding: 10,
  },
  errorText: { color: "#EF4444", fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  ctaBtn: {
    height: 54, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    marginTop: 8,
  },
  ctaBtnDisabled: { opacity: 0.7 },
  ctaBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  switchRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  switchText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  switchLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
