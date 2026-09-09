import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

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

const PromoContext = createContext<PromoContextValue | null>(null);

export function PromoProvider({ children }: { children: ReactNode }) {
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  const value = useMemo<PromoContextValue>(
    () => ({
      appliedPromo,
      setAppliedPromo,
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
