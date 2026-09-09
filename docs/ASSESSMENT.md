# GHL-only feasibility and implementation assessment

September 8, 2026. Evidence: downloaded source, the supplied scope screenshot, live GET requests using the existing local integration, official API documentation, local contract tests and browser checks. No orders, contacts, payments, inventory or other business records were written.

> Follow-up: the local v3 Toolkit audit found `POST /invoices/text2pay` with a returned `invoiceUrl` and draft/update support. See [checkout options and experiment](CHECKOUT-OPTIONS.md); it supersedes the ordering of payment investigation below. Payment remains disabled pending validation.

## Decision

Keep GHL as the ground truth and continue with this storefront before extracting an `ultimum-store-starter`. Products, variants, stock display, collections and a persistent anonymous cart work without another database. A GHL-only paid store remains a reasonable direction, but the exact supported payment handoff is unresolved. Adding Supabase would not turn a manual payment-recording endpoint into a payment processor.

The source export's checkout accepted card metadata/client totals, attempted to create an order, and recorded payment. HighLevel documents [Record Order Payment](https://marketplace.gohighlevel.com/docs/ghl/payments/record-order-payment/index.html) as updating an order to Paid using a manual payment mode. That operation provides no evidence that money moved. The public Orders reference reviewed lists order reads and manual payment recording; we did not establish a supported arbitrary-cart create-order-and-charge API. This is a limitation of the verified integration, not a claim that every GHL payment path is impossible.

The implementation therefore retains `/checkout` as cart review with a fresh server quote. It collects no card details, makes no payment writes and shows no fabricated confirmation. The legacy order RPC explicitly returns failure for old clients.

## What is established

| Capability | Evidence and status |
| --- | --- |
| Catalog and options | 177 products, 3,268 price IDs normalized successfully |
| Pricing | All 177 products priced; observed amounts preserved as USD major units |
| Inventory | Price-level stock/oversell fields applied; 144 variants unavailable at inspection |
| Collections | 13 named collections; membership recovered by product filter |
| Cart | Compact browser cookie, restoration against catalog, quantity limits, retry on restore failure |
| Quotes | Fresh price reads, server subtotal, stock checks, input validation; no reservation |
| Discounts | Coupon read works; location returned none. Full eligibility/redemption is not implemented |
| Payments / shipping / tax | Not implemented; selected scopes alone do not establish runtime support |
| Accounts / order history | Not implemented. Never expose orders based only on a browser-supplied contact ID |

The [product-price API](https://marketplace.gohighlevel.com/docs/ghl/products/list-prices-for-product/index.html) supplies price records and option IDs. [List Products](https://marketplace.gohighlevel.com/docs/ghl/products/list-invoices/index.html) documents collection filtering. Live reads succeeded with version header `2021-07-28`; newer documentation renders v3. Pin and contract-test a version migration separately rather than changing request semantics during these repairs.

## Next payment investigation

1. Create a controlled GHL native-store test checkout and inspect its supported integration surface. Establish whether a documented handoff preserves multiple products, exact price IDs, quantities and coupons. Do not base a resellable starter on private internal checkout endpoints without vendor support.
2. Validate hosted checkout behavior in test mode: tax, shipping zones, variant identity, stock reduction, overselling, cancellation, payment failure, refunds and duplicate submission. Reconcile a completed payment to the authoritative order/transaction before clearing a cart or showing confirmation.
3. If arbitrary-cart handoff is unavailable, evaluate [invoice creation](https://marketplace.gohighlevel.com/docs/ghl/invoices/create-invoice/index.html) and a hosted invoice payment link. This needs additional permissions, contact handling, durable idempotency and an explicit decision about invoice versus native-store order semantics. It is a candidate, not a implemented equivalent.
4. If neither covers the requirements, introduce a small checkout service/payment provider. Use GHL's supported writes and reconciliation; add a database only for durable state that GHL cannot represent. Payment operations need idempotency and verified callbacks; a stateless process alone is insufficient.

## Performance and remaining engineering work

A cold catalog fetch performs a product-price request for every product plus collection membership reads. At this catalog size, cold loads can take tens of seconds. The current bounded concurrency and five-minute in-memory cache help warm traffic but do not survive serverless restarts or coordinate multiple instances. Measure AI Studio's execution timeout before deployment. Improve by loading collection/product details on demand, keeping a derived shared cache, or using supported product/price-change webhooks. A cache is not a second catalog authority and need not imply Supabase.

The adapter intentionally supports positive one-time USD prices only. Free items, recurring prices, other currencies and unusual availability statuses require explicit contracts. Browsing stock may be five minutes old; quotes reread stock but do not reserve it. Product publication is checked against the cached catalog. Future checkout must recheck all authoritative state and aggregate/reserve inventory atomically where supported.

Cart persistence is browser-local, not cross-device or an abandoned-cart CRM workflow. Old export cookies are ignored because their synthetic IDs do not reliably identify live price records. The cookie capacity is deliberately bounded. Blocked-cookie and expired-price scenarios have clear errors but should receive additional browser coverage. Coupon eligibility, shipping and tax are not simulated.

## SSR, SEO/GEO and starter direction

The app uses TanStack Start rather than the shared Next.js starter. Port conventions, not framework-specific code. Product data should remain available in server HTML, with request-local query state hydrated into the browser. React deduplication and query dehydration were repaired here; a JavaScript-disabled product check is part of browser validation.

Before launch, replace generic export metadata with product-derived titles/descriptions, canonical URLs and sitemap entries; audit robots rules and status codes for missing products. Add Product/Offer structured data only from real visible price, currency and availability, never invented reviews. Ensure variant selection, structured offers and canonical strategy agree. Cart/checkout/diagnostics/confirmation should remain noindex. Confirm product text and policy pages, accessible variant labels, actual business identity/contact information, and media alternatives. SEO/GEO gains come from clear crawlable product facts and consistent authoritative content, not special AI-only markup.

This pass has not integrated the shared starter's GHL external tracking/form wiring. Audit consent/session attribution and server-side purchase events once real payment confirmation exists; never emit a purchase event on merely reaching a confirmation route. Store-owner login, customizer uploads, proof approvals, artwork storage, AI usage billing and cross-device projects are later features likely to justify a separate persistence/auth layer. A Marketplace app also requires tenant isolation, OAuth lifecycle and scoped admin authorization; a single-location PIT development build is not that product yet.

Keep this repo as the concrete reference store. Extract the starter once a supported payment route and production caching strategy are proven; isolate the GHL adapter, cart codec, quote contract and checkout provider interface for reuse.
