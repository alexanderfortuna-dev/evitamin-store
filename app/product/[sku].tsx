import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { getColors } from "@/constants/colors";
import { useStore } from "@/lib/store";
import { t, formatPrice } from "@/lib/i18n";
import { getProductsBySku } from "@/lib/products";

type SectionKey = "description" | "nutrition" | "ingredients" | "usage" | "warnings";

export default function ProductDetailScreen() {
  const { sku } = useLocalSearchParams<{ sku: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();
  const { language, addToCart, toggleWishlist, isInWishlist } = useStore();
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>("description");
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(() => getProductsBySku(sku || ""), [sku]);

  if (!product) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.notFoundText, { color: colors.text }]}>Product not found</Text>
        </View>
      </View>
    );
  }

  const wishlisted = isInWishlist(product.sku);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/checkout");
  };

  const sections: { key: SectionKey; titleKey: string; content: string }[] = [
    { key: "description", titleKey: "product.description", content: product.description },
    { key: "nutrition", titleKey: "product.nutrition", content: product.nutritionFacts },
    { key: "ingredients", titleKey: "product.ingredients", content: product.ingredients },
    { key: "usage", titleKey: "product.usage", content: product.usageInstructions },
    { key: "warnings", titleKey: "product.warnings", content: product.warnings },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top }]}>
        <Pressable onPress={() => router.back()} style={[styles.headerBtn, { backgroundColor: colors.card }]}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={() => {
            toggleWishlist(product.sku);
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={[styles.headerBtn, { backgroundColor: colors.card }]}
        >
          <Ionicons
            name={wishlisted ? "heart" : "heart-outline"}
            size={22}
            color={wishlisted ? "#EF4444" : colors.text}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 120 : 120 }}
      >
        <Image
          source={{ uri: product.imagePaths[0] }}
          style={styles.productImage}
          contentFit="cover"
          transition={300}
        />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={[styles.brand, { color: colors.primary }]}>{product.brand}</Text>
            <View style={styles.ratingChip}>
              <Ionicons name="star" size={14} color={colors.star} />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {product.rating} ({product.reviewCount})
              </Text>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{product.title}</Text>

          <Text style={[styles.price, { color: colors.cta }]}>
            {formatPrice(product.priceIdr)}
          </Text>
          <Text style={[styles.priceUsd, { color: colors.textTertiary }]}>
            ${product.priceUsd.toFixed(2)} USD
          </Text>

          <View style={styles.badges}>
            {product.inStock && (
              <View style={[styles.badge, { backgroundColor: colors.success + "15", borderColor: colors.success }]}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={[styles.badgeText, { color: colors.success }]}>
                  {t("product.inStock", language)}
                </Text>
              </View>
            )}
            {product.bpomNo && (
              <View style={[styles.badge, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
                <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {product.bpomNo}
                </Text>
              </View>
            )}
            {product.isHalal && (
              <View style={[styles.badge, { backgroundColor: colors.success + "15", borderColor: colors.success }]}>
                <Text style={[styles.badgeText, { color: colors.success }]}>
                  {t("product.halal", language)}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.infoRow, { borderColor: colors.borderLight }]}>
            <View style={styles.infoItem}>
              <Ionicons name="scale-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t("product.weight", language)}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {product.weightG >= 1000 ? `${(product.weightG / 1000).toFixed(1)} kg` : `${product.weightG} g`}
              </Text>
            </View>
            <View style={[styles.infoSep, { backgroundColor: colors.border }]} />
            <View style={styles.infoItem}>
              <Ionicons name="globe-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t("product.origin", language)}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{product.origin}</Text>
            </View>
            <View style={[styles.infoSep, { backgroundColor: colors.border }]} />
            <View style={styles.infoItem}>
              <Ionicons name="pricetag-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>SKU</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{product.sku}</Text>
            </View>
          </View>

          {sections.map((section) => (
            <View key={section.key} style={[styles.accordionItem, { borderColor: colors.borderLight }]}>
              <Pressable
                onPress={() =>
                  setExpandedSection(expandedSection === section.key ? null : section.key)
                }
                style={styles.accordionHeader}
              >
                <Text style={[styles.accordionTitle, { color: colors.text }]}>
                  {t(section.titleKey, language)}
                </Text>
                <Ionicons
                  name={expandedSection === section.key ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
              {expandedSection === section.key && (
                <Text style={[styles.accordionContent, { color: colors.textSecondary }]}>
                  {section.content}
                </Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.stickyBar,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            paddingBottom: Platform.OS === "web" ? 34 : Math.max(insets.bottom, 16),
          },
        ]}
      >
        <View style={styles.qtyControl}>
          <Pressable
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={[styles.qtyBtn, { borderColor: colors.border }]}
          >
            <Ionicons name="remove" size={18} color={colors.text} />
          </Pressable>
          <Text style={[styles.qtyText, { color: colors.text }]}>{quantity}</Text>
          <Pressable
            onPress={() => setQuantity(quantity + 1)}
            style={[styles.qtyBtn, { borderColor: colors.border }]}
          >
            <Ionicons name="add" size={18} color={colors.text} />
          </Pressable>
        </View>
        <Pressable
          onPress={handleAddToCart}
          style={({ pressed }) => [
            styles.addCartBtn,
            {
              borderColor: colors.cta,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          disabled={!product.inStock}
        >
          <Ionicons name="cart-outline" size={20} color={colors.cta} />
        </Pressable>
        <Pressable
          onPress={handleBuyNow}
          style={({ pressed }) => [
            styles.buyNowBtn,
            {
              backgroundColor: product.inStock ? colors.cta : colors.textTertiary,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          disabled={!product.inStock}
        >
          <Text style={styles.buyNowText}>{t("product.buyNow", language)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerBtn: {
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
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: {
    width: "100%",
    height: 360,
    backgroundColor: "#F3F4F6",
  },
  content: {
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  brand: {
    fontSize: 13,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    lineHeight: 28,
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: "800" as const,
  },
  priceUsd: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 12,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  infoRow: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  infoSep: {
    width: 1,
    marginHorizontal: 8,
  },
  infoLabel: {
    fontSize: 10,
    textTransform: "uppercase" as const,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  accordionItem: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  accordionContent: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  stickyBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "600" as const,
    minWidth: 24,
    textAlign: "center",
  },
  addCartBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  buyNowBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buyNowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
});
