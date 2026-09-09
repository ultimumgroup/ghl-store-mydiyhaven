import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Minus, Plus, ShoppingBag, Truck, ShieldCheck, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/store/product-card";
import { useCart } from "@/lib/cart-context";
import { useCartUI } from "@/lib/cart-ui";
import { toast } from "sonner";
import { BRAND_NAME } from "@/lib/brand";
import { productQueryOptions } from "@/lib/catalog-query";
import { formatPrice, priceAvailable, displayPrice, type StoreVariant } from "@/lib/catalog";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => {
    // Static head for SEO; full product data loads via the loader/query.
    return {
      meta: [
        { title: `${params.slug} — ${BRAND_NAME}` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(productQueryOptions(params.slug));
    if (!result.product) throw notFound();
    return { slug: params.slug };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Product not found</h1>
      <p className="mt-2 text-muted-foreground">The piece you're looking for isn't available.</p>
      <Link to="/products" className="mt-4 inline-block text-primary hover:underline">
        Back to all products
      </Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useLoaderData();
  const { data } = useSuspenseQuery(productQueryOptions(slug));
  const product = data.product!;
  const related = data.related;

  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState<string | undefined>(
    product.variants.find((v) => v.available)?.id,
  );
  const { add } = useCart();
  const { setOpen } = useCartUI();

  const selectedVariant: StoreVariant | undefined = product.variants.find(
    (v) => v.id === variantId,
  );
  const hasVariants = product.variants.length > 0;
  const hasPrice = priceAvailable(product);
  const dp = displayPrice(product);
  const currentPrice = selectedVariant?.price ?? product.price;
  const canAdd = hasPrice && (!hasVariants || !!selectedVariant?.available) && product.inStock;
  const onSale =
    hasPrice && product.compareAtPrice != null && product.compareAtPrice > currentPrice;
  // Show "starting at" before a variant is chosen when variant prices differ.
  const showStartingAt = hasVariants && !selectedVariant && dp?.startingAt;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="overflow-hidden rounded-2xl border border-border bg-muted">
          <img
            src={selectedVariant?.image || product.image}
            alt={product.name}
            className="aspect-[3/4] w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          {product.badge && (
            <Badge className="w-fit bg-primary text-primary-foreground">{product.badge}</Badge>
          )}
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">{product.tagline}</p>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i <= Math.round(product.rating)
                      ? "fill-amber text-amber"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="font-medium text-foreground">{product.rating}</span>
            {product.reviews > 0 && (
              <span className="text-muted-foreground">· {product.reviews} reviews</span>
            )}
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            {hasPrice ? (
              <>
                {showStartingAt && (
                  <span className="text-sm font-medium text-muted-foreground">starting at</span>
                )}
                <p className="font-display text-3xl font-bold text-foreground">
                  {formatPrice(showStartingAt ? dp!.amount : currentPrice)}
                </p>
                {onSale && (
                  <p className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </p>
                )}
                {onSale && (
                  <Badge className="bg-destructive text-destructive-foreground">Sale</Badge>
                )}
              </>
            ) : (
              <p className="font-display text-2xl font-semibold text-muted-foreground">
                Price on request
              </p>
            )}
          </div>

          <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Material</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {product.material || "Handcrafted"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="mt-0.5 font-medium text-foreground">{product.category}</dd>
            </div>
          </dl>

          {/* Variant selector */}
          {hasVariants && (
            <div className="mt-6 space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Options</label>
                <Select value={variantId} onValueChange={(v) => setVariantId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants.map((v) => (
                      <SelectItem key={v.id} value={v.id} disabled={!v.available}>
                        {v.label}
                        {v.price != null && v.price > 0 ? ` — ${formatPrice(v.price)}` : ""}
                        {!v.available ? " (Sold out)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedVariant && !selectedVariant.available && (
                <p className="text-sm text-destructive">This option is currently sold out.</p>
              )}
            </div>
          )}

          {!hasPrice && (
            <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
              Pricing for this piece is configured on request. Add it to your cart and we'll confirm
              the final price before payment, or{" "}
              <Link to="/products" className="text-primary hover:underline">
                browse priced pieces
              </Link>
              .
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-md border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1"
              disabled={!canAdd}
              onClick={() => {
                add(product, selectedVariant, qty);
                setOpen(true);
                toast.success(
                  `${qty} × ${product.name}${selectedVariant ? ` (${selectedVariant.label})` : ""} added to cart`,
                );
              }}
            >
              <ShoppingBag className="h-4 w-4" />
              {!hasPrice
                ? "Add to cart"
                : !product.inStock
                  ? "Sold out"
                  : hasVariants && !selectedVariant?.available
                    ? "Select an option"
                    : "Add to cart"}
            </Button>
          </div>

          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> Free shipping over $150 · ships in 2–3 days
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> 30-day returns, no questions asked
            </p>
            <p className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" /> Handmade · one of a kind
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            You may also like
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
