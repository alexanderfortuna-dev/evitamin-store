import React, { useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  useColorScheme,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { getColors } from "@/constants/colors";
import { useStore, CartItem } from "@/lib/store";
import { t, formatPrice } from "@/lib/i18n";

export default function CartScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const { language, cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useStore();

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const shippingEstimate = cartTotal > 500000 ? 0 : 25000;

  const handleCheckout = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/checkout");
  };

  const renderCartItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <View style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <Pressable onPress={() => router.push({ pathname: "/product/[sku]", params: { sku: item.product.sku } })}>
          <Image
            source={{ uri: item.product.imagePaths[0] }}
            style={styles.cartImage}
            contentFit="cover"
          />
        </Pressable>
        <View style={styles.cartInfo}>
          <Text style={[styles.cartBrand, { color: colors.primary }]} numberOfLines={1}>
            {item.product.brand}
          </Text>
          <Text style={[styles.cartTitle, { color: colors.text }]} numberOfLines={2}>
            {item.product.title}
          </Text>
          <Text style={[styles.cartPrice, { color: colors.cta }]}>
            {formatPrice(item.product.priceIdr)}
          </Text>
          <View style={styles.qtyRow}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateQuantity(item.product.sku, item.quantity - 1);
              }}
              style={[styles.qtyBtn, { borderColor: colors.border }]}
            >
              <Ionicons name="remove" size={16} color={colors.text} />
            </Pressable>
            <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateQuantity(item.product.sku, item.quantity + 1);
              }}
              style={[styles.qtyBtn, { borderColor: colors.border }]}
            >
              <Ionicons name="add" size={16} color={colors.text} />
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                removeFromCart(item.product.sku);
              }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.badge} />
            </Pressable>
          </View>
        </View>
      </View>
    ),
    [colors, updateQuantity, removeFromCart]
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: Platform.OS === "web" ? webTopInset : 0 }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t("cart.title", language)}
      </Text>

      {cart.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={56} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {t("cart.empty", language)}
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
            {t("cart.emptyDesc", language)}
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.product.sku}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={cart.length > 0}
          />

          <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                {t("cart.subtotal", language)} ({cartCount} {t("cart.items", language)})
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatPrice(cartTotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                {t("cart.shipping", language)}
              </Text>
              <Text style={[styles.summaryValue, { color: shippingEstimate === 0 ? colors.success : colors.text }]}>
                {shippingEstimate === 0 ? "GRATIS" : formatPrice(shippingEstimate)}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                {t("cart.total", language)}
              </Text>
              <Text style={[styles.totalValue, { color: colors.cta }]}>
                {formatPrice(cartTotal + shippingEstimate)}
              </Text>
            </View>
            <Pressable
              onPress={handleCheckout}
              style={({ pressed }) => [
                styles.checkoutBtn,
                {
                  backgroundColor: colors.cta,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <Ionicons name="lock-closed" size={18} color="#fff" />
              <Text style={styles.checkoutText}>{t("cart.checkout", language)}</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800" as const,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  cartItem: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  cartImage: {
    width: 100,
    height: 120,
    backgroundColor: "#F3F4F6",
  },
  cartInfo: {
    flex: 1,
    padding: 12,
    gap: 2,
  },
  cartBrand: {
    fontSize: 10,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
  },
  cartTitle: {
    fontSize: 13,
    fontWeight: "500" as const,
    lineHeight: 18,
  },
  cartPrice: {
    fontSize: 15,
    fontWeight: "700" as const,
    marginTop: 2,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 15,
    fontWeight: "600" as const,
    minWidth: 20,
    textAlign: "center",
  },
  summary: {
    borderTopWidth: 1,
    padding: 16,
    paddingBottom: Platform.OS === "web" ? 34 + 16 : 16,
    gap: 8,
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
  divider: {
    height: 1,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800" as const,
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 4,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  emptyDesc: {
    fontSize: 14,
  },
});
