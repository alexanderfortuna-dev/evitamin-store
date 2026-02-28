import React, { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Pressable,
  useColorScheme,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { getColors } from "@/constants/colors";
import { useStore } from "@/lib/store";
import { t, formatPrice } from "@/lib/i18n";
import { searchProducts, allProducts } from "@/lib/products";
import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Image } from "expo-image";

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();
  const { language, addToCart, toggleWishlist, isInWishlist } = useStore();
  const [query, setQuery] = useState("");

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchProducts(query);
  }, [query]);

  const productPairs = useMemo(() => {
    const pairs: Product[][] = [];
    for (let i = 0; i < results.length; i += 2) {
      pairs.push(results.slice(i, i + 2));
    }
    return pairs;
  }, [results]);

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

  const popularProducts = useMemo(() => allProducts.sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 6), []);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: Platform.OS === "web" ? webTopInset : 0 }]}>
      <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t("search.placeholder", language)}
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
          </Pressable>
        )}
      </View>

      {query.trim() === "" ? (
        <View style={styles.emptySearch}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {t("home.popular", language)}
          </Text>
          {popularProducts.map((product) => (
            <Pressable
              key={product.sku}
              onPress={() => handleProductPress(product.sku)}
              style={({ pressed }) => [
                styles.popularItem,
                { backgroundColor: pressed ? colors.borderLight : "transparent" },
              ]}
            >
              <Image
                source={{ uri: product.imagePaths[0] }}
                style={styles.popularImage}
                contentFit="cover"
              />
              <View style={styles.popularInfo}>
                <Text style={[styles.popularBrand, { color: colors.primary }]}>{product.brand}</Text>
                <Text style={[styles.popularName, { color: colors.text }]} numberOfLines={1}>{product.title}</Text>
                <Text style={[styles.popularPrice, { color: colors.cta }]}>{formatPrice(product.priceIdr)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>
      ) : results.length === 0 ? (
        <View style={styles.noResults}>
          <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
            {t("search.noResults", language)}
          </Text>
        </View>
      ) : (
        <>
          <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
            {results.length} {t("search.results", language).toLowerCase()}
          </Text>
          <FlatList
            data={productPairs}
            renderItem={renderProductPair}
            keyExtractor={(_, index) => `pair-${index}`}
            contentContainerStyle={[styles.listContent, { paddingBottom: Platform.OS === "web" ? 34 + 84 : 100 }]}
            showsVerticalScrollIndicator={false}
            scrollEnabled={productPairs.length > 0}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  emptySearch: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 12,
  },
  popularItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 12,
  },
  popularImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  popularInfo: {
    flex: 1,
    gap: 1,
  },
  popularBrand: {
    fontSize: 10,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
  },
  popularName: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  popularPrice: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  resultsCount: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  productRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  noResults: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  noResultsText: {
    fontSize: 15,
  },
});
