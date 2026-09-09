import { createServerFn } from "@tanstack/react-start";
import {
  fetchCatalogServer,
  fetchProductServer,
  validatePromoCodeServer,
  createGHLOrderServer,
  quoteCartServer,
} from "./ghl.server";
import { slugSchema, promoSchema, cartLinesSchema } from "./store-schemas";
export const getCatalogStatus = createServerFn({ method: "GET" }).handler(async () => {
  const c = await fetchCatalogServer();
  return { live: c.live, productCount: c.products.length, collectionCount: c.collections.length };
});
export const getCatalog = createServerFn({ method: "GET" }).handler(async () =>
  fetchCatalogServer(),
);
export const getProduct = createServerFn({ method: "GET" })
  .validator((data: unknown) => slugSchema.parse(data))
  .handler(async ({ data }) => fetchProductServer(data.slug));
export const validatePromoCode = createServerFn({ method: "POST" })
  .validator((data: unknown) => promoSchema.parse(data))
  .handler(async ({ data }) => validatePromoCodeServer(data));
export const quoteCart = createServerFn({ method: "POST" })
  .validator((data: unknown) => cartLinesSchema.parse(data))
  .handler(async ({ data }) => quoteCartServer(data));
export const placeStoreOrder = createServerFn({ method: "POST" }).handler(async () =>
  createGHLOrderServer(undefined),
);
