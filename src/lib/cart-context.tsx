import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { StoreProduct, StoreVariant } from "./catalog";

export type CartItem = {
  product: StoreProduct;
  quantity: number;
  variant?: StoreVariant;
  /** Stable line key = productId + variantId (or "default") */
  lineKey: string;
};

type CartState = Record<string, CartItem>;

type Action =
  | { type: "add"; product: StoreProduct; variant?: StoreVariant; quantity?: number }
  | { type: "remove"; lineKey: string }
  | { type: "setQty"; lineKey: string; quantity: number }
  | { type: "clear" };

function lineKeyFor(productId: string, variantId?: string): string {
  return `${productId}::${variantId || "default"}`;
}

function unitPrice(product: StoreProduct, variant?: StoreVariant): number {
  if (variant?.price != null) return variant.price;
  return product.price;
}

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "add": {
      const { product, variant, quantity = 1 } = action;
      const key = lineKeyFor(product.id, variant?.id);
      const existing = state[key];
      const nextQty = (existing?.quantity ?? 0) + quantity;
      return {
        ...state,
        [key]: { product, variant, quantity: nextQty, lineKey: key },
      };
    }
    case "remove": {
      const next = { ...state };
      delete next[action.lineKey];
      return next;
    }
    case "setQty": {
      if (action.quantity <= 0) {
        const next = { ...state };
        delete next[action.lineKey];
        return next;
      }
      const existing = state[action.lineKey];
      if (!existing) return state;
      return { ...state, [action.lineKey]: { ...existing, quantity: action.quantity } };
    }
    case "clear":
      return {};
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (product: StoreProduct, variant?: StoreVariant, quantity?: number) => void;
  remove: (lineKey: string) => void;
  setQty: (lineKey: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {});

  const value = useMemo<CartContextValue>(() => {
    const items = Object.values(state);
    return {
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.quantity * unitPrice(i.product, i.variant), 0),
      add: (product, variant, quantity) => dispatch({ type: "add", product, variant, quantity }),
      remove: (lineKey) => dispatch({ type: "remove", lineKey }),
      setQty: (lineKey, quantity) => dispatch({ type: "setQty", lineKey, quantity }),
      clear: () => dispatch({ type: "clear" }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export { lineKeyFor, unitPrice };
