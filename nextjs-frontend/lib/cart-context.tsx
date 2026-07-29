"use client";

import React, { createContext, useContext, useState } from "react";

interface CartContextType {
  countInCart: number;
  setCountInCart: React.Dispatch<React.SetStateAction<number>>;
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

  const refresh = () => {
    // You can trigger a global cart re-fetch here if needed
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        countInCart,
        setCountInCart,
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
