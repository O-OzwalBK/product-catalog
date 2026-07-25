"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { getCart } from "@/lib/api";

const CartCountContext = createContext<{ count: number; refresh: () => void }>({
  count: 0,
  refresh: () => {},
});

export function CartCountProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!session?.backendToken) {
      setCount(0);
      return;
    }
    const { data } = await getCart(session.backendToken);
    setCount(data.reduce((sum, item) => sum + item.quantity, 0));
  }, [session?.backendToken]);

  useEffect(() => {
    if (status === "authenticated") refresh();
  }, [status, refresh]);

  return (
    <CartCountContext.Provider value={{ count, refresh }}>
      {children}
    </CartCountContext.Provider>
  );
}

export const useCartCount = () => useContext(CartCountContext);
