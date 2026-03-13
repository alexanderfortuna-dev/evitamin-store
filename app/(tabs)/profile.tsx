import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  useColorScheme,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getColors } from "@/constants/colors";
import { useStore } from "@/lib/store";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();
  const { authUser, logout } = useStore();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // === NOT LOGGED IN ===
  if (!authUser) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Akun Saya</Text>
        </View>

        <ScrollView contentContainerStyle={[styles.guestContent, { paddingBottom: bottomPad + 80 }]}>
          {/* Illustration */}
          <View style={[styles.guestIconBox, { backgroundColor: colors.borderLight }]}>
            <Ionicons name="person-circle-outline" size={80} color={colors.textTertiary} />
          </View>
          <Text style={[styles.guestTitle, { color: colors.text }]}>Belum masuk</Text>
          <Text style={[styles.guestSub, { color: colors.textSecondary }]}>
            Login untuk menikmati pengalaman belanja yang lebih personal
          </Text>

          {/* Login button */}
          <Pressable
            style={[styles.loginBtn, { backgroundColor: colors.cta }]}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.loginBtnText}>Masuk</Text>
          </Pressable>

          {/* Register button */}
          <Pressable
            style={[styles.registerBtn, { borderColor: colors.primary }]}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={[styles.registerBtnText, { color: colors.primary }]}>Daftar Akun Baru</Text>
          </Pressable>

          {/* Benefits */}
          <View style={[styles.benefitsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.benefitsTitle, { color: colors.text }]}>Keuntungan punya akun:</Text>
            {[
              { icon: "bag-check-outline", text: "Riwayat pesanan tersimpan" },
              { icon: "heart-outline", text: "Wishlist produk favorit" },
              { icon: "flash-outline", text: "Checkout lebih cepat" },
            ].map((b) => (
              <View key={b.icon} style={styles.benefitRow}>
                <Ionicons name={b.icon as any} size={18} color={colors.success} />
                <Text style={[styles.benefitText, { color: colors.textSecondary }]}>{b.text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // === LOGGED IN ===
  const isAdmin = authUser.role === "admin" || authUser.role === "owner";
  const initials = authUser.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Akun Saya</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 80 }}>
        {/* User card */}
        <View style={[styles.userCard, { backgroundColor: colors.primary }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{authUser.name}</Text>
            <Text style={styles.userPhone}>{authUser.phone}</Text>
            {isAdmin && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#fff" />
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.menuList}>
          {/* Order history */}
          <Pressable style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="receipt-outline" size={22} color={colors.primary} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>Riwayat Pesanan</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>

          {/* Wishlist */}
          <Pressable
            style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/(tabs)/wishlist")}
          >
            <Ionicons name="heart-outline" size={22} color={colors.cta} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>Wishlist</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>

          {/* Admin (only for admin/owner) */}
          {isAdmin && (
            <Pressable style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="settings-outline" size={22} color={colors.success} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>Admin Dashboard</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </Pressable>
          )}

          {/* Logout */}
          <Pressable
            style={[styles.menuItem, styles.menuItemLogout, { backgroundColor: colors.card, borderColor: "#FEE2E2" }]}
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={[styles.menuLabel, { color: "#EF4444" }]}>Keluar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },

  // Guest
  guestContent: { alignItems: "center", paddingHorizontal: 32, paddingTop: 32 },
  guestIconBox: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  guestTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 8 },
  guestSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 28, lineHeight: 20 },
  loginBtn: { width: "100%", height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  loginBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  registerBtn: { width: "100%", height: 52, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginBottom: 28 },
  registerBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  benefitsCard: { width: "100%", borderRadius: 14, padding: 16, gap: 12 },
  benefitsTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  benefitText: { fontSize: 13, fontFamily: "Inter_400Regular" },

  // Logged in
  userCard: { margin: 16, borderRadius: 16, padding: 20, flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold" },
  userInfo: { flex: 1 },
  userName: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  userPhone: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  adminBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6, backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  adminBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  menuList: { paddingHorizontal: 16, gap: 10 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 14, borderWidth: 1 },
  menuItemLogout: {},
  menuLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
});
