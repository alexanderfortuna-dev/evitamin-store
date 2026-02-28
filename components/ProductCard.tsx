import React from "react";
import { StyleSheet, Text, View, Pressable, useColorScheme, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { getColors } from "@/constants/colors";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/i18n";

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  isWishlisted?: boolean;
  compact?: boolean;
}

export function ProductCard({
  product,
  onPress,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  compact,
}: ProductCardProps) {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === "dark");

  const handleAddToCart = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddToCart?.();
  };

  const handleWishlist = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleWishlist?.();
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderLight,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        compact && styles.containerCompact,
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.imagePaths[0] }}
          style={[styles.image, compact && styles.imageCompact]}
          contentFit="cover"
          transition={200}
        />
        {onToggleWishlist && (
          <Pressable
            onPress={handleWishlist}
            style={[styles.wishlistBtn, { backgroundColor: colors.card }]}
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={18}
              color={isWishlisted ? "#EF4444" : colors.textSecondary}
            />
          </Pressable>
        )}
        {product.bpomNo && (
          <View style={[styles.bpomBadge, { backgroundColor: colors.success }]}>
            <Text style={styles.bpomText}>BPOM</Text>
          </View>
        )}
      </View>
      <View style={[styles.info, compact && styles.infoCompact]}>
        <Text
          style={[styles.brand, { color: colors.primary }]}
          numberOfLines={1}
        >
          {product.brand}
        </Text>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {product.title}
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={colors.star} />
          <Text style={[styles.rating, { color: colors.textSecondary }]}>
            {product.rating} ({product.reviewCount})
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.cta }]}>
            {formatPrice(product.priceIdr)}
          </Text>
          {onAddToCart && product.inStock && (
            <Pressable
              onPress={handleAddToCart}
              style={[styles.addBtn, { backgroundColor: colors.cta }]}
            >
              <Ionicons name="add" size={18} color="#fff" />
            </Pressable>
          )}
        </View>
        {!product.inStock && (
          <Text style={[styles.outOfStock, { color: colors.badge }]}>
            Habis
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    flex: 1,
    margin: 4,
  },
  containerCompact: {
    width: 160,
    flex: 0,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F3F4F6",
  },
  imageCompact: {
    height: 140,
  },
  wishlistBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bpomBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bpomText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
  info: {
    padding: 10,
    gap: 3,
  },
  infoCompact: {
    padding: 8,
  },
  brand: {
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontWeight: "500" as const,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  rating: {
    fontSize: 11,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  outOfStock: {
    fontSize: 11,
    fontWeight: "600" as const,
    marginTop: 2,
  },
});
