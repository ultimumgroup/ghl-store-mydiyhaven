# Import the catalog performance revision

Use the latest code revision containing `src/lib/version.ts` version `0.1.1`. The earlier changed-files ZIP and manifest were pinned before this revision and will not transfer this fix.

Paste this into AI Studio after making the revision available through GitHub or attaching the changed source files:

> Update this project from the repository's catalog-performance revision (version 0.1.1). Copy the complete current files for src/lib/ghl.server.ts, src/lib/ghl.functions.ts, src/lib/catalog-query.ts, src/lib/cart-context.tsx, src/lib/version.ts, src/components/store/home-content.tsx, src/routes/collections.index.tsx and src/routes/collections.$slug.tsx. Preserve the existing server secrets GHL_LOCATION_ID and GHL_PIT. These files must move together because they introduce scoped server functions. Keep the existing TanStack/Vite stack and payment-disabled behavior. Build and verify Collections, a collection detail, a product and saved-cart reload. Collections should be a directory of collection cards with accurate counts, without requesting every product's variants. Do not replace these functions with a full getCatalog call. Report build results and any files you could not import before publishing.

After import, measure a fresh direct visit to `/collections` and a warm repeat; test a collection detail, product options, and cart reload on mobile. Check `/collections/nonexistent-contract-fixture` returns a real 404. No order/payment/customer writes are needed for this validation.

GHL's build agents may regenerate route and runtime files. Inspect any changes rather than forcing old generated output into a newer runtime. No dependency update is required for this revision.
