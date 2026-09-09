# Transferring this repair to AI Studio

This local Git repo preserves an initial export baseline, the latest ZIP import, and a separate implementation commit. No remote was configured or pushed. The VIBE history notice is preserved.

Copy the current versions of the changed files together, including new modules:

- `src/lib/ghl.server.ts`, `ghl.functions.ts`, `ghl-catalog.ts`, `store-schemas.ts`
- `src/lib/catalog.ts`, `cart-codec.ts`, `cart-context.tsx`, `cookies.ts`, `promo-context.tsx`, `diagnostics.server.ts`
- `src/components/store/product-card.tsx`, `cart-drawer.tsx`
- `src/routes/products.$slug.tsx`, `checkout.tsx`, `order-confirmation.tsx`, `store-diagnostics.tsx`, `__root.tsx`
- `src/router.tsx`, `vite.config.ts`
- README, AGENTS, docs and scripts/tests for future development; package.json/package-lock.json for the verified npm workflow.

Keep `GHL_LOCATION_ID` and `GHL_PIT` in AI Studio's server secret settings. Do not upload `.env.local`, `.git`, node_modules, local logs or test-results. Rebuild in AI Studio and check `/store-diagnostics`, a collection, a variant product, cart reload and quote. Checkout intentionally says online payment is not available; it must remain so until actual payment processing is integrated and tested.

The previous cart format is intentionally not migrated. A shopper with an old export cookie starts an empty cart; new v2 carts persist. No live customers or deployed storefront were changed during this local pass.

## Brand/page update

Also transfer the complete `public/images/` directory, `public/robots.txt`, `public/sitemap.xml`, `src/styles.css`, the updated header/footer/home-content, and all changed route files including new `about.tsx` and `studio.tsx`. Regenerate the TanStack route tree during build (the local generated tree is included). The local documentation screenshot in `docs/reference/` is not a public asset. Preserve runtime secret settings. See BRAND-AND-PAGES.md for design choices and upcoming-feature boundaries.
