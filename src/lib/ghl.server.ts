// GHL is the sole catalog authority. This module performs GETs only.
import type { CatalogResult, ProductResult } from "./catalog";
import {
  normalizeProduct,
  type RawProduct,
  type RawPrice,
  type RawCollection,
} from "./ghl-catalog";
const BASE = "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
let nextRequestAt = 0;
function config() {
  const pit = process.env["GHL_PIT"];
  const location = process.env["GHL_LOCATION_ID"];
  if (!pit || !location) throw new Error("Store connection is not configured.");
  return { pit, location };
}
async function get(
  path: string,
  query: Record<string, string> = {},
): Promise<Record<string, unknown>> {
  const { pit } = config();
  // Keep a single warm isolate below the documented burst budget; no shared DB needed.
  const wait = Math.max(0, nextRequestAt - Date.now());
  nextRequestAt = Math.max(nextRequestAt, Date.now()) + 150;
  await delay(wait);
  for (let attempt = 0; attempt < 3; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${BASE}${path}?${new URLSearchParams(query)}`, {
        headers: {
          Authorization: `Bearer ${pit}`,
          Version: VERSION,
          Accept: "application/json",
          "User-Agent": "MyDIYHaven-Store/1.0",
        },
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new Error("Store data is temporarily unreachable. Please retry.");
    }
    if ((res.status === 429 || res.status >= 500) && attempt < 2) {
      await delay(
        Math.min(10000, Math.max(1000, Number(res.headers.get("retry-after") || 0) * 1000)) *
          (attempt + 1),
      );
      continue;
    }
    // No raw provider errors, URLs or credentials go to logs/RPC responses.
    if (!res.ok) throw new Error(`Store data request failed (HTTP ${res.status}).`);
    const body: unknown = await res.json();
    if (!body || typeof body !== "object") throw new Error("Unexpected store data response.");
    return body as Record<string, unknown>;
  }
  throw new Error("Store data is temporarily busy.");
}
function totalOf(body: Record<string, unknown>): number | undefined {
  let t = body["total"] ?? body["totalCount"];
  if (Array.isArray(t)) t = t[0];
  if (t && typeof t === "object") t = (t as Record<string, unknown>)["total"];
  return typeof t === "number" ? t : undefined;
}
async function list<T>(path: string, query: Record<string, string>, key: string): Promise<T[]> {
  const out: T[] = [];
  const seen = new Set<string>();
  for (let offset = 0; offset < 10000; offset += 100) {
    const body = await get(path, { ...query, limit: "100", offset: String(offset) });
    const page = body[key];
    if (!Array.isArray(page)) throw new Error("Unexpected store list response.");
    for (const item of page) {
      const id = String(item?._id ?? "");
      if (!id || seen.has(id)) throw new Error("Invalid or repeated store page.");
      seen.add(id);
      out.push(item as T);
    }
    const total = totalOf(body);
    if (page.length < 100 || (total != null && out.length >= total)) return out;
  }
  throw new Error("Catalog exceeds this storefront pagination limit.");
}
async function mapLimit<T, R>(items: T[], work: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(6, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await work(items[i]!);
      }
    }),
  );
  return out;
}
async function pricesFor(id: string) {
  const { location } = config();
  return list<RawPrice>(
    `/products/${encodeURIComponent(id)}/price`,
    { locationId: location },
    "prices",
  );
}
// Separate the product index from prices: directory requests never load variants.
function memo<T>(work: () => Promise<T>) {
  let cache: { key: string; expires: number; value: T } | undefined;
  let pending: { key: string; promise: Promise<T> } | undefined;
  return async (): Promise<T> => {
    const { pit, location } = config();
    const key = location + pit;
    if (cache?.key === key && cache.expires > Date.now()) return cache.value;
    if (pending?.key === key) return pending.promise;
    const promise = work().then((value) => {
      cache = { key, value, expires: Date.now() + 300000 };
      return value;
    });
    const entry = { key, promise };
    pending = entry;
    try {
      return await promise;
    } finally {
      if (pending === entry) pending = undefined;
    }
  };
}
async function loadIndex() {
  const { location } = config();
  const [raw, cols] = await Promise.all([
    list<RawProduct>("/products/", { locationId: location }, "products"),
    list<RawCollection>("/products/collections", { altId: location, altType: "location" }, "data"),
  ]);
  const published = raw.filter(
    (p) => p.availableInStore === true && (!p.status || p.status === "active"),
  );
  const collections = cols
    .filter((c) => c.name !== "Default")
    .map((c) => ({
      id: c._id,
      slug: c.slug || c._id,
      name: c.name,
      description: c.seo?.description || "",
      image: c.image || "",
      itemCount: 0,
    }));
  // Imported Shopify products omit collectionIds. The documented collection filter
  // supplies membership without copying/mutating GHL records.
  const memberships = new Map<string, string[]>();
  await mapLimit(collections, async (c) => {
    const members = await list<RawProduct>(
      "/products/",
      { locationId: location, collectionIds: c.id },
      "products",
    );
    const visible = new Set(published.map((p) => p._id));
    for (const p of members) {
      if (!visible.has(p._id)) continue;
      memberships.set(p._id, [...(memberships.get(p._id) || []), c.id]);
      c.itemCount++;
    }
  });
  const products = published.map((p) => ({
    ...p,
    collectionIds: [...new Set([...(p.collectionIds || []), ...(memberships.get(p._id) || [])])],
  }));
  return { products, collections };
}
const fetchIndex = memo(loadIndex);
// Bounded by the products in the current index; expired entries are discarded.
const priceReaders = new Map<string, { expires: number; read: () => Promise<RawPrice[]> }>();
function cachedPricesFor(id: string) {
  const { location, pit } = config();
  const key = JSON.stringify([location, pit, id]);
  for (const [k, entry] of priceReaders) {
    if (entry.expires <= Date.now()) priceReaders.delete(k);
  }
  let entry = priceReaders.get(key);
  if (!entry) {
    entry = { expires: Date.now() + 300000, read: memo(() => pricesFor(id)) };
    priceReaders.set(key, entry);
  }
  return entry.read();
}
async function resolveProducts(raw: RawProduct[], collections: CatalogResult["collections"]) {
  return mapLimit(raw, async (p) =>
    normalizeProduct(p, await cachedPricesFor(p._id), p.collectionIds || [], collections),
  );
}
export async function fetchCollectionsServer() {
  const index = await fetchIndex();
  return { collections: index.collections, live: true as const };
}
export async function fetchCollectionServer(slug: string): Promise<CatalogResult> {
  const index = await fetchIndex();
  const collection = index.collections.find((c) => c.slug === slug || c.id === slug);
  if (!collection) return { products: [], collections: [], live: true };
  const members = index.products.filter((p) => p.collectionIds.includes(collection.id));
  return {
    products: await resolveProducts(members, index.collections),
    collections: [collection],
    live: true,
  };
}
export async function fetchCartProductsServer(items: QuoteLineInput[]): Promise<CatalogResult> {
  const index = await fetchIndex();
  const ids = new Set(items.map((i) => i.productId));
  return {
    products: await resolveProducts(
      index.products.filter((p) => ids.has(p._id)),
      index.collections,
    ),
    collections: [],
    live: true,
  };
}
export async function fetchFeaturedServer(): Promise<CatalogResult> {
  const index = await fetchIndex();
  return {
    products: await resolveProducts(index.products.slice(0, 4), index.collections),
    collections: index.collections,
    live: true,
  };
}
export async function fetchCatalogServer(): Promise<CatalogResult> {
  const index = await fetchIndex();
  return {
    products: await resolveProducts(index.products, index.collections),
    collections: index.collections,
    live: true,
  };
}
export async function fetchProductServer(slug: string): Promise<ProductResult> {
  const index = await fetchIndex();
  const raw = index.products.find((p) => p.slug === slug || p._id === slug);
  if (!raw) return { product: null, related: [], live: true };
  const related = index.products
    .filter(
      (p) => p._id !== raw._id && p.collectionIds.some((id) => raw.collectionIds.includes(id)),
    )
    .slice(0, 4);
  const products = await resolveProducts([raw, ...related], index.collections);
  return { product: products[0]!, related: products.slice(1), live: true };
}
export interface PromoValidationResult {
  valid: boolean;
  code?: string;
  type?: "percent" | "fixed";
  value?: number;
  discountAmount?: number;
  label?: string;
  message?: string;
  freeShipping?: boolean;
}
export async function validatePromoCodeServer(input: {
  code: string;
  subtotal: number;
}): Promise<PromoValidationResult> {
  const { location } = config();
  const data = await get("/payments/coupon/list", {
    altId: location,
    altType: "location",
    limit: "100",
    offset: "0",
  });
  const rows = Array.isArray(data["data"]) ? data["data"] : [];
  const exists = rows.some(
    (c) => String(c.code || c.couponCode || "").toUpperCase() === input.code.trim().toUpperCase(),
  );
  // No configured coupons in the verified location. Do not invent eligibility or
  // calculate a discount until a real hosted checkout can redeem it atomically.
  return {
    valid: false,
    message: exists
      ? "This code must be applied at the secure payment checkout."
      : "That code is not available.",
  };
}
export interface QuoteLineInput {
  productId: string;
  variantId: string;
  quantity: number;
}
export async function quoteCartServer(items: QuoteLineInput[]) {
  if (!items.length || items.length > 20) throw new Error("Choose between 1 and 20 cart lines.");
  if (new Set(items.map((i) => `${i.productId}:${i.variantId}`)).size !== items.length)
    throw new Error("Duplicate cart lines are not allowed.");
  const c = await fetchIndex();
  const lines = await mapLimit(items, async (i) => {
    if (!Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 99)
      throw new Error("Invalid quantity.");
    const p = c.products.find((p) => p._id === i.productId);
    if (!p) throw new Error("An item is no longer available.");
    const prices = await pricesFor(p._id);
    const price = prices.find(
      (v) =>
        v._id === i.variantId &&
        !v.deleted &&
        v.type === "one_time" &&
        v.currency.toUpperCase() === "USD",
    );
    if (!price || !Number.isFinite(price.amount) || price.amount <= 0)
      throw new Error("An item price is no longer available.");
    if (
      price.trackInventory &&
      !price.allowOutOfStockPurchases &&
      (price.availableQuantity ?? 0) < i.quantity
    )
      throw new Error(`Requested quantity is unavailable for ${p.name}.`);
    return {
      productId: p._id,
      variantId: price._id,
      name: p.name,
      variantName: price.name || "Standard",
      quantity: i.quantity,
      unitAmount: price.amount,
      lineAmount: (Math.round(price.amount * 100) * i.quantity) / 100,
    };
  });
  return {
    lines,
    subtotal: lines.reduce((s, l) => s + Math.round(l.lineAmount * 100), 0) / 100,
    currency: "USD" as const,
    quotedAt: new Date().toISOString(),
    checkoutAvailable: false as const,
  };
}
// Compatibility guard for old clients still calling the exported RPC.
export async function createGHLOrderServer(_data: unknown) {
  return {
    success: false,
    error: "Online payment is not configured. Your cart has been preserved.",
  };
}
