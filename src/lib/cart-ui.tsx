import { createContext, useContext, useState, type ReactNode } from "react";

type CartUIContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const CartUIContext = createContext<CartUIContextValue | null>(null);

export function CartUIProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <CartUIContext.Provider value={{ open, setOpen, toggle: () => setOpen((o) => !o) }}>
      {children}
    </CartUIContext.Provider>
  );
}

export function useCartUI() {
  const ctx = useContext(CartUIContext);
  if (!ctx) throw new Error("useCartUI must be used within CartUIProvider");
  return ctx;
}
