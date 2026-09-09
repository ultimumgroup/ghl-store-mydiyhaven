import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Lock, Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart, unitPrice } from "@/lib/cart-context";
import { usePromo } from "@/lib/promo-context";
import { PromoCodeInput } from "@/components/store/promo-code-input";
import { placeStoreOrder } from "@/lib/ghl.functions";
import { formatPrice } from "@/lib/catalog";
import { toast } from "sonner";
import { BRAND_NAME } from "@/lib/brand";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: `Checkout — ${BRAND_NAME}` },
      {
        name: "description",
        content: "Complete your order of handmade home goods.",
      },
      { property: "og:title", content: `Checkout — ${BRAND_NAME}` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, count, clear } = useCart();
  const { appliedPromo, getDiscount, setAppliedPromo } = usePromo();
  const navigate = Route.useNavigate();
  const [placing, setPlacing] = useState(false);
  const placeOrder = useServerFn(placeStoreOrder);

  const discount = getDiscount(subtotal);
  const freeShipping = appliedPromo?.freeShipping ?? false;
  const shipping = subtotal > 150 || freeShipping || subtotal === 0 ? 0 : 9;
  const taxedBase = Math.max(0, subtotal - discount);
  const tax = Math.round(taxedBase * 0.08 * 100) / 100;
  const total = taxedBase + shipping + tax;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPlacing(true);

    try {
      const orderItems = items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        price: unitPrice(i.product, i.variant),
        name: i.variant ? `${i.product.name} (${i.variant.label})` : i.product.name,
        variantId: i.variant?.id,
      }));

      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const cardNum = (formData.get("card") as string) || "";
      const cleanedCard = cardNum.replace(/\s+/g, "");
      const last4 = cleanedCard.slice(-4) || "4242";

      // Detect basic card brand
      let cardType = "card";
      if (/^4/.test(cleanedCard)) cardType = "visa";
      else if (/^5[1-5]/.test(cleanedCard)) cardType = "mastercard";
      else if (/^3[47]/.test(cleanedCard)) cardType = "amex";
      else if (/^6(?:011|5)/.test(cleanedCard)) cardType = "discover";

      const data = await placeOrder({
        data: {
          email: (formData.get("email") as string) || "",
          phone: (formData.get("phone") as string) || "",
          name: (formData.get("name") as string) || "",
          address: (formData.get("addr") as string) || "",
          city: (formData.get("city") as string) || "",
          state: (formData.get("state") as string) || "",
          zip: (formData.get("zip") as string) || "",
          items: orderItems,
          totalAmount: total,
          promoCode: appliedPromo?.code,
          discountAmount: discount,
          payment: {
            mode: "card",
            card: {
              type: cardType,
              last4,
            },
            notes: `Paid online via ${cardType.toUpperCase()} ending in ${last4}`,
          },
        },
      });

      if (!data.success) {
        toast.error(data.error || "Something went wrong placing your order. Please try again.");
        return;
      }

      clear();
      setAppliedPromo(null);
      toast.success("Order placed successfully! Thank you.");
      navigate({
        to: "/order-confirmation",
        search: { orderId: data.orderId || `MDH-${Math.floor(100000 + Math.random() * 899999)}` },
      });
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Something went wrong placing your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (count === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
          Your cart is empty
        </h1>
        <p className="mt-2 text-muted-foreground">Add a piece to your cart before checking out.</p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/">Browse the collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Continue shopping
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <fieldset className="space-y-4">
            <legend className="font-display text-lg font-semibold text-foreground">Contact</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" placeholder="(555) 000-0000" />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-border pt-6">
            <legend className="font-display text-lg font-semibold text-foreground">
              Shipping address
            </legend>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required placeholder="Jane Maker" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr">Address</Label>
              <Input id="addr" name="addr" required placeholder="123 Craft St" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required placeholder="Portland" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" required placeholder="OR" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="zip">ZIP</Label>
                <Input id="zip" name="zip" required placeholder="97201" />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-border pt-6">
            <legend className="font-display text-lg font-semibold text-foreground">Payment</legend>
            <div className="space-y-1.5">
              <Label htmlFor="card">Card number</Label>
              <Input
                id="card"
                name="card"
                required
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="exp">Expiry</Label>
                <Input id="exp" name="exp" required placeholder="MM / YY" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" name="cvc" required placeholder="123" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name-card">Name on card</Label>
                <Input id="name-card" name="name-card" required placeholder="Jane Maker" />
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Secure checkout — payment details recorded directly to
              your account.
            </p>
          </fieldset>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Order summary</h2>
            <p className="text-sm text-muted-foreground">{count} items</p>

            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
              {items.map(({ product, quantity, variant, lineKey }) => (
                <div key={lineKey} className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={variant?.image || product.image}
                      alt={product.name}
                      className="h-14 w-12 rounded-md object-cover"
                    />
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                      {quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-0.5">
                    <span className="text-sm font-medium text-foreground">{product.name}</span>
                    {variant && (
                      <span className="text-xs text-muted-foreground">{variant.label}</span>
                    )}
                  </div>
                  <span className="self-center text-sm text-muted-foreground">
                    {formatPrice(unitPrice(product, variant) * quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <PromoCodeInput subtotal={subtotal} variant="summary" />
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Discount ({appliedPromo?.code})</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-foreground">
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span className="text-foreground">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Button type="submit" size="lg" className="mt-5 w-full" disabled={placing}>
              {placing ? (
                "Placing order…"
              ) : (
                <>
                  <Check className="h-4 w-4" /> Place order · {formatPrice(total)}
                </>
              )}
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
