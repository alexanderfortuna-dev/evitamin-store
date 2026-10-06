# VitaminKu — PROGRESS

_Last update: 2026-10-06 — Phase 0 (audit, no code changes)_

## 0. Critical finding: two different codebases

The mission brief describes "Lovable project vitaku-shop, React + Supabase, this repo is its GitHub sync".
**That does not match this repo.**

| | This repo (`alexanderfortuna-dev/evitamin-store`) | Lovable project "VitaminKu Commerce" (`ceb042d8-…`) |
|---|---|---|
| Origin | Replit AI (last push 2026-03-15) | Lovable (last edit 2026-09-21) |
| Stack | Expo / React Native (web export) + Express + Drizzle + plain Postgres | TanStack Start (React) + Supabase (Lovable Cloud) + shadcn |
| Database | Replit Postgres, no Supabase, **no RLS possible** | Supabase with `user_roles`, `has_role()`, RLS, `admin_audit_log`, `products` (1,413 rows) |
| Catalog | 2,406 products hard-coded in `lib/products.ts` (50k lines) | Shopify Storefront API; plan dated 2026-09-21 to switch catalog to Supabase DB |
| Payment | Midtrans Snap (env keys) | Shopify hosted checkout — **no payment method active** (own audit: gate 8 FAIL) |
| Admin | None (only an "Admin" badge) | Admin panel with owner bootstrap, role checks; product writes blocked (Shopify Admin token 401) |
| Own audit | none | `docs/production-readiness.md`: 10/20 gates PASS |
| GitHub sync | — | Not connected to any repo this session can reach |

Supabase account has one project: `nolimit-system` (ops system, not the store).

**Decision required from Kings before Phase 2 (see Phase 1 questions).**

## 1. Definition-of-Done score — THIS repo (evitamin-store)

Legend: Done / Partial / Missing. Nothing below is "Verified" yet (no build or browser test run in Phase 0).

| # | Item | Status | Evidence (file) |
|---|---|---|---|
| 1 | Home → search → category → PDP → variant → cart → checkout → confirmation | **Partial** | Screens exist (`app/(tabs)/*`, `app/product/[sku].tsx`, `app/checkout.tsx`). No order-confirmation screen (Snap `finish` URL points to non-existent `/checkout/finish`). Not tested at 360/390px. |
| 2 | ≤3-step checkout, guest/OTP, ID address autocomplete, courier API, QRIS/VA/e-wallet/card sandbox | **Partial** | One-page checkout + Midtrans Snap (QRIS/VA/GoPay/ShopeePay/card) in `server/midtrans.ts`. **Shipping costs hard-coded** (`app/checkout.tsx:25-29`). No address autocomplete. Login = phone+password, no OTP. Sandbox depends on `MIDTRANS_IS_PRODUCTION` env (replit.md says "production mode"). |
| 3 | Sticky add-to-cart, bottom nav (Beranda/Kategori/Cari/Keranjang/Akun), ≥44px taps, no h-scroll, 16px | **Partial** | Sticky buy bar exists on PDP. Tabs = Home/Search/Wishlist/Cart/Profile — **no Kategori tab**. Tap sizes / overflow not measured. |
| 4 | Typo-tolerant instant search; filters brand/goal/price/form | **Missing** (search Partial) | `app/(tabs)/search.tsx`: plain substring match, 50-result cap. No filters. **Brand data is corrupt** (brands like "(NEW!)", "USA", "PREMIUM"). No goal/form fields. |
| 5 | Account: order history, 1-tap re-order, wishlist, addresses | **Partial** | Wishlist (local storage) Done. Order history via `GET /api/orders?phone=` (unauthenticated). No re-order, no saved addresses. |
| 6 | WhatsApp button on every page | **Missing** | No WhatsApp anywhere. |
| 7 | Seller Center (products, variants, prices, stock, images, CSV import/export, order status) | **Missing** | No admin routes or APIs. Products are hard-coded in source — every change needs a code deploy. |
| 8 | Owner/admin-only access, verified with Supabase RLS | **Missing** | No Supabase. JWT secret falls back to hard-coded `"evitamin-fallback-secret"` (`server/auth.ts:9`). |
| 9 | Lighthouse mobile P≥85 / A≥90 / SEO≥90, LCP<2.5s, WebP/AVIF lazy | **Missing / unmeasured** | 50k-line product array is bundled into the client JS — strong LCP risk. Images hot-linked from Shopee CDN (`cf.shopee.co.id`). |
| 10 | SEO: meta per product, sitemap, Product JSON-LD, clean URLs | **Missing** | React Native web export; no per-page meta, no sitemap, no JSON-LD. URLs use SKU like `/product/(NEW!)-RIM100CRE-150GR`. |
| 11 | No console errors, build passes, no secrets in code | **Partial** | Secrets read from env (good) except JWT fallback secret. Build not run yet. |
| 12 | Forbidden products blocked at data level | **Missing** | Found in catalog: `FACTOR YOHIMBINE 6MG`, `DHEA 25 ANTI AGING`. No blocking rule anywhere. |

### Security / correctness defects found (this repo)
- **P0 data leak:** `GET /api/orders` with no `phone` returns the latest 50 orders of all customers (names, phones, addresses), no auth (`server/routes.ts`). `GET /api/orders/:orderId` also unauthenticated.
- **P0 price tampering:** server trusts item prices sent by the browser when creating the Midtrans transaction.
- **P0 fake prices:** `replit.md` states prices were "generated algorithmically… no price data in Excel". Catalog prices are not real.
- **P1:** Midtrans webhook does not verify `signature_key`; anyone can mark an order paid.
- **P1:** BPOM-risk copy: titles such as "Peningkat Hormon Testoterone", "Awet Muda" (needs review).

## 2. Definition-of-Done score — Lovable "VitaminKu Commerce" (for comparison, from its own audit 2026-09-17)

| # | Status | Note |
|---|---|---|
| 1 | Partial | Funnel works to Shopify checkout; payment disabled at store level |
| 2 | Missing/Blocked | No active payment, no courier API |
| 3 | Done (per its audit) | BottomNav, 44px CTA, no overflow at 360/390/430 |
| 4 | Partial | Search + category/goal filters; no typo tolerance |
| 5 | Missing | Order history not implemented |
| 6 | Missing | No verified WhatsApp |
| 7 | Partial/Blocked | Admin panel exists, product writes blocked (401) |
| 8 | Done (code) | RLS + `has_role()` on Supabase |
| 9–10 | Unmeasured | SSR (TanStack Start) gives a much better SEO/LCP starting point |
| 11 | Done | Build, typecheck, 16 tests pass (per its audit) |
| 12 | Unknown | Not audited |

## 3. Recommendation (Proposed)

Finish on a **React web + Supabase** codebase (the Lovable "VitaminKu Commerce" project, connected to GitHub so it can be worked on here without Lovable credits). Reasons: SSR for SEO/LCP, Supabase RLS for item 8, admin + role model already built. This Expo repo would need near-total rewrite for items 7–10 and 12.

## 4. Milestone log
| Date | Milestone | Status |
|---|---|---|
| 2026-10-06 | Phase 0 audit | Done |
