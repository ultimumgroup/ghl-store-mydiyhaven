import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag, ArrowUpRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useCartUI } from "@/lib/cart-ui";
const navigation = [
  { to: "/products", label: "The shop" },
  { to: "/collections", label: "Collections" },
  { to: "/about", label: "Meet Larry" },
  { to: "/studio", label: "Classes & studio" },
] as const;
export function Header() {
  const { count } = useCart();
  const { toggle } = useCartUI();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => setOpen(false), [pathname]);
  return (
    <>
      <a className="haven-skip" href="#main-content">
        Skip to content
      </a>
      <div className="haven-announcement">
        <span>Veteran owned. Community at heart.</span>
        <Link to="/studio">
          A new chapter in making is coming <ArrowUpRight size={13} />
        </Link>
      </div>
      <header className="haven-header">
        <div className="haven-shell haven-header-inner">
          <Link to="/" aria-label="My DIY Haven home" className="haven-logo">
            <img
              src="/images/my-diy-haven-color-wordmark.png"
              alt="My DIY Haven"
              width="940"
              height="384"
            />
          </Link>
          <nav aria-label="Main navigation" className="haven-desktop-nav">
            {navigation.map((item) => (
              <Link key={item.to} to={item.to} activeProps={{ className: "is-active" }}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="haven-header-actions">
            <button className="haven-icon-button" onClick={toggle} aria-label="Open cart">
              <ShoppingBag size={21} />
              {count > 0 && <span className="haven-cart-count">{count}</span>}
            </button>
            <button
              className="haven-icon-button haven-menu-toggle"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="haven-mobile-nav"
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }}
          >
            {navigation.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
                {item.label}
                <ArrowUpRight size={18} />
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
