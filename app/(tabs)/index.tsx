import React, { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { getColors } from "@/constants/colors";
import { useStore } from "@/lib/store";
import { t, formatPrice } from "@/lib/i18n";
import { allProducts, getCategories } from "@/lib/products";
import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { CategoryPill } from "@/components/CategoryPill";

const categoryIcons: Record<string, string> = {
  Protein: "barbell-outline",
  "Pre-workout": "flash-outline",
  Creatine: "fitness-outline",
  "BCAA & Aminos": "water-outline",
  Multivitamin: "medkit-outline",
  "Omega & Fish Oil": "fish-outline",
  "Weight Gainers": "trending-up-outline",
  "Joint & Collagen": "body-outline",
  "Vitamin D & K": "sunny-outline",
  "Probiotics & Gut": "leaf-outline",
  "Fat Burners": "flame-outline",
  "Testosterone Support": "shield-outline",
  Minerals: "diamond-outline",
  "Gym Equipment": "barbell-outline",
  "Food & Snacks": "fast-food-outline",
  "Mom & Baby": "heart-outline",
  "Beauty & Hair": "sparkles-outline",
  "Home & Living": "home-outline",
  Accessories: "bag-outline",
  Pets: "paw-outline",
  "Other Supplements": "cube-outline",
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getColors(isDark);
  const insets = useSafeAreaInsets();
  const { language, addToCart, toggleWishlist, isInWishlist, setLanguage } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const [visibleCount, setVisibleCount] = useState(20);
  const featuredProducts = useMemo(() => allProducts.filter((p) => p.rating >= 4.5).slice(0, 6), []);
  const filteredProducts = useMemo(() => {
    const source = selectedCategory === "All" ? allProducts : allProducts.filter((p) => p.category === selectedCategory);
    return source.slice(0, visibleCount);
  }, [selectedCategory, visibleCount]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleCategoryChange = useCallback((cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(20);
  }, []);

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

  const productPairs = useMemo(() => {
    const pairs: Product[][] = [];
    for (let i = 0; i < filteredProducts.length; i += 2) {
      pairs.push(filteredProducts.slice(i, i + 2));
    }
    return pairs;
  }, [filteredProducts]);

  const renderFeaturedItem = useCallback(
    ({ item }: { item: Product }) => (
      <Pressable
        onPress={() => handleProductPress(item.sku)}
        style={({ pressed }) => [
          styles.featuredCard,
          { backgroundColor: colors.card, borderColor: colors.borderLight, transform: [{ scale: pressed ? 0.96 : 1 }] },
        ]}
      >
        <Image
          source={{ uri: item.imagePaths[0] }}
          style={styles.featuredImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.featuredInfo}>
          <Text style={[styles.featuredBrand, { color: colors.primary }]} numberOfLines={1}>
            {item.brand}
          </Text>
          <Text style={[styles.featuredTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.featuredPrice, { color: colors.cta }]}>
            {formatPrice(item.priceIdr)}
          </Text>
        </View>
      </Pressable>
    ),
    [colors, handleProductPress]
  );

  const categories = getCategories();

  const ListHeader = (
    <>
      <LinearGradient
        colors={isDark ? ["#0B3D91", "#1E293B"] : ["#0B3D91", "#1E40AF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.bannerContent}>
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>{t("home.banner.title", language)}</Text>
            <Text style={styles.bannerSubtitle}>{t("home.banner.subtitle", language)}</Text>
          </View>
          <Pressable
            onPress={() => setLanguage(language === "id" ? "en" : "id")}
            style={styles.langBtn}
          >
            <Ionicons name="globe-outline" size={16} color="#fff" />
            <Text style={styles.langText}>{t("language.switch", language)}</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("home.categories", language)}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => {
                router.push({ pathname: "/category/[name]", params: { name: cat } });
              }}
              style={[styles.categoryItem, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
            >
              <View style={[styles.categoryIcon, { backgroundColor: isDark ? colors.primary + "20" : "#EBF5FF" }]}>
                <Ionicons
                  name={(categoryIcons[cat] || "cube-outline") as any}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={1}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("home.featured", language)}
        </Text>
        <FlatList
          data={featuredProducts}
          renderItem={renderFeaturedItem}
          keyExtractor={(item) => item.sku}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
          scrollEnabled={featuredProducts.length > 0}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("home.all", language)}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <CategoryPill
            label={t("filter.all", language)}
            isActive={selectedCategory === "All"}
            onPress={() => handleCategoryChange("All")}
          />
          {categories.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              isActive={selectedCategory === cat}
              onPress={() => handleCategoryChange(cat)}
            />
          ))}
        </ScrollView>
      </View>
    </>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: Platform.OS === "web" ? webTopInset : 0 }]}>
      <FlatList
        data={productPairs}
        renderItem={renderProductPair}
        keyExtractor={(_, index) => `pair-${index}`}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={[styles.listContent, { paddingBottom: Platform.OS === "web" ? 34 + 84 : 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        scrollEnabled={true}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  banner: {
    borderRadius: 20,
    marginTop: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  bannerContent: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800" as const,
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  langText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  section: {
    marginTop: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  categoriesScroll: {
    paddingHorizontal: 2,
    gap: 10,
  },
  categoryItem: {
    alignItems: "center",
    width: 80,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: "500" as const,
    textAlign: "center",
  },
  featuredList: {
    paddingHorizontal: 2,
  },
  featuredCard: {
    width: 180,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginRight: 12,
  },
  featuredImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#F3F4F6",
  },
  featuredInfo: {
    padding: 10,
    gap: 2,
  },
  featuredBrand: {
    fontSize: 10,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
  },
  featuredTitle: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: "700" as const,
    marginTop: 2,
  },
  filterScroll: {
    paddingHorizontal: 2,
    marginBottom: 8,
  },
  productRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
});
