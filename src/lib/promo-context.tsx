import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { deleteCookie } from "./cookies";
export type AppliedPromo = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  label: string;
  freeShipping?: boolean | undefined;
};
const Context = createContext<{
  appliedPromo: AppliedPromo | null;
  setAppliedPromo: (p: AppliedPromo | null) => void;
  getDiscount: (n: number) => number;
} | null>(null);
export const PROMO_COOKIE = "mdh_promo";
export function PromoProvider({ children }: { children: ReactNode }) {
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  // Retire untrusted persisted demo discounts; GHL checkout must validate redemption.
  useEffect(() => {
    deleteCookie(PROMO_COOKIE);
  }, []);
  return (
    <Context.Provider value={{ appliedPromo, setAppliedPromo, getDiscount: () => 0 }}>
      {children}
    </Context.Provider>
  );
}
export function usePromo() {
  const c = useContext(Context);
  if (!c) throw new Error("Missing PromoProvider");
  return c;
}
