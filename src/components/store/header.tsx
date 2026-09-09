import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useCartUI } from "@/lib/cart-ui";
import { Logo } from "@/components/store/logo";

export function Header() {
  const { count } = useCart();
  const { toggle } = useCartUI();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo
          to="/"
          className="h-10 w-auto"
          textClassName="font-display text-lg font-bold text-amber"
        />

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/products"
            activeProps={{ className: "text-foreground font-semibold" }}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            All Products
          </Link>
          <Link
            to="/collections"
            activeProps={{ className: "text-foreground font-semibold" }}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Collections
          </Link>
          <a
            href="/#story"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Our Story
          </a>
          <a
            href="/#craft"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            The Craft
          </a>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="relative"
          aria-label="Open cart"
        >
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
              {count}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}
