# My DIY Haven — Headless E-Commerce Storefront

This storefront is built with TanStack Start, React 19, and Tailwind CSS v4. It runs as a fast, custom headless e-commerce store integrated with sub-account secrets.

## API Integration & Secrets Setup

The following secrets are configured in this environment and used by server functions (`src/lib/ghl.server.ts` & `src/lib/ghl.functions.ts`):

- `GHL_LOCATION_ID`: Sub-account identifier (`MSmQrVKlTBkzE6chWWis`).
- `GHL_PIT`: Private Integration Token (PIT) Bearer token used for authenticated backend calls.

> **Security Note:** Secrets are accessible only inside server execution boundaries (`createServerFn` / server routes via `process.env`). They are never bundled into client-side code.

### Granted Scopes & Headless Storefront Architecture Assessment

Your Private Integration Token (PIT) has been granted the following scope set:

| Scope | Permission Key | Role in Storefront | Status / Assessment |
|---|---|---|---|
| **View Products** | `products.readonly` | Read live product catalog, titles, descriptions, media, variants | **Essential** — powers product grids, catalog search, and detail views |
| **View Product Prices** | `products/prices.readonly` | Fetch prices, currencies, recurring/one-time pricing | **Essential** — required to display live, accurate pricing |
| **View Product Collections** | `products/collection.readonly` | Fetch collections / categories to build navigation, filters, badges | **Essential** — powers storefront collection tabs & category pages |
| **View Store Settings** | `store/setting.readonly` | Fetch currency, store policies, tax rules, and general config | **Recommended** — ensures storefront rules match account config |
| **View Shipping** | `store/shipping.readonly` | Calculate real shipping rates, zones, and methods | **Recommended** — provides dynamic shipping rates at checkout |
| **View Payment Orders** | `payments/orders.readonly` | Read customer order status, order history, and receipts | **Essential** — powers order tracking and confirmation lookups |
| **Edit Payment Orders** | `payments/orders.write` | Create pending orders / line items upon cart checkout | **Essential** — creates the order record before or after payment |
| **Collect Payment for Orders** | `payments/orders.collectPayment` | Complete payments, trigger invoices, charge saved cards | **Essential** — allows direct order payment processing |
| **View Payment Transactions** | `payments/transactions.readonly` | Verify successful transaction status and reference IDs | **Recommended** — post-checkout verification |
| **View Payment Coupons** | `payments/coupons.readonly` | Validate promo codes and discount vouchers in the cart | **Bonus / Recommended** — enables coupon code input in cart/checkout |
| **View Custom Payment Providers** | `payments/custom-provider.readonly` | Inspect connected gateway configuration | Optional / Informational |
| **View Custom Payment Integrations** | `payments/integration.readonly` | Inspect connected integrations | Optional / Informational |

### Additional Recommended Scopes for Growth:
- `contacts.readonly` and `contacts.write`: To associate orders with contacts, capture customer profiles, and trigger post-purchase nurture automations.

---

## Storefront Routes & Features

- `/` — Homepage with Hero, Trust badges, Collection spotlight, and Story.
- `/products` — Full Catalog with Search, Category Pills, and Price/Rating Sorting.
- `/products/$slug` — Individual Product Detail Page with image gallery, quantity selector, badges, and related items.
- `/collections` — Collections Directory displaying curated series (Tableware, Textiles, Decor, Kitchen).
- `/collections/$slug` — Dedicated Collection Page with filtered products.
- `/checkout` — Headless order checkout flow connecting to server order creation.
- `/order-confirmation` — Order confirmation page displaying unique order reference IDs.

## Development

```sh
bun install
bun run dev
```
