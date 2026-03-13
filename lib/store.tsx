import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Product } from "./products";
import type { Language } from "./i18n";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: string;
}

interface StoreContextValue {
  // Cart
  cart: CartItem[];
  wishlist: string[];
  language: Language;
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (sku: string) => void;
  updateQuantity: (sku: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  toggleWishlist: (sku: string) => void;
  isInWishlist: (sku: string) => boolean;
  setLanguage: (lang: Language) => void;
  // Auth
  authUser: AuthUser | null;
  authToken: string | null;
  isAuthLoaded: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_KEY = "@evitamin_cart";
const WISHLIST_KEY = "@evitamin_wishlist";
const LANG_KEY = "@evitamin_lang";
const AUTH_KEY = "@evitamin_auth";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [language, setLanguageState] = useState<Language>("id");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [cartData, wishData, langData, authData] = await Promise.all([
          AsyncStorage.getItem(CART_KEY),
          AsyncStorage.getItem(WISHLIST_KEY),
          AsyncStorage.getItem(LANG_KEY),
          AsyncStorage.getItem(AUTH_KEY),
        ]);
        if (cartData) setCart(JSON.parse(cartData));
        if (wishData) setWishlist(JSON.parse(wishData));
        if (langData) setLanguageState(langData as Language);
        if (authData) {
          const parsed = JSON.parse(authData);
          setAuthUser(parsed.user);
          setAuthToken(parsed.token);
        }
      } catch (e) {
        console.error("Failed to load store:", e);
      } finally {
        setIsAuthLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(CART_KEY, JSON.stringify(cart)).catch(() => {});
  }, [cart]);

  useEffect(() => {
    AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)).catch(() => {});
  }, [wishlist]);

  const addToCart = useCallback((product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.sku === product.sku);
      if (existing) {
        return prev.map((item) =>
          item.product.sku === product.sku
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((sku: string) => {
    setCart((prev) => prev.filter((item) => item.product.sku !== sku));
  }, []);

  const updateQuantity = useCallback((sku: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.product.sku !== sku));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.sku === sku ? { ...item, quantity: qty } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback((sku: string) => {
    setWishlist((prev) =>
      prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku]
    );
  }, []);

  const isInWishlist = useCallback(
    (sku: string) => wishlist.includes(sku),
    [wishlist]
  );

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANG_KEY, lang).catch(() => {});
  }, []);

  const setAuth = useCallback((user: AuthUser, token: string) => {
    setAuthUser(user);
    setAuthToken(token);
    AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user, token })).catch(() => {});
  }, []);

  const logout = useCallback(() => {
    setAuthUser(null);
    setAuthToken(null);
    AsyncStorage.removeItem(AUTH_KEY).catch(() => {});
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.priceIdr * item.quantity, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      language,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      toggleWishlist,
      isInWishlist,
      setLanguage,
      authUser,
      authToken,
      isAuthLoaded,
      setAuth,
      logout,
    }),
    [cart, wishlist, language, addToCart, removeFromCart, updateQuantity, clearCart,
     cartTotal, cartCount, toggleWishlist, isInWishlist, setLanguage,
     authUser, authToken, isAuthLoaded, setAuth, logout]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
