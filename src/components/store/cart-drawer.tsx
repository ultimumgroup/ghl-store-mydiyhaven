import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, unitPrice } from "@/lib/cart-context";
import { useCartUI } from "@/lib/cart-ui";
import { usePromo } from "@/lib/promo-context";
import { PromoCodeInput } from "@/components/store/promo-code-input";
import { formatPrice } from "@/lib/catalog";

export function CartDrawer() {
  const { items, subtotal, count, setQty, remove } = useCart();
  const { open, setOpen } = useCartUI();
  const { appliedPromo, getDiscount } = usePromo();
  const discount = getDiscount(subtotal);
  const freeShipping = appliedPromo?.freeShipping ?? false;
  const shipping = subtotal > 0 ? (subtotal > 150 || freeShipping ? 0 : 9) : 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="font-display">Your Cart {count > 0 && `(${count})`}</SheetTitle>
          <SheetDescription>
            {count === 0 ? "Your cart is currently empty." : "Review your pieces before checkout."}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-foreground">
                Nothing here yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Discover handcrafted pieces made to last.
              </p>
            </div>
            <Button asChild onClick={() => setOpen(false)}>
              <Link to="/">Continue shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              {items.map(({ product, quantity, variant, lineKey }) => (
                <div key={lineKey} className="flex gap-4">
                  <img
                    src={variant?.image || product.image}
                    alt={product.name}
                    className="h-24 w-20 flex-shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link
                        to="/products/$slug"
                        params={{ slug: product.slug }}
                        onClick={() => setOpen(false)}
                        className="font-display text-sm font-semibold text-foreground hover:text-primary"
                      >
                        {product.name}
                      </Link>
                      <button
                        onClick={() => remove(lineKey)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {variant ? (
                      <p className="text-xs text-muted-foreground">{variant.label}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">{product.material}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          onClick={() => setQty(lineKey, quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                        <button
                          onClick={() => setQty(lineKey, quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-display text-sm font-semibold">
                        {formatPrice(unitPrice(product, variant) * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-border px-6 py-4">
              <PromoCodeInput subtotal={subtotal} variant="drawer" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-primary">
                  <span>Discount ({appliedPromo?.code})</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span className="text-foreground">
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
              {subtotal < 150 && !freeShipping && (
                <p className="text-xs text-muted-foreground">
                  Add {formatPrice(150 - subtotal)} more for free shipping.
                </p>
              )}
              <div className="flex justify-between border-t border-border pt-3 font-display text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(subtotal - discount + shipping)}</span>
              </div>
              <Button asChild size="lg" className="w-full" onClick={() => setOpen(false)}>
                <Link to="/checkout">Proceed to checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
