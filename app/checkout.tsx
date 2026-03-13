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
  ActivityIndicator,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { getColors } from "@/constants/colors";
import { useStore } from "@/lib/store";
import { t, formatPrice } from "@/lib/i18n";
import { apiRequest } from "@/lib/query-client";

const couriers = [
  { id: "jne", name: "JNE REG", eta: "2-3 hari", cost: 25000 },
  { id: "jnt", name: "J&T Express", eta: "2-3 hari", cost: 22000 },
  { id: "sicepat", name: "SiCepat REG", eta: "1-2 hari", cost: 28000 },
  { id: "gosend", name: "GoSend Instant", eta: "1-2 jam", cost: 45000 },
  { id: "grab", name: "GrabExpress", eta: "1-2 jam", cost: 42000 },
];

export default function CheckoutScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();
  const { language, cart, cartTotal, clearCart } = useStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [selectedCourier, setSelectedCourier] = useState("jne");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");

  const courier = couriers.find((c) => c.id === selectedCourier);
  const shippingCost = courier?.cost || 25000;
  const freeShipping = cartTotal > 500000;
  const finalShipping = freeShipping ? 0 : shippingCost;
  const total = cartTotal + finalShipping;

  const handlePlaceOrder = useCallback(async () => {
    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      Alert.alert(
        language === "id" ? "Data Belum Lengkap" : "Incomplete Information",
        language === "id" ? "Mohon lengkapi semua data pengiriman" : "Please fill in all shipping details"
      );
      return;
    }

    if (cart.length === 0) {
      Alert.alert(
        language === "id" ? "Keranjang Kosong" : "Cart Empty",
        language === "id" ? "Tambahkan produk ke keranjang terlebih dahulu" : "Please add products to cart first"
      );
      return;
    }

    setIsProcessing(true);

    try {
      const items = cart.map((item) => ({
        id: item.product.sku,
        name: item.product.title.substring(0, 50),
        price: Math.round(item.product.priceIdr),
        quantity: item.quantity,
        imageUrl: item.product.imagePaths?.[0] || null,
      }));

      const response = await apiRequest("POST", "/api/midtrans/create-transaction", {
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        shippingAddress: address.trim(),
        shippingCity: city.trim(),
        shippingPostalCode: postal.trim(),
        items,
        shippingCost: finalShipping,
        courierName: courier?.name || "Standard",
      });

      const data = await response.json();

      if (data.redirectUrl) {
        setLastOrderId(data.orderId);
        if (Platform.OS === "web") {
          window.open(data.redirectUrl, "_blank");
        } else {
          await Linking.openURL(data.redirectUrl);
        }
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        clearCart();
        setOrderPlaced(true);
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      const errorMessage = error.message || "Unknown error";

      if (errorMessage.includes("MIDTRANS_SERVER_KEY")) {
        Alert.alert(
          language === "id" ? "Pembayaran Belum Dikonfigurasi" : "Payment Not Configured",
          language === "id"
            ? "Midtrans belum dikonfigurasi. Hubungi admin untuk setup API key."
            : "Midtrans is not configured yet. Please contact admin to set up API keys.",
        );
      } else {
        Alert.alert(
          language === "id" ? "Gagal Memproses" : "Processing Failed",
          language === "id"
            ? `Terjadi kesalahan saat memproses pembayaran: ${errorMessage}`
            : `An error occurred while processing payment: ${errorMessage}`,
        );
      }
    } finally {
      setIsProcessing(false);
    }
  }, [name, phone, email, address, city, postal, cart, language, clearCart, finalShipping, courier]);

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
            {language === "id"
              ? "Pesanan Anda sedang diproses. Silakan selesaikan pembayaran di halaman Midtrans yang terbuka."
              : "Your order is being processed. Please complete payment on the Midtrans page that opened."}
          </Text>
          {lastOrderId ? (
            <View style={[styles.orderIdBox, { backgroundColor: colors.inputBg, borderColor: colors.borderLight }]}>
              <Text style={[styles.orderIdLabel, { color: colors.textSecondary }]}>
                {language === "id" ? "ID Pesanan" : "Order ID"}
              </Text>
              <Text style={[styles.orderIdValue, { color: colors.text }]}>{lastOrderId}</Text>
            </View>
          ) : null}
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
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            placeholder="Email (optional)"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
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

          <View style={[styles.midtransInfo, { backgroundColor: colors.inputBg, borderColor: colors.borderLight }]}>
            <MaterialCommunityIcons name="shield-check" size={22} color={colors.success} />
            <View style={styles.midtransInfoText}>
              <Text style={[styles.midtransTitle, { color: colors.text }]}>
                {language === "id" ? "Pembayaran via Midtrans" : "Payment via Midtrans"}
              </Text>
              <Text style={[styles.midtransDesc, { color: colors.textSecondary }]}>
                {language === "id"
                  ? "VA Bank, QRIS, GoPay, OVO, DANA, ShopeePay, Kartu Kredit/Debit, Alfamart, Indomaret"
                  : "Bank VA, QRIS, GoPay, OVO, DANA, ShopeePay, Credit/Debit Card, Alfamart, Indomaret"}
              </Text>
            </View>
          </View>

          <View style={styles.paymentLogos}>
            {["BCA", "BNI", "BRI", "Mandiri", "QRIS", "GoPay", "OVO", "DANA"].map((label) => (
              <View key={label} style={[styles.paymentLogo, { backgroundColor: colors.inputBg, borderColor: colors.borderLight }]}>
                <Text style={[styles.paymentLogoText, { color: colors.textSecondary }]}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {language === "id" ? "Ringkasan" : "Summary"}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {language === "id" ? `Subtotal (${cart.length} produk)` : `Subtotal (${cart.length} items)`}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatPrice(cartTotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {language === "id" ? "Ongkos Kirim" : "Shipping"}
            </Text>
            <Text style={[styles.summaryValue, { color: freeShipping ? colors.success : colors.text }]}>
              {freeShipping
                ? language === "id" ? "GRATIS" : "FREE"
                : formatPrice(finalShipping)}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryTotalLabel, { color: colors.text }]}>
              {language === "id" ? "Total" : "Total"}
            </Text>
            <Text style={[styles.summaryTotalValue, { color: colors.cta }]}>
              {formatPrice(total)}
            </Text>
          </View>
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
            disabled={isProcessing}
            style={({ pressed }) => [
              styles.placeOrderBtn,
              {
                backgroundColor: isProcessing ? colors.textTertiary : colors.cta,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="lock-closed" size={18} color="#fff" />
                <Text style={styles.placeOrderText}>
                  {language === "id" ? "Bayar Sekarang" : "Pay Now"}
                </Text>
              </>
            )}
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
  midtransInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  midtransInfoText: {
    flex: 1,
    gap: 4,
  },
  midtransTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  midtransDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  paymentLogos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  paymentLogo: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  paymentLogoText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  summaryDivider: {
    height: 1,
    marginVertical: 4,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: "800" as const,
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
    minWidth: 160,
    justifyContent: "center",
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
  orderIdBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  orderIdLabel: {
    fontSize: 12,
  },
  orderIdValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
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
