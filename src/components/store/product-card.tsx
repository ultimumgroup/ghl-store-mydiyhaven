import { Link } from "@tanstack/react-router";
import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, priceAvailable, displayPrice, type StoreProduct } from "@/lib/catalog";
import { useCart } from "@/lib/cart-context";
import { useCartUI } from "@/lib/cart-ui";
import { toast } from "sonner";

export function ProductCard({ product }: { product: StoreProduct }) {
  const { add } = useCart();
  const { setOpen } = useCartUI();

  // Quick-add uses the first available variant (if any), else the base product.
  const quickVariant = product.variants.find((v) => v.available);
  const hasPrice = priceAvailable(product);
  const dp = displayPrice(product);
  const soldOut = !product.inStock && product.variants.length > 0 && !quickVariant;
  // When a product has multiple option combos, require selection on the PDP.
  const needsSelection = product.variants.length > 1;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg hover:shadow-primary/5">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[3/4] overflow-hidden bg-muted"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.badge && (
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground shadow">
            {product.badge}
          </Badge>
        )}
        {product.variants.length > 1 && (
          <Badge className="absolute right-3 top-3 bg-secondary/90 text-secondary-foreground backdrop-blur">
            {product.variants.length} options
          </Badge>
        )}
        {product.compareAtPrice && product.compareAtPrice > product.price && hasPrice && (
          <Badge className="absolute left-3 bottom-3 bg-destructive text-destructive-foreground shadow">
            Sale
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-amber text-amber" />
          <span className="font-medium text-foreground">{product.rating}</span>
          {product.reviews > 0 && <span>· {product.reviews} reviews</span>}
        </div>

        <Link to="/products/$slug" params={{ slug: product.slug }} className="mt-2">
          <h3 className="font-display text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.tagline}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {dp ? (
              <>
                {dp.startingAt && <span className="text-xs text-muted-foreground">from</span>}
                <span className="font-display text-lg font-semibold text-foreground">
                  {formatPrice(dp.amount)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > dp.amount && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </>
            ) : (
              <span className="font-display text-sm font-medium text-muted-foreground">
                Price on request
              </span>
            )}
          </div>
          <Button
            size="icon"
            disabled={soldOut || !hasPrice || needsSelection}
            onClick={() => {
              add(product, quickVariant);
              setOpen(true);
              toast.success(
                `${product.name}${quickVariant ? ` (${quickVariant.label})` : ""} added to cart`,
              );
            }}
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
