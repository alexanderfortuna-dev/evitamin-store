import React, { useMemo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  useColorScheme,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { getColors } from "@/constants/colors";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { allProducts } from "@/lib/products";
import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export default function WishlistScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const { language, wishlist, addToCart, toggleWishlist, isInWishlist } = useStore();

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const wishlistProducts = useMemo(
    () => allProducts.filter((p) => wishlist.includes(p.sku)),
    [wishlist]
  );

  const productPairs = useMemo(() => {
    const pairs: Product[][] = [];
    for (let i = 0; i < wishlistProducts.length; i += 2) {
      pairs.push(wishlistProducts.slice(i, i + 2));
    }
    return pairs;
  }, [wishlistProducts]);

  const handleProductPress = useCallback((sku: string) => {
    router.push({ pathname: "/product/[sku]", params: { sku } });
  }, []);

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart(product);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [addToCart]
  );

  const renderProductPair = useCallback(
    ({ item }: { item: Product[] }) => (
      <View style={styles.productRow}>
        {item.map((product) => (
          <ProductCard
            key={product.sku}
            product={product}
            onPress={() => handleProductPress(product.sku)}
            onAddToCart={() => handleAddToCart(product)}
            onToggleWishlist={() => toggleWishlist(product.sku)}
            isWishlisted={isInWishlist(product.sku)}
          />
        ))}
        {item.length === 1 && <View style={{ flex: 1, margin: 4 }} />}
      </View>
    ),
    [handleProductPress, handleAddToCart, toggleWishlist, isInWishlist]
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: Platform.OS === "web" ? webTopInset : 0 }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t("wishlist.title", language)}
      </Text>

      {wishlistProducts.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={56} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {t("wishlist.empty", language)}
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
            {t("wishlist.emptyDesc", language)}
          </Text>
        </View>
      ) : (
        <FlatList
          data={productPairs}
          renderItem={renderProductPair}
          keyExtractor={(_, index) => `pair-${index}`}
          contentContainerStyle={[styles.listContent, { paddingBottom: Platform.OS === "web" ? 34 + 84 : 100 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={productPairs.length > 0}
        />
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
    paddingHorizontal: 12,
  },
  productRow: {
    flexDirection: "row",
    marginBottom: 4,
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
