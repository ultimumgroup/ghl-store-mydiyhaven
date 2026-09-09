import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_NAME, ORDER_PREFIX } from "@/lib/brand";

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: typeof search.orderId === "string" ? search.orderId : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Order confirmed — ${BRAND_NAME}` },
      {
        name: "description",
        content: "Thank you for your order of handmade home goods.",
      },
      { property: "og:title", content: `Order confirmed — ${BRAND_NAME}` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { orderId } = Route.useSearch();
  const orderNo = orderId || `${ORDER_PREFIX}-${Math.floor(100000 + Math.random() * 899999)}`;
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Check className="h-8 w-8 text-primary" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground">
        Thank you for your order
      </h1>
      <p className="mt-3 text-muted-foreground">
        Your handmade pieces are being prepared with care. A confirmation has been sent to your
        email.
      </p>

      <div className="mt-6 flex w-full items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4 text-primary" /> Order number
        </span>
        <span className="font-display font-semibold text-foreground">{orderNo}</span>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">Estimated delivery: 5–7 business days.</p>

      <Button asChild size="lg" className="mt-8">
        <Link to="/">Continue shopping</Link>
      </Button>
    </div>
  );
}
