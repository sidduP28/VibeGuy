'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../data/products';
import { ShopperUser, findUserByEmail, SEEDED_USERS, isDemoMode } from '../data/users';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreContextValue {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  currentUser: ShopperUser | null;
  loginUser: (email: string) => boolean;
  logoutUser: () => void;
  appliedDiscount: { code: string; percent: number } | null;
  applyDiscountCode: (code: string) => { success: boolean; message: string };
  removeDiscountCode: () => void;
  trackStoreEvent: (event: 'impression' | 'view_product' | 'add_to_cart' | 'purchase', data?: Record<string, any>) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({
  creatorSlug,
  visitorId,
  group,
  children,
}: {
  creatorSlug: string | null;
  visitorId: string;
  group: string;
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<ShopperUser | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);

  // Restore cart and user from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('aurora_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedUser = localStorage.getItem('aurora_user');
      if (savedUser && isDemoMode()) {
        const found = findUserByEmail(savedUser);
        if (found) setCurrentUser(found);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem('aurora_cart', JSON.stringify(cart));
    } catch {
      // Ignore storage errors
    }
  }, [cart]);

  // Automatic initial page impression tracking
  useEffect(() => {
    trackStoreEvent('impression', {
      path: typeof window !== 'undefined' ? window.location.pathname : '/',
      search: typeof window !== 'undefined' ? window.location.search : '',
    });
  }, [creatorSlug]);

  // Telemetry event tracking to /api/collect (visible under Fetch/XHR in DevTools)
  const trackStoreEvent = (
    event: 'impression' | 'view_product' | 'add_to_cart' | 'purchase',
    data: Record<string, any> = {}
  ) => {
    const payload = {
      siteId: 'site_aurora',
      type: event,
      visitorId,
      creatorId: creatorSlug || 'default',
      group, // 'treatment' | 'holdout'
      url: typeof window !== 'undefined' ? window.location.href : '',
      timestamp: Date.now(),
      data,
    };

    if (typeof window !== 'undefined') {
      fetch('http://localhost:3000/api/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'cors',
        keepalive: true,
      }).catch(() => {
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          navigator.sendBeacon('http://localhost:3000/api/collect', blob);
        }
      });
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    trackStoreEvent('add_to_cart', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('aurora_cart');
    } catch {
      // Ignore
    }
  };

  const loginUser = (email: string): boolean => {
    const user = findUserByEmail(email);
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem('aurora_user', user.email);
      } catch {
        // Ignore
      }
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('aurora_user');
    } catch {
      // Ignore
    }
  };

  const applyDiscountCode = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const VALID_CODES: Record<string, number> = {
      FIT20: 20,
      CALM15: 15,
      LUXE25: 25,
      TECH10: 10,
    };

    if (VALID_CODES[cleanCode]) {
      setAppliedDiscount({ code: cleanCode, percent: VALID_CODES[cleanCode] });
      return { success: true, message: `Promo code ${cleanCode} applied (-${VALID_CODES[cleanCode]}%)` };
    }
    return { success: false, message: 'Invalid or expired promotional code.' };
  };

  const removeDiscountCode = () => {
    setAppliedDiscount(null);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        currentUser,
        loginUser,
        logoutUser,
        appliedDiscount,
        applyDiscountCode,
        removeDiscountCode,
        trackStoreEvent,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
