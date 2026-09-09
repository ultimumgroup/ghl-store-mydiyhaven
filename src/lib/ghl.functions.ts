// Server function RPC wrappers using createServerFn from @tanstack/react-start
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  fetchCatalogServer,
  fetchProductServer,
  createGHLOrderServer,
  validatePromoCodeServer,
} from "./ghl.server";

export const getCatalogStatus = createServerFn({ method: "GET" }).handler(async () => {
  const catalog = await fetchCatalogServer();
  return {
    live: catalog.live,
    error: catalog.error,
    productCount: catalog.products.length,
    collectionCount: catalog.collections.length,
  };
});

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  return await fetchCatalogServer();
});

export const getProduct = createServerFn({ method: "GET" })
  .validator((data) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    return await fetchProductServer(data.slug);
  });

const promoSchema = z.object({
  code: z.string().min(1).max(50),
  subtotal: z.number().min(0),
});

export const validatePromoCode = createServerFn({ method: "POST" })
  .validator((data) => promoSchema.parse(data))
  .handler(async ({ data }) => {
    return await validatePromoCodeServer(data);
  });

const placeOrderSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      price: z.number(),
      name: z.string(),
      variantId: z.string().optional(),
    }),
  ),
  totalAmount: z.number(),
  promoCode: z.string().optional(),
  discountAmount: z.number().optional(),
});

export const placeStoreOrder = createServerFn({ method: "POST" })
  .validator((data) => placeOrderSchema.parse(data))
  .handler(async ({ data }) => {
    return await createGHLOrderServer(data);
  });
