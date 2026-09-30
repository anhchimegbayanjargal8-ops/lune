"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { CartLine, Product } from "@/lib/types";

const STORAGE_KEY = "lune_cart_v1";

interface CartContextValue {
  lines: CartLine[];
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function lineKey(productId: string, size: string, color: string) {
  return `${productId}__${size}__${color}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, isHydrated]);

  const addItem: CartContextValue["addItem"] = (product, size, color, quantity = 1) => {
    setLines((prev) => {
      const key = lineKey(product.id, size, color);
      const existing = prev.find((l) => lineKey(l.productId, l.size, l.color) === key);
      if (existing) {
        return prev.map((l) =>
          lineKey(l.productId, l.size, l.color) === key
            ? { ...l, quantity: l.quantity + quantity }
            : l
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0].url,
          price: product.price,
          size,
          color,
          quantity,
        },
      ];
    });
    setIsDrawerOpen(true);
  };

  const removeItem: CartContextValue["removeItem"] = (productId, size, color) => {
    setLines((prev) =>
      prev.filter((l) => lineKey(l.productId, l.size, l.color) !== lineKey(productId, size, color))
    );
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (
    productId,
    size,
    color,
    quantity
  ) => {
    setLines((prev) =>
      prev
        .map((l) =>
          lineKey(l.productId, l.size, l.color) === lineKey(productId, size, color)
            ? { ...l, quantity }
            : l
        )
        .filter((l) => l.quantity > 0)
    );
  };

  const clearCart = () => setLines([]);

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [lines]
  );
  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  );

  const value: CartContextValue = {
    lines,
    isDrawerOpen,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
