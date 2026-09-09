# Catalog performance

Measured September 9, 2026 against the configured GHL location using read-only requests. This report measures adapter execution from the local machine, not GHL AI Studio hosting or browser Core Web Vitals.

## Collections cold load

| Measurement | Previous implementation | Scoped implementation |
| --- | ---: | ---: |
| Elapsed adapter time | 28.94 seconds | 2.47 seconds |
| GHL requests | 193 | 16 |
| Price requests | 177 | 0 |
| Named collections | 13 | 13 |

Each measurement ran in a fresh process with an empty memory cache. One run per implementation; these are observations, not percentile guarantees. The baseline source was the pre-change Git HEAD, `3a0cf1a`. All collection counts matched: 3, 4, 2, 23, 25, 15, 2, 2, 12, 13, 20, 36, 1.

The old directory awaited the full catalog and all 177 products' price lists. The request spacing alone added roughly 29 seconds across 193 reads. Six concurrent requests cannot eliminate a deliberate 150 ms interval between starts.

The directory now renders collection cards with images, descriptions and accurate item counts. Product previews appear on the individual collection pages. This removes the need to retrieve variants on the directory route.

## Request behavior

- Product and collection metadata, including collection-filtered membership reads, share a five-minute memory cache and in-flight request.
- Prices have a separate five-minute cache with coalesced concurrent reads. Keys include the configured location and credential; neither is returned to clients or logs.
- A collection detail loads only its members' prices.
- A product detail loads that product and up to four related products.
- The home preview resolves four products.
- Saved carts resolve only their selected products, with the same validated 20-line input limit and stock-aware restoration.
- Quotes bypass the price cache and reread authoritative prices/stock. Nothing reserves stock or creates orders.

The same GHL pagination, read-only credentials, retry rules, rate spacing and product-publication filter remain in use. No database or catalog synchronization service was added.

## Remaining limits and hosted follow-up

The all-products page and public diagnostics still resolve the entire catalog, so their first cold load can remain slow. All-products search/filtering currently operates on that full result. The next useful change is server-side filtering and pagination, with only the visible page's prices resolved. Large individual collections can also benefit from pagination.

The metadata index still retrieves membership for every collection; 16 calls for this catalog. Caching is per warm process. Separate serverless instances can repeat those reads, and the throttle is also process-local. This is not a distributed rate limiter. GHL hosting's cold start, API region, cache lifetime, and account-wide concurrency need measurement at the deployed URL before a hosting-specific conclusion.

Do not cache cart quotes as public responses or place private integration credentials in a browser or public CDN configuration. For future scale, a shared short-lived catalog cache could reduce cold-start duplication while GHL remains the source of truth; it need not be a second product database.

## Validation

Contract tests cover zero-price directory loads, unchanged counts, per-collection reads, warm price reuse, selected-cart reads, featured/related products, missing products/collections, and the existing pricing/stock/payment guards. Browser tests cover the collection directory and details on desktop/mobile, server-rendered content with JavaScript disabled, navigation, a real 404, and existing cart restoration and brand pages.

Run `npm run typecheck`, `npm test`, `npm run build`, and the browser scripts in `tests/` against a fresh local dev server. AI Studio needs this revision imported and rebuilt before the hosted site benefits.

Validation result: SHIP for this read-only catalog performance change. Typecheck, contract tests, production build, collection browser tests, cart/product browser smoke tests, and brand browser tests passed locally. Full lint completed with zero errors and 11 existing warnings. Hosted deployment timing remains unverified; paid checkout remains outside this release.
