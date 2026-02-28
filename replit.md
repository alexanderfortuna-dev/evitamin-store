# eVitamin Store

## Overview
Mobile-first supplements e-commerce app built with Expo (React Native) + Express backend. Indonesia-focused supplement marketplace with bilingual support (Bahasa Indonesia / English).

## Architecture
- **Frontend**: Expo Router (file-based routing), React Native, TypeScript
- **Backend**: Express.js on port 5000 (landing page + API)
- **Frontend Dev Server**: Expo on port 8081
- **State Management**: React Context (StoreProvider) + AsyncStorage for persistence
- **Data**: 100 mock product SKUs generated procedurally across 10 supplement categories

## Key Files
- `lib/store.tsx` — Global state: cart, wishlist, language (persisted via AsyncStorage)
- `lib/products.ts` — 100 seeded product SKUs with deterministic generation
- `lib/i18n.ts` — Bilingual translations (ID/EN)
- `lib/query-client.ts` — React Query client + API helpers
- `constants/colors.ts` — Theme colors (light/dark) with eVitamin brand palette
- `components/ProductCard.tsx` — Reusable product card component
- `components/CategoryPill.tsx` — Category filter pill
- `components/CartBadge.tsx` — Cart badge overlay

## Screens
- `app/(tabs)/index.tsx` — Home: banner, categories, featured, product grid
- `app/(tabs)/search.tsx` — Product search with popular suggestions
- `app/(tabs)/wishlist.tsx` — Saved favorite products
- `app/(tabs)/cart.tsx` — Shopping cart with quantity controls
- `app/product/[sku].tsx` — Product detail with accordion sections
- `app/category/[name].tsx` — Category browse
- `app/checkout.tsx` — One-page checkout (address, courier, payment)

## Color Palette
- Background: #F7FAFF
- Primary Trust: #0B3D91
- CTA Buy Button: #FF6A00
- Success: #16A34A
- Text: #1F2937
- Card: #FFFFFF

## Features
- 100 mock supplement SKUs across 10 categories
- Cart with quantity management (persisted)
- Wishlist with heart toggle (persisted)
- Bilingual ID/EN toggle
- Dark mode support
- One-page checkout with courier selection (JNE, J&T, SiCepat, GoSend, GrabExpress)
- Payment method selection (VA, QRIS, E-Wallet, Card)
- Free shipping over Rp 500,000
- BPOM badge, Halal status, product ratings
- Liquid glass tab bar (iOS 26+), blur tab bar (older iOS), solid (Android/Web)

## Dependencies
- @expo-google-fonts/inter (typography)
- expo-image (optimized images)
- expo-haptics (tactile feedback)
- expo-linear-gradient (banner gradient)
- @react-native-async-storage/async-storage (persistence)
