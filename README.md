# My DIY Haven — GHL headless storefront

TanStack Start / React 19 storefront imported from the latest `mydiyhaven.zip`, then repaired locally. GHL remains the sole product, price, collection and inventory authority. No Supabase integration is required for the implemented features. **Customer payment is not yet implemented.** `/checkout` now reviews the cart and requests current prices/stock; it does not place an order or charge a card.

## Brand and pages

The home page, `/about` and `/studio` now introduce Larry’s story and upcoming creative experiences. Supplied brand assets and Larry’s headshot live in `public/images/`; the scope screenshot is in `docs/reference/`. See [brand and page notes](docs/BRAND-AND-PAGES.md), [image credits](docs/IMAGE-SOURCES.md), and [SEO launch notes](docs/SEO-LAUNCH.md). The home story renders independently of catalog API latency.

Regenerate the live catalog sitemap with `python3 scripts/generate-sitemap.py`. Run `/opt/playwright-python/bin/python tests/brand-browser.py` against the local server (or set `MDH_BASE` to another local URL).

## Local development

Node 22.22.1 and the existing shared Playwright installation were used. Dependencies are project-local; no sudo or system package changes were necessary.

```bash
npm ci --ignore-scripts
npm run dev:local
npm run typecheck
npm test
npm run build
/opt/playwright-python/bin/python tests/browser-smoke.py
```

The browser script expects the local server on port 4317. `npm run dev:local` loads the existing `.env.local`. Set `GHL_LOCATION_ID` and `GHL_PIT` in the deployment's server-side secret settings. Never use a `VITE_` prefix for these values. `.env.local` and all `.env.*` files except `.env.example` are ignored. Do not paste credentials into source, screenshots, logs or diagnostic output. The browser only calls server functions; GHL authorization stays on the server.

The original export includes `bun.lock`; `package-lock.json` records the npm dependency resolution verified here. Use npm locally. Recheck the build in AI Studio's own runtime after transferring files.

## PIT scopes

Transcribed from `my-diy-haven-ghl-pit-scope.png` supplied in Downloads. This is evidence of the selected scopes; successful read probes independently verify the catalog/inventory/coupon access used below. No write permission was tested by creating or changing business records.

| Selected scope | Purpose / endpoint family | Current use |
| --- | --- | --- |
| `products.readonly` | Read products, including collection-filtered product lists: `GET /products/` | Verified and used |
| `products/prices.readonly` | Read product price records and inventory: `GET /products/:productId/price`, `GET /products/inventory` | Both verified; runtime uses price stock fields |
| `products/collection.readonly` | Read collections: `GET /products/collections` | Verified and used |
| `store/setting.readonly` | Read store settings | Selected; read probe verified, not yet integrated |
| `store/shipping.readonly` | Read store shipping configuration | Selected; read probe verified, not yet integrated |
| `payments/orders.write` | Order write permissions exposed by GHL | Selected; unused; not proof of a supported create-checkout endpoint |
| `payments/orders.readonly` | Read orders: `/payments/orders` | Selected; unused |
| `payments/orders.collectPayment` | Record a manual payment: `POST /payments/orders/:orderId/record-payment` | Selected; deliberately unused; does not tokenize or charge a customer's card |
| `payments/transactions.readonly` | Read payment transactions | Selected; unused |
| `payments/coupons.readonly` | Read coupons: `GET /payments/coupon/list` | Verified; no coupons configured at inspection |
| `payments/custom-provider.readonly` | Read custom payment provider configuration | Selected; unused; not provider registration/charging permission |
| `payments/integration.readonly` | Read payment integration configuration | Selected; unused |

No additional scopes are needed for the catalog/cart fixes. Contacts and invoice scopes are **not shown**; an invoice-based payment design would require confirming those permissions and the workflow before implementation.

## Verified repairs

On September 8, 2026 (America/Chicago), read-only integration checks loaded **177 priced products, 3,268 real price variants, 144 unavailable variants, and 13 named collections**. Two upstream Default collections are excluded. Counts can change in GHL.

- Prices come from each product's `/price` endpoint, not `/payments/prices`. The observed USD amounts are dollars (9 means $9); no magnitude-based conversion or manual override is used. `hasPrices:false` is not a reliable availability flag in this imported catalog.
- Variant identifiers are actual price IDs. Labels map option IDs to option names. Product cards show the lowest available variant price. Stock follows `trackInventory`, `availableQuantity` and `allowOutOfStockPurchases`.
- Imported products omitted collection membership. Collection-filtered product reads supply membership and counts without modifying GHL.
- Pagination, bounded read concurrency, retry on throttling/server errors, and a five-minute warm-process cache reduce repeated API work. No demo catalog silently replaces a failed connection.
- Cart cookies contain only product ID, price ID and quantity, with 30-day expiry, SameSite=Lax and Secure on HTTPS. They are limited to 20 lines and 3,500 encoded bytes. Old export cookies are not migrated. Restoration resolves current catalog data and clamps stock. Failed restoration preserves the saved cookie for retry.
- Quotes reread price/stock records and calculate the subtotal on the server. Client prices are never authoritative. Quotes do not reserve inventory, calculate taxes/shipping, redeem coupons, or create orders.
- Removed fake payment confirmation, fabricated discount acceptance, unsupported shipping amounts/free-shipping thresholds, and invented review ratings. Mounted toast UI and fixed React deduplication/query hydration.

## Checkout follow-up

The local v3 Toolkit audit found a stronger candidate: `POST /invoices/text2pay` can stage product/price/quantity lines and returns `invoiceUrl`. Read [checkout options](docs/CHECKOUT-OPTIONS.md) for the draft/manual-publication experiment, abandoned-cart storage choices and Stripe fallback. Invoice permissions are missing; payability, inventory and native order behavior remain unverified. New v3 GET probes succeeded for store settings and shipping, but this location returned **zero shipping zones**.

## Diagnostics and next steps

`/store-diagnostics` exposes public catalog counts and checkout status, with noindex metadata. Python scripts under `scripts/` perform read-only API probes without displaying the credentials. Do not expand these into public order/customer-data endpoints.

See [assessment](docs/ASSESSMENT.md), [testing plan](docs/TEST-PLAN.md), and [AI Studio transfer notes](docs/AI-STUDIO-TRANSFER.md). This is a working catalog/cart development build, **not a launch-ready paid checkout**.
