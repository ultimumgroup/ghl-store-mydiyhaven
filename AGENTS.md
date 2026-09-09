<!-- VIBE:BEGIN -->
> [!IMPORTANT]
> This project is connected to AI Studio. Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on AI Studio's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to AI Studio and show up in
> the editor, so keep the branch in a working state.
<!-- VIBE:END -->

# Agent Guide — My DIY Haven Storefront

A headless e-commerce storefront (TanStack Start + React 19 + Tailwind v4) backed by a sub-account e-commerce API via a Private Integration Token (PIT).

## Architecture at a glance

```
src/lib/
  catalog.ts              # Client-safe types + demo fallback catalog + price helpers
  catalog-query.ts        # TanStack Query options (catalog / product)
  ghl.server.ts           # Server-only: fetch products, collections, prices, promo, orders
  ghl.functions.ts        # createServerFn RPC wrappers (thin — import these from client code)
  diagnostics.server.ts   # Server-only: runDiagnostics() health report
  diagnostics.functions.ts# createServerFn wrapper for diagnostics
  cart-context.tsx        # Cart state + cookie persistence (mdh_cart)
  promo-context.tsx       # Applied promo + cookie persistence (mdh_promo)
  cart-ui.tsx             # Cart drawer open/close state
  cookies.ts              # Browser-safe cookie read/write/delete + JSON helpers
  brand.ts                # BRAND_NAME, LOGO_URL, ORDER_PREFIX, DEFAULT_LOCATION_ID
src/components/store/     # Header, Footer, CartDrawer, ProductCard, PromoCodeInput, etc.
src/routes/               # File-based routes (home, products, collections, checkout, confirmation, diagnostics)
```

## Server-function rules (critical)

- `*.functions.ts` files are **thin wrappers** — only `createServerFn` declarations + imports. No sibling helpers/constants; those go in `*.server.ts` and are imported. (See `tanstack-serverfn-splitting`.)
- Read secrets (`process.env.GHL_PIT`, `process.env.GHL_LOCATION_ID`) **inside `.handler()`**, never at module scope.
- Never import `*.server.ts` directly from routes/components — import the `*.functions.ts` wrapper.
- Client code calls server functions via `useServerFn(...)` in event handlers, or directly in query options.

## Secrets

- `GHL_LOCATION_ID` — sub-account location ID.
- `GHL_PIT` — Private Integration Token (Bearer). Granted scopes documented in README.md.

## Diagnostic tooling (use & extend this)

The store ships read-only diagnostics. **Use these before debugging catalog/pricing issues.**

1. **`/store-diagnostics`** (`src/routes/store-diagnostics.tsx`) — noindex page rendering a live health report:
   - Secret presence (no values leaked), catalog live/fallback status, product/collection/priced-product/variant counts, a sample product, and a live promo validation probe.
   - Click "Refresh" to re-run; `staleTime: 0`.
2. **`getStoreDiagnostics()`** (`src/lib/diagnostics.functions.ts`) — same report via TanStack RPC for programmatic use.
3. **`getCatalogStatus()`** (`src/lib/ghl.functions.ts`) — lightweight `{ live, error, productCount, collectionCount }`.

> **Note:** This template's `@tanstack/react-start` version does **not** export `createAPIFileRoute`, so raw HTTP `/api/*` routes are not supported. Use a page route + `createServerFn` (as `/store-diagnostics` does) for diagnostic endpoints.

### Extending diagnostics
Add new checks to `runDiagnostics()` in `src/lib/diagnostics.server.ts`. Keep them read-only (no mutations). Both the diagnostics page and the server function call `runDiagnostics()`, so a single addition surfaces in both.

### When prices show as $0 / "Price on request"
1. Hit `/api/store-diagnostics` → check `catalog.pricedProductCount`.
2. If 0: the `/payments/prices` endpoint returned empty for this location. Prices must be set in the store admin, OR add entries to `PRICE_OVERRIDES` in `src/lib/catalog.ts` (`{ "productId": 49.99 }`).
3. If > 0 but a specific product is unpriced: that product has no price record. Add an override or set a price in admin.

## Cart & checkout persistence

- Cart state persists in the `mdh_cart` cookie (1-year, SameSite=Lax). Restored on mount post-hydration; written on every change.
- Applied promo persists in `mdh_promo` cookie. Cleared on successful order completion.
- Cookie helpers in `src/lib/cookies.ts` are browser-safe (guard `document`).
- **Hydration rule:** cookie restore happens in `useEffect` (post-hydration) to avoid SSR mismatches. Do not read cookies in render or `useState` initializers.

## Checkout & payment flow

`CartDrawer` → `/checkout` → `placeStoreOrder` (server fn) → `POST /payments/orders` → `POST /payments/orders/:orderId/record-payment` (via `payments/orders.collectPayment` scope) → `/order-confirmation?orderId=…`.

- On success: cart + promo cleared, redirect to confirmation.
- Payment is recorded with the order amount, card type, last4, and timestamp.
- On failure: error toast, **cart preserved** for retry. Server fn returns `{ success: false, error }`.

## Pricing display rules (`src/lib/catalog.ts`)

- `displayPrice(product)` → `{ amount, startingAt }`:
  - No variants: product price (or `undefined` if unpriced).
  - All variants same price: that price, `startingAt: false`.
  - Variants differ: minimum price, `startingAt: true` ("from $X").
- `priceAvailable(product)` — true if product or any variant has a real price.
- Compare-at price → strikethrough + "Sale" badge when `compareAtPrice > price`.

## Conventions

- Semantic design tokens from `src/styles.css` (oklch). No raw color classes in components.
- `BRAND_NAME` from `src/lib/brand.ts` — single source of truth for the business name.
- Demo catalog (`demoProducts()`) is the fallback when the API is unreachable; `catalog.live` flag distinguishes live vs demo.
