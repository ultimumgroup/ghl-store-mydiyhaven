import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/store/logo";
import { BRAND_NAME } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo
              to="/"
              className="h-12 w-auto"
              textClassName="font-display text-xl font-bold text-amber"
            />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Handmade home goods, shaped slowly and made to last.
            </p>
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-foreground">Shop</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground">
                  All pieces
                </Link>
              </li>
              <li>
                <a href="#shop" className="hover:text-foreground">
                  Bestsellers
                </a>
              </li>
              <li>
                <a href="#story" className="hover:text-foreground">
                  New arrivals
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-foreground">Studio</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#story" className="hover:text-foreground">
                  Our story
                </a>
              </li>
              <li>
                <a href="#craft" className="hover:text-foreground">
                  The craft
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-foreground">Support</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground">Shipping</li>
              <li className="hover:text-foreground">Returns</li>
              <li className="hover:text-foreground">Care guide</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {BRAND_NAME}. Made by hand.
        </div>
      </div>
    </footer>
  );
}
