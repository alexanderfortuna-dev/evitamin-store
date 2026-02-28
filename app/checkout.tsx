import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  useColorScheme,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { getColors } from "@/constants/colors";
import { useStore } from "@/lib/store";
import { t, formatPrice } from "@/lib/i18n";

const couriers = [
  { id: "jne", name: "JNE REG", eta: "2-3 hari", cost: 25000 },
  { id: "jnt", name: "J&T Express", eta: "2-3 hari", cost: 22000 },
  { id: "sicepat", name: "SiCepat REG", eta: "1-2 hari", cost: 28000 },
  { id: "gosend", name: "GoSend Instant", eta: "1-2 jam", cost: 45000 },
  { id: "grab", name: "GrabExpress", eta: "1-2 jam", cost: 42000 },
];

const paymentMethods = [
  { id: "va", name: "Virtual Account", icon: "bank" as const },
  { id: "qris", name: "QRIS", icon: "qrcode-scan" as const },
  { id: "ewallet", name: "E-Wallet (GoPay/OVO/DANA)", icon: "wallet" as const },
  { id: "card", name: "Credit/Debit Card", icon: "credit-card" as const },
];

export default function CheckoutScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();
  const { language, cart, cartTotal, cartCount, clearCart } = useStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [selectedCourier, setSelectedCourier] = useState("jne");
  const [selectedPayment, setSelectedPayment] = useState("va");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const courier = couriers.find((c) => c.id === selectedCourier);
  const shippingCost = courier?.cost || 25000;
  const freeShipping = cartTotal > 500000;
  const finalShipping = freeShipping ? 0 : shippingCost;
  const total = cartTotal + finalShipping;

  const handlePlaceOrder = useCallback(() => {
    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      Alert.alert(
        language === "id" ? "Data Belum Lengkap" : "Incomplete Information",
        language === "id" ? "Mohon lengkapi semua data pengiriman" : "Please fill in all shipping details"
      );
      return;
    }

    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    clearCart();
    setOrderPlaced(true);
  }, [name, phone, address, city, language, clearCart]);

  if (orderPlaced) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.success + "15" }]}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            {t("checkout.success", language)}
          </Text>
          <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
            {t("checkout.successDesc", language)}
          </Text>
          <Pressable
            onPress={() => {
              router.replace("/(tabs)");
            }}
            style={({ pressed }) => [
              styles.continueBtn,
              { backgroundColor: colors.cta, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={styles.continueBtnText}>
              {t("checkout.continueShopping", language)}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card }]}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("checkout.title", language)}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === "web" ? 34 + 120 : 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("checkout.address", language)}
            </Text>
          </View>

          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            placeholder={t("checkout.name", language)}
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            placeholder={t("checkout.phone", language)}
            placeholderTextColor={colors.textTertiary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            placeholder={t("checkout.street", language)}
            placeholderTextColor={colors.textTertiary}
            value={address}
            onChangeText={setAddress}
            multiline
          />
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder={t("checkout.city", language)}
              placeholderTextColor={colors.textTertiary}
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              style={[styles.input, styles.halfInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder={t("checkout.postal", language)}
              placeholderTextColor={colors.textTertiary}
              value={postal}
              onChangeText={setPostal}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("checkout.courier", language)}
            </Text>
          </View>

          {couriers.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setSelectedCourier(c.id)}
              style={[
                styles.optionCard,
                {
                  borderColor: selectedCourier === c.id ? colors.primary : colors.border,
                  backgroundColor: selectedCourier === c.id ? colors.primary + "08" : "transparent",
                },
              ]}
            >
              <View style={styles.optionInfo}>
                <Text style={[styles.optionName, { color: colors.text }]}>{c.name}</Text>
                <Text style={[styles.optionEta, { color: colors.textSecondary }]}>{c.eta}</Text>
              </View>
              <Text
                style={[
                  styles.optionPrice,
                  { color: freeShipping ? colors.success : colors.text },
                ]}
              >
                {freeShipping ? "GRATIS" : formatPrice(c.cost)}
              </Text>
              <Ionicons
                name={selectedCourier === c.id ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={selectedCourier === c.id ? colors.primary : colors.textTertiary}
              />
            </Pressable>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("checkout.payment", language)}
            </Text>
          </View>

          {paymentMethods.map((pm) => (
            <Pressable
              key={pm.id}
              onPress={() => setSelectedPayment(pm.id)}
              style={[
                styles.optionCard,
                {
                  borderColor: selectedPayment === pm.id ? colors.primary : colors.border,
                  backgroundColor: selectedPayment === pm.id ? colors.primary + "08" : "transparent",
                },
              ]}
            >
              <MaterialCommunityIcons name={pm.icon} size={22} color={colors.primary} />
              <Text style={[styles.optionName, { color: colors.text, flex: 1, marginLeft: 10 }]}>
                {pm.name}
              </Text>
              <Ionicons
                name={selectedPayment === pm.id ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={selectedPayment === pm.id ? colors.primary : colors.textTertiary}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            paddingBottom: Platform.OS === "web" ? 34 : Math.max(insets.bottom, 16),
          },
        ]}
      >
        <View style={styles.totalRow}>
          <View>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
              {t("cart.total", language)}
            </Text>
            <Text style={[styles.totalValue, { color: colors.cta }]}>
              {formatPrice(total)}
            </Text>
          </View>
          <Pressable
            onPress={handlePlaceOrder}
            style={({ pressed }) => [
              styles.placeOrderBtn,
              {
                backgroundColor: colors.cta,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Ionicons name="lock-closed" size={18} color="#fff" />
            <Text style={styles.placeOrderText}>
              {t("checkout.placeOrder", language)}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  optionInfo: {
    flex: 1,
  },
  optionName: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  optionEta: {
    fontSize: 12,
    marginTop: 1,
  },
  optionPrice: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  bottomBar: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 12,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800" as const,
  },
  placeOrderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
  },
  successDesc: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  continueBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 12,
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
