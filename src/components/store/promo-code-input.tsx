import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Tag, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validatePromoCode } from "@/lib/ghl.functions";
import { usePromo } from "@/lib/promo-context";
import { toast } from "sonner";

type Props = {
  subtotal: number;
  variant?: "drawer" | "summary";
};

/**
 * Promo / coupon code input. Validates live against the sub-account coupons
 * API via a server function, with a graceful local demo-code fallback.
 * Applied state is shared across cart drawer and checkout via PromoProvider.
 */
export function PromoCodeInput({ subtotal, variant = "summary" }: Props) {
  const { appliedPromo, setAppliedPromo } = usePromo();
  const validate = useServerFn(validatePromoCode);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApplied = !!appliedPromo;

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Enter a promo code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await validate({ data: { code: trimmed, subtotal } });
      if (result.valid) {
        setAppliedPromo({
          code: result.code || trimmed.toUpperCase(),
          type: result.type || "fixed",
          value: result.value ?? 0,
          label: result.label || "Promo applied",
          freeShipping: result.freeShipping,
        });
        setCode("");
        toast.success(result.label || "Promo code applied");
      } else {
        setError(result.message || "That code isn't valid.");
        toast.error(result.message || "Invalid promo code");
      }
    } catch {
      setError("Couldn't verify that code. Try again.");
      toast.error("Couldn't verify promo code");
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    setAppliedPromo(null);
    setCode("");
    setError(null);
    toast("Promo code removed");
  }

  if (isApplied) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{appliedPromo.code}</p>
            <p className="truncate text-xs text-muted-foreground">{appliedPromo.label}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="flex-shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Remove promo code"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Promo code"
            className="pl-8"
            aria-label="Promo code"
            disabled={loading}
            autoCapitalize="characters"
            autoCorrect="off"
          />
        </div>
        <Button
          type="submit"
          variant={variant === "drawer" ? "secondary" : "outline"}
          size="sm"
          disabled={loading || !code.trim()}
          className="flex-shrink-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </Button>
      </form>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}
