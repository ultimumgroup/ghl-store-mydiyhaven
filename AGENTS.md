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

# Agent guide

Read README.md and docs/ASSESSMENT.md for verified behavior and limits.

- Preserve `.env.local`; never print or commit either credential. Read configuration inside server execution, never expose it through RPC or client-prefixed environment variables.
- `*.functions.ts` contains thin createServerFn wrappers and imports only. Put schemas in store-schemas.ts, pure mapping in ghl-catalog.ts, and provider requests in ghl.server.ts. Components import RPC wrappers, not server modules.
- Current provider adapter performs GET requests only. Payment recording is manual accounting, not charging a card. Do not re-enable the old export's order/payment path or fake confirmation.
- Prices use `/products/:productId/price`; preserve verified USD amounts. Never use `hasPrices` to skip reads, fabricated overrides, demo fallback, synthetic price IDs, invented discounts or reviews.
- Collection-filtered product reads recover imported membership. Respect pagination and stock/oversell fields.
- Cart cookie v2 stores only IDs and quantity, expires in 30 days and stays within 3,500 encoded bytes. Restore after hydration, validate against catalog, preserve cookie on failed restore. Never trust client totals.
- Public diagnostics contain catalog counts only. Never add order/customer data or raw provider responses.
- Preserve request-local query hydration and the vendor Vite config. React deduplication is required by the tested development configuration.
- Run `npm run typecheck`, `npm test`, `npm run build`; run the shared Playwright script for interactive changes. No live payment/order writes in automated tests.
