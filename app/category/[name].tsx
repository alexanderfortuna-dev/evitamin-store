import React, { useMemo, useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  useColorScheme,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { getColors } from "@/constants/colors";
import { useStore } from "@/lib/store";
import { getProductsByCategory } from "@/lib/products";
import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export default function CategoryScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const insets = useSafeAreaInsets();
  const { addToCart, toggleWishlist, isInWishlist } = useStore();

  const [visibleCount, setVisibleCount] = useState(20);
  const allCategoryProducts = useMemo(() => getProductsByCategory(name || ""), [name]);
  const products = useMemo(() => allCategoryProducts.slice(0, visibleCount), [allCategoryProducts, visibleCount]);

  const productPairs = useMemo(() => {
    const pairs: Product[][] = [];
    for (let i = 0; i < products.length; i += 2) {
      pairs.push(products.slice(i, i + 2));
    }
    return pairs;
  }, [products]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 20);
  }, []);

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
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card }]}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={[styles.countText, { color: colors.textSecondary }]}>
        {allCategoryProducts.length} products
      </Text>

      <FlatList
        data={productPairs}
        renderItem={renderProductPair}
        keyExtractor={(_, index) => `pair-${index}`}
        contentContainerStyle={[styles.listContent, { paddingBottom: Platform.OS === "web" ? 34 + 32 : 32 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No products in this category
            </Text>
          </View>
        }
      />
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
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
  },
  countText: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
});
