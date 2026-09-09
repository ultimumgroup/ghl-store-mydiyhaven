import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { StoreProduct, StoreVariant } from "./catalog";
import { readJSONCookie, writeJSONCookie, deleteCookie } from "./cookies";

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
  | { type: "clear" }
  | { type: "hydrate"; state: CartState };

function lineKeyFor(productId: string, variantId?: string): string {
  return `${productId}::${variantId || "default"}`;
}

export function unitPrice(product: StoreProduct, variant?: StoreVariant): number {
  if (variant?.price != null) return variant.price;
  return product.price;
}

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "hydrate":
      return action.state;
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

const CART_COOKIE = "mdh_cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {});
  // Track whether we've hydrated from the cookie to avoid overwriting it
  // with the empty initial state before the restore runs.
  const [hydrated, setHydrated] = useState(false);
  const firstWrite = useRef(true);

  // Restore cart from cookie on mount (client-only, post-hydration).
  useEffect(() => {
    const saved = readJSONCookie<CartState>(CART_COOKIE);
    if (saved && typeof saved === "object") {
      dispatch({ type: "hydrate", state: saved });
    }
    setHydrated(true);
  }, []);

  // Persist cart to cookie whenever it changes (after initial hydration).
  useEffect(() => {
    if (!hydrated) return;
    // Skip the very first post-hydration write if nothing changed.
    if (firstWrite.current) {
      firstWrite.current = false;
      return;
    }
    if (Object.keys(state).length === 0) {
      deleteCookie(CART_COOKIE);
    } else {
      writeJSONCookie(CART_COOKIE, state);
    }
  }, [state, hydrated]);

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

export { lineKeyFor, CART_COOKIE };
