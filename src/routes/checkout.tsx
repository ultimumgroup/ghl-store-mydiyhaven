import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useCart, unitPrice } from "@/lib/cart-context";
import { quoteCart } from "@/lib/ghl.functions";
import { formatPrice } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Review cart — My DIY Haven" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Checkout,
});
function Checkout() {
  const { items, subtotal, hydrated } = useCart();
  const check = useServerFn(quoteCart);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<Awaited<ReturnType<typeof quoteCart>> | null>(null);
  const signature = items.map((i) => `${i.lineKey}:${i.quantity}`).join("|");
  const [quotedSignature, setQuotedSignature] = useState("");
  const currentQuote = quotedSignature === signature ? quote : null;
  async function review() {
    setBusy(true);
    setError("");
    setQuote(null);
    try {
      const q = await check({
        data: items.map((i) => ({
          productId: i.product.id,
          variantId: i.variant?.id || "",
          quantity: i.quantity,
        })),
      });
      setQuote(q);
      setQuotedSignature(signature);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not check this cart. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mx-auto max-w-3xl px-5 py-12">
      <Link to="/products" className="underline">
        Continue shopping
      </Link>
      <h1 className="mt-6 font-display text-3xl">Review your cart</h1>
      {!hydrated ? (
        <p role="status">Restoring your cart…</p>
      ) : items.length === 0 ? (
        <p className="mt-6">Your cart is empty.</p>
      ) : (
        <>
          <ul className="mt-8 divide-y">
            {items.map((i) => (
              <li key={i.lineKey} className="flex justify-between gap-6 py-4">
                <div>
                  {i.product.name}
                  <p className="text-sm text-muted-foreground">
                    {i.variant?.label} · Quantity {i.quantity}
                  </p>
                </div>
                <span>{formatPrice(unitPrice(i.product, i.variant) * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xl">
            Item subtotal: {formatPrice(currentQuote?.subtotal ?? subtotal)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Shipping and tax have not been calculated.
          </p>
          <Button className="mt-6" onClick={review} disabled={busy}>
            {busy ? "Checking current prices and stock…" : "Check current prices and stock"}
          </Button>
          {error && (
            <p role="alert" className="mt-4 text-destructive">
              {error}
            </p>
          )}
          {currentQuote && (
            <div role="status" className="mt-6 rounded-lg border p-4">
              <p>Current item subtotal: {formatPrice(currentQuote.subtotal)}</p>
              <ul>
                {currentQuote.lines.map((l) => (
                  <li key={l.variantId} className="mt-2 text-sm">
                    {l.name} · {l.variantName} · {l.quantity} × {formatPrice(l.unitAmount)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8 rounded-lg border p-5">
            <h2 className="font-semibold">Online payment is not available yet</h2>
            <p className="mt-2">
              Your cart is saved in this browser. No order has been placed and no payment has been
              taken.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
