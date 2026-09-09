import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { readJSONCookie, writeJSONCookie, deleteCookie } from "./cookies";

export type AppliedPromo = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  label: string;
  freeShipping?: boolean;
};

type PromoContextValue = {
  appliedPromo: AppliedPromo | null;
  setAppliedPromo: (promo: AppliedPromo | null) => void;
  /** Computes the discount for a given subtotal based on the applied promo. */
  getDiscount: (subtotal: number) => number;
};

const PROMO_COOKIE = "mdh_promo";
const PromoContext = createContext<PromoContextValue | null>(null);

export function PromoProvider({ children }: { children: ReactNode }) {
  const [appliedPromo, setAppliedPromoState] = useState<AppliedPromo | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const firstWrite = useRef(true);

  // Restore applied promo from cookie on mount.
  useEffect(() => {
    const saved = readJSONCookie<AppliedPromo>(PROMO_COOKIE);
    if (saved && saved.code) {
      setAppliedPromoState(saved);
    }
    setHydrated(true);
  }, []);

  // Persist promo to cookie whenever it changes (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    if (firstWrite.current) {
      firstWrite.current = false;
      return;
    }
    if (appliedPromo) {
      writeJSONCookie(PROMO_COOKIE, appliedPromo);
    } else {
      deleteCookie(PROMO_COOKIE);
    }
  }, [appliedPromo, hydrated]);

  const value = useMemo<PromoContextValue>(
    () => ({
      appliedPromo,
      setAppliedPromo: setAppliedPromoState,
      getDiscount: (subtotal: number) => {
        if (!appliedPromo) return 0;
        const base = Math.max(0, subtotal);
        if (appliedPromo.type === "percent") {
          return Math.round(base * (appliedPromo.value / 100) * 100) / 100;
        }
        // fixed discount cannot exceed subtotal
        return Math.min(appliedPromo.value, base);
      },
    }),
    [appliedPromo],
  );

  return <PromoContext.Provider value={value}>{children}</PromoContext.Provider>;
}

export function usePromo() {
  const ctx = useContext(PromoContext);
  if (!ctx) throw new Error("usePromo must be used within PromoProvider");
  return ctx;
}

export { PROMO_COOKIE };
