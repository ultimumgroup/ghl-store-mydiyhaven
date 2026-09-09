import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import type { StoreProduct, StoreVariant } from "./catalog";
import { readJSONCookie, writeCookie, deleteCookie } from "./cookies";
import { getCatalog } from "./ghl.functions";
import { parseCart, restoreCart, serializeCart, lineKeyFor, type CartItem } from "./cart-codec";
import { toast } from "sonner";
export type { CartItem } from "./cart-codec";
export { lineKeyFor };
export const CART_COOKIE = "mdh_cart";
export const unitPrice = (product: StoreProduct, variant?: StoreVariant) =>
  variant?.price ?? product.price;
interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  add: (p: StoreProduct, v?: StoreVariant, q?: number) => boolean;
  remove: (key: string) => void;
  setQty: (key: string, q: number) => void;
  clear: () => void;
}
const Context = createContext<CartContextValue | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [restoreError, setRestoreError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const saved = parseCart(readJSONCookie<unknown>(CART_COOKIE));
    if (!saved.length) {
      setHydrated(true);
      return;
    }
    setRestoreError(false);
    getCatalog()
      .then((c) => {
        if (!active) return;
        const restored = restoreCart(saved, c.products);
        setItems(restored);
        setHydrated(true);
        if (
          restored.length !== saved.length ||
          restored.some((r, i) => r.quantity !== saved[i]?.quantity)
        )
          toast.info("Your cart was updated to reflect current stock.");
      })
      .catch(() => {
        if (active) setRestoreError(true);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  // Persist in event handlers, not a mount effect: failed restoration cannot erase a saved cart.
  const commit = (next: CartItem[]) => {
    try {
      const encoded = serializeCart(next);
      if (next.length) writeCookie(CART_COOKIE, encoded);
      else deleteCookie(CART_COOKIE);
      setItems(next);
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save your cart.");
      return false;
    }
  };
  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal:
        items.reduce(
          (n, i) => n + Math.round(unitPrice(i.product, i.variant) * 100) * i.quantity,
          0,
        ) / 100,
      add: (product, v, q = 1) => {
        if (!hydrated) {
          toast.info("Wait for your saved cart to finish loading.");
          return false;
        }
        if (!Number.isFinite(q)) return false;
        const variant = v ?? product.variants.find((v) => v.available);
        if (!product.inStock || !variant?.available) return false;
        const key = lineKeyFor(product.id, variant.id);
        const existing = items.find((i) => i.lineKey === key);
        const limit = Math.min(99, variant.maxQuantity ?? 99);
        const quantity = Math.min(limit, (existing?.quantity ?? 0) + Math.max(1, Math.floor(q)));
        return commit([
          ...items.filter((i) => i.lineKey !== key),
          { product, variant, quantity, lineKey: key },
        ]);
      },
      remove: (key) => commit(items.filter((i) => i.lineKey !== key)),
      setQty: (key, q) => {
        if (!Number.isFinite(q)) return;
        commit(
          items.flatMap((i) =>
            i.lineKey !== key
              ? [i]
              : q <= 0
                ? []
                : [
                    {
                      ...i,
                      quantity: Math.min(
                        99,
                        i.variant.maxQuantity ?? 99,
                        Math.max(1, Math.floor(q)),
                      ),
                    },
                  ],
          ),
        );
      },
      clear: () => commit([]),
    }),
    [items, hydrated],
  );
  return (
    <Context.Provider value={value}>
      {restoreError && (
        <div role="alert" className="border-b bg-muted p-3 text-center text-sm">
          Your saved cart could not be restored.{" "}
          <button className="underline" onClick={() => setRetry((n) => n + 1)}>
            Retry
          </button>
        </div>
      )}
      {children}
    </Context.Provider>
  );
}
export function useCart() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Missing CartProvider");
  return ctx;
}
