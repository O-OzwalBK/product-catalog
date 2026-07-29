"use client";

import React, { createContext, useContext, useState } from "react";

interface CartContextType {
  countInCart: number;
  setCountInCart: React.Dispatch<React.SetStateAction<number>>;
  refreshKey: number;
  refresh: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [countInCart, setCountInCart] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Increment key to notify listening components to re-fetch
  const refresh = () => setRefreshKey((prev) => prev + 1);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        countInCart,
        setCountInCart,
        refreshKey,
        refresh,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartCount() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartCount must be used within a CartProvider");
  }
  return context;
}
