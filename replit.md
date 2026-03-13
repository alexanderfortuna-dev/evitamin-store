# eVitamin Store

## Overview
Mobile-first supplements e-commerce app built with Expo (React Native) + Express backend. Indonesia-focused supplement marketplace with bilingual support (Bahasa Indonesia / English).

## Architecture
- **Frontend**: Expo Router (file-based routing), React Native, TypeScript
- **Backend**: Express.js on port 5000 (landing page + API)
- **Frontend Dev Server**: Expo on port 8081
- **State Management**: React Context (StoreProvider) + AsyncStorage for persistence
- **Data**: 2,406 real products from user's Shopee marketplace Excel database across 21 categories with 683 variants

## Key Files
- `lib/store.tsx` — Global state: cart, wishlist, language (persisted via AsyncStorage)
- `lib/products.ts` — 2,406 products imported from Excel database (Shopee marketplace data with CDN images)
- `lib/i18n.ts` — Bilingual translations (ID/EN)
- `lib/query-client.ts` — React Query client + API helpers
- `constants/colors.ts` — Theme colors (light/dark) with eVitamin brand palette
- `components/ProductCard.tsx` — Reusable product card component
- `components/CategoryPill.tsx` — Category filter pill
- `components/CartBadge.tsx` — Cart badge overlay

## Screens
- `app/(tabs)/index.tsx` — Home: banner, categories, featured, product grid with infinite scroll
- `app/(tabs)/search.tsx` — Product search with popular suggestions (limited to 50 results)
- `app/(tabs)/wishlist.tsx` — Saved favorite products
- `app/(tabs)/cart.tsx` — Shopping cart with quantity controls
- `app/product/[sku].tsx` — Product detail with details/variants accordion, sticky buy bar
- `app/category/[name].tsx` — Category browse with infinite scroll
- `app/checkout.tsx` — One-page checkout with Midtrans payment gateway integration
- `server/midtrans.ts` — Midtrans Snap API client (transaction creation, status check)
- `server/routes.ts` — Backend API routes (Midtrans config, create-transaction, status, notification webhook, order history)
- `server/db.ts` — PostgreSQL database connection via Drizzle ORM
- `shared/schema.ts` — Database schema: users, orders, order_items tables

## Data Source
- Excel file: `attached_assets/Database_Replit_AI_Clean_1772301588802.xlsx`
- 4 sheets: Products (2406 rows), Variants (683 rows), Categories (15), Brands (507)
- Product images from Shopee CDN: `https://cf.shopee.co.id/file/{id}`
- Categories mapped from Shopee categories to 21 app categories (Protein, Pre-workout, Creatine, BCAA & Aminos, Multivitamin, Omega & Fish Oil, Weight Gainers, Joint & Collagen, Vitamin D & K, Probiotics & Gut, Fat Burners, Testosterone Support, Minerals, Gym Equipment, Food & Snacks, Mom & Baby, Beauty & Hair, Home & Living, Accessories, Pets, Other Supplements)
- Prices generated algorithmically based on category and product size (no price data in Excel)
- Exchange rate: 1 USD = 16,780 IDR

## Color Palette
- Background: #F7FAFF
- Primary Trust: #0B3D91
- CTA Buy Button: #FF6A00
- Success: #16A34A
- Text: #1F2937
- Card: #FFFFFF

## Features
- 2,406 real Shopee marketplace products with Shopee CDN images
- 21 product categories with icon mapping
- Infinite scroll pagination (loads 20 products at a time)
- Cart with quantity management (persisted)
- Wishlist with heart toggle (persisted)
- Bilingual ID/EN toggle
- Dark mode support
- One-page checkout with courier selection (JNE, J&T, SiCepat, GoSend, GrabExpress)
- Midtrans payment gateway integration (production mode)
  - Supports: VA Bank (BCA, BNI, BRI, Mandiri, CIMB, Permata), QRIS, GoPay, ShopeePay, Credit/Debit Card, Alfamart, Indomaret
  - Backend creates Snap transaction, redirects user to Midtrans payment page
  - Webhook endpoint for payment notifications at POST /api/midtrans/notification
  - Environment variables: MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY, MIDTRANS_IS_PRODUCTION
- Free shipping over Rp 500,000
- Shopee badge, product category badges, product ratings
- Product variants display (flavor, color, size)
- Liquid glass tab bar (iOS 26+), blur tab bar (older iOS), solid (Android/Web)

## Dependencies
- @expo-google-fonts/inter (typography)
- expo-image (optimized images)
- expo-haptics (tactile feedback)
- expo-linear-gradient (banner gradient)
- @react-native-async-storage/async-storage (persistence)
- midtrans-client (Midtrans payment gateway SDK)
- drizzle-orm + pg (PostgreSQL ORM)

## Database (PostgreSQL)
- Provisioned via Replit built-in PostgreSQL
- Tables: `users`, `orders`, `order_items`
- Orders saved on create-transaction, status updated on Midtrans webhook notification
- API endpoints: GET /api/orders (all orders or filter by ?phone=), GET /api/orders/:orderId
