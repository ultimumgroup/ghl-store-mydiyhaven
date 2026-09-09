# Validation and launch plan

## Completed locally

- TypeScript no-emit check and production Vite client/server build.
- Isolated contract tests executing the actual TypeScript mapper, cookie codec and provider adapter: USD amounts (including $1,250), real price IDs, sold-out variants, stock clamping, malformed quantities, compact serialization, concurrent cache coalescing, authoritative subtotal ignoring injected client prices, duplicate lines, overstock rejection, no fake coupon, missing credentials and zero order/payment requests.
- Read-only live API checks: products, paginated prices, collections/filter membership, inventory and empty coupon list.
- Headless Chromium: diagnostics HTTP 200, product option selection, adding to cart, compact cookie shape, reload restoration, successful current-price quote, mobile overflow check at 390px, JavaScript-disabled product title/price rendering and no page errors. Screenshot: ignored `test-results/cart-mobile.png`.

After a production build or dependency change, restart Vite with `npm run dev:local -- --force` to rebuild its dependency cache. An intermediate dev run reproduced an invalid-hook error with stale optimized dependencies; do not treat a passing build alone as browser validation. Avoid editing files while running the browser script because hot reload can detach interactive elements.

Browser test requires `npm run dev:local` on port 4317. Shared Python/Chromium already exist on this machine; no new global installation was needed. Contract tests run without live credentials or network. Browser tests only mutate a temporary browser cart, not GHL records.

## Before production

1. Repeat browser and SSR checks on AI Studio staging, including cold starts and timeout limits. Confirm deployed server secrets and no token in client bundles/network responses.
2. Test all collection routes; compare sampled products/variant prices/inventory with GHL administration. Test stock changing after a cart is saved, removed products, malformed/legacy/blocked cookies and API failures during restore. Confirm clear retry UX and no silent price substitution.
3. Expand contract fixtures for pagination boundaries, repeated pages, 429/5xx retries, missing fields, large option sets, mixed prices and oversell settings. Current tests are targeted regression coverage, not exhaustive provider certification.
4. Select a supported payment integration, then use a test account/provider for shipping, tax, coupons, success/failure, callbacks, idempotency, inventory decrement, refunds and abandonment. Never use production manual-payment writes as a smoke test.
5. Validate every customer-facing policy, shipping promise and contact detail; replace placeholder footer destinations. Complete metadata, sitemap, canonical/structured-data and accessibility review. Test iOS Safari and Android Chrome, keyboard operation and a large variant list.
6. Add production observability without customer data/tokens; monitor cold load latency, rate limits, provider failures and quote errors. Load-test before generalizing into a multi-tenant starter.

No successful paid order, tax/shipping calculation, coupon redemption, deployment, multi-browser certification or production load test is claimed by this pass.
