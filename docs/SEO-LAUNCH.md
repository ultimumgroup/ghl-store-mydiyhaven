# Search and AI visibility: storefront launch notes

September 8, 2026. This pass keeps the AI Studio-compatible TanStack Start stack. The shared Next.js starter was reviewed for its metadata, entity, server-rendering and generated-content conventions; its framework-specific implementation was not copied.

## Implemented in catalog routes

- Catalog and collection copy now reflects the real business: pen blanks, pens, apparel, signs and creative projects. Removed claims that the full catalog consists of handcrafted ceramics or small-batch natural materials.
- Product and collection detail titles, descriptions, social images and canonical URLs derive from loader data, available during server rendering. They use the real product name instead of a URL slug. Missing records continue to throw TanStack `notFound()`.
- Canonicals use the intended production domain, `https://mydiyhaven.com`. Product and collection ID aliases canonicalize to the actual record slug. Catalog paths are `/products` and `/collections`.
- Product JSON-LD describes real visible names, descriptions, categories and images. `<` is escaped in serialized JSON so product text cannot terminate the script element. No invented reviews, manufacturer identity, SKU, GTIN, shipping policy or return policy is emitted.
- Offers are deliberately deferred while payment is unavailable. This basic Product entity does not claim eligibility for Google merchant listings or product rich results. When a verified purchasing path exists, use actual positive USD price records, not client totals. An AggregateOffer should use the minimum and maximum **available** variants and their count; an all-sold-out product needs an explicit unavailable treatment. Match the visible variant-price presentation, currency and stock state, and do not invent a price-valid-until date.
- Removed the Highest Rated sorting option because the provider does not supply reviews. Price sorting now uses the same lowest-available-variant calculation as product cards.
- Collection membership is based on explicit provider-derived IDs rather than category substring guesses.

## Launch checks and next work

1. Set the production origin and verify every canonical resolves there after the domain cutover. Keep staging deployments unindexed using deployment-level controls; production canonicals alone do not prevent staging indexing.
2. Run JavaScript-disabled checks on home, about, studio, product and collection routes. Verify the response contains the visible heading, copy and product facts. Also verify title, description, canonical and JSON-LD in the initial HTML. Test direct navigation to missing product and collection slugs for actual HTTP 404 responses, not just a visual error.
3. Generate the sitemap from the same published catalog used by the storefront. Include real pages and current product/collection slugs; exclude checkout, confirmation, diagnostics and nonexistent future event pages. Do not fabricate last-modified dates on every request. Keep cart/checkout/diagnostics noindex.
4. Compare the Shopify export's old URLs against the new catalog slugs and implement explicit permanent redirects where they differ. A Shopify-to-GHL import does not establish URL parity or prove every image/description migrated intact. Preserve search equity with an actual mapping, including old collection paths and indexed policy pages.
5. Confirm the exact public address, phone, business hours and social profiles with Larry before expanding LocalBusiness fields. Office location is not evidence that walk-ins are welcome at all hours. Upcoming classes and open studio should remain “coming soon”; add Event schema only when actual dates, location, booking status and prices exist.
6. Keep Larry's veteran identity and personal story attributed to him. “Healing Through Creativity” is the brand mission, not a guarantee of treatment outcomes. Avoid invented certifications, testimonials, clinical claims or a nonprofit designation.
7. Once payment works, verify rich-result eligibility and actual live markup with the relevant search-engine validators. Structured data is descriptive; it does not guarantee enhanced results or AI citations.
8. Confirm accessible form/selector labels, keyboard navigation, image dimensions, meaningful alternatives and mobile layout. Optimize catalog image sizes and cold server-rendering latency: a crawler cannot benefit from content that times out.

## What to carry forward from the shared starter

The useful convention is one factual content source feeding visible copy, route metadata, schema and any generated machine-readable summaries. Request-local query hydration must stay intact so SSR and interactive data agree. Keep schema in server HTML. For an eventual reusable store starter, centralize the origin, business entity ID and route metadata builders rather than duplicating per-client constants.

The shared starter's JSON-LD component serializes without escaping `<`; this repo's product serializer hardens that boundary. Its checked-in robots file contains example-domain placeholders, so it must not be copied verbatim. `llms.txt` and generated Markdown can be useful optional representations, but they are not a substitute for crawlable pages and must not drift from the content customers see. No special AI-only promises or hidden keyword copy are needed.

## Validation in this change

`npm run typecheck`, `npm test` and `npm run build` passed after these route changes. A direct HTTP check (without JavaScript execution) returned catalog HTML with a canonical and product links; a live product returned its actual product-name title, canonical and JSON-LD. Deliberately missing product and collection URLs both returned HTTP 404. The integrated browser pass is recorded with the broader site changes; the launch checklist above includes additional production checks.
