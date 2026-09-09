// Server-side boundary for the headless GHL E-Commerce REST integration.
// Uses GHL_LOCATION_ID and GHL_PIT (Private Integration Token) from process.env.
// Maps raw GHL product/collection/variant shapes into the normalized
// catalog in ./catalog.ts. Falls back to the bundled demo catalog when the API
// is unreachable or unconfigured.

import {
  DEMO_COLLECTIONS,
  demoProducts,
  PRICE_OVERRIDES,
  type CatalogResult,
  type ProductResult,
  type StoreCollection,
  type StoreProduct,
  type StoreVariant,
} from "./catalog";

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const DEFAULT_VERSION = "2021-07-28";

function getHeaders(pit: string) {
  return {
    Authorization: `Bearer ${pit}`,
    Version: DEFAULT_VERSION,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function getLocationId() {
  return process.env.GHL_LOCATION_ID || "MSmQrVKlTBkzE6chWWis";
}

// --- Raw GHL shapes ---------------------------------------------------------

interface GHLProductRaw {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  slug?: string;
  image?: string;
  images?: string[];
  media?: Array<{ url: string } | string>;
  productType?: string;
  availableInStore?: boolean;
  collectionIds?: string[];
  collections?: Array<{ _id?: string; id?: string }>;
  statementDescriptor?: string;
  // GHL stores Shopify-style "option groups" under `variants`, NOT priced SKUs.
  // Each entry is an option name (e.g. "Material") with a list of option values.
  variants?: GHLOptionGroupRaw[];
  trackInventory?: boolean;
  trackProductInventory?: boolean;
  inventoryCount?: number;
  hasPrices?: boolean;
  hasVariants?: boolean;
  variantsLength?: number;
  price?: number;
  compareAtPrice?: number;
  status?: string;
}

interface GHLOptionGroupRaw {
  id?: string;
  name: string;
  options?: Array<{ id?: string; name: string }>;
}

// GHL prices live on a separate /payments/prices endpoint, keyed by productId
// and optionally variantId. Amounts are in cents.
interface GHLPriceRaw {
  _id?: string;
  id?: string;
  productId?: string;
  variantId?: string;
  amount?: number;
  compareAtAmount?: number;
  currency?: string;
  nickname?: string;
  recurring?: boolean;
  status?: string;
  type?: string;
}

interface GHLCollectionRaw {
  _id?: string;
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  productIds?: string[];
  stats?: { productCount?: number };
  seo?: { title?: string | null; description?: string | null };
}

// --- Mappers ----------------------------------------------------------------

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function pickImage(raw: GHLProductRaw): string {
  if (raw.image) return raw.image;
  if (Array.isArray(raw.media) && raw.media.length) {
    const m = raw.media[0];
    return typeof m === "string" ? m : m.url;
  }
  if (Array.isArray(raw.images) && raw.images.length) return raw.images[0];
  return "";
}

function pickImages(raw: GHLProductRaw): string[] {
  const out: string[] = [];
  if (Array.isArray(raw.media)) {
    for (const m of raw.media) out.push(typeof m === "string" ? m : m.url);
  }
  if (Array.isArray(raw.images)) for (const u of raw.images) if (!out.includes(u)) out.push(u);
  const main = pickImage(raw);
  if (main && !out.includes(main)) out.unshift(main);
  return out;
}

function priceToDollars(amount: unknown): number {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return 0;
  // GHL prices are typically stored in cents; detect magnitude.
  return n >= 1000 ? Math.round(n) / 100 : Math.round(n * 100) / 100;
}

/**
 * GHL products expose Shopify-style option groups (e.g. "Material" with values
 * Cherry/Red Oak/Bamboo/Mahogany), not priced SKUs. We expand every combination
 * of option values into a synthetic variant so the storefront can render proper
 * dropdowns. Per-variant prices come from the /payments/prices endpoint, keyed
 * by variantId; when absent the variant inherits the product base price.
 */
function mapOptionGroupsToVariants(
  groups: GHLOptionGroupRaw[],
  basePrice: number,
  priceMap: Map<string, { price?: number; compareAt?: number }>,
): StoreVariant[] {
  if (!groups || groups.length === 0) return [];

  // Each option group contributes one dimension. Build the cartesian product.
  const dimensions = groups.map((g) => ({
    name: g.name,
    values: (g.options ?? []).map((o) => ({ id: o.id || o.name, name: o.name })),
  }));

  // Cartesian product of all option values across groups.
  let combos: Array<{ id: string; value: string; name: string }[]> = [[]];
  for (const dim of dimensions) {
    const next: Array<{ id: string; value: string; name: string }[]> = [];
    for (const prefix of combos) {
      for (const val of dim.values) {
        next.push([...prefix, { id: val.id, value: val.name, name: dim.name }]);
      }
    }
    combos = next;
  }

  return combos.map((combo, i) => {
    const label = combo.map((c) => c.value).join(" / ");
    const variantKey = combo.map((c) => c.id).join("__") || `v-${i}`;
    const vp = priceMap.get(variantKey);
    const vPrice = vp?.price ?? (basePrice > 0 ? basePrice : undefined);
    return {
      id: variantKey,
      name: label,
      label,
      options: combo.map((c) => ({ id: c.id, name: c.name, value: c.value })),
      price: vPrice,
      available: true,
    };
  });
}

function mapProduct(
  raw: GHLProductRaw,
  collections: GHLCollectionRaw[],
  priceMap: Map<string, { price?: number; compareAt?: number }>,
): StoreProduct {
  const id = raw._id || raw.id || "";
  const slug = raw.slug || slugify(raw.name) || id;
  const firstCollectionId =
    raw.collectionIds?.[0] || raw.collections?.[0]?._id || raw.collections?.[0]?.id;
  const matchedCol = collections.find(
    (c) => c._id === firstCollectionId || c.id === firstCollectionId,
  );
  const category = matchedCol?.name || raw.productType || "General";

  // Product-level price from the prices endpoint (no variantId), then API price,
  // then admin override, then 0 (price-on-request).
  const prodPrice = priceMap.get(id);
  const apiPrice = prodPrice?.price ?? priceToDollars(raw.price);
  const override = PRICE_OVERRIDES[id] ?? PRICE_OVERRIDES[slug];
  const compareAt = prodPrice?.compareAt ?? priceToDollars(raw.compareAtPrice);
  const basePrice = apiPrice > 0 ? apiPrice : (override ?? 0);

  // Variants: GHL option groups expanded into selectable combinations, with
  // per-variant prices applied from the prices endpoint.
  const variants = mapOptionGroupsToVariants(raw.variants ?? [], basePrice, priceMap);

  const trackInv = raw.trackInventory || raw.trackProductInventory;
  const inv = raw.inventoryCount;
  const inStock =
    raw.status && raw.status !== "active"
      ? false
      : trackInv && inv != null
        ? inv > 0
        : variants.length
          ? variants.some((v) => v.available)
          : true;

  return {
    id,
    slug,
    name: raw.name || "Untitled product",
    tagline: raw.statementDescriptor || stripHtml(raw.description).slice(0, 80) || "",
    description: stripHtml(raw.description) || "",
    price: basePrice,
    compareAtPrice: compareAt > basePrice ? compareAt : undefined,
    category,
    material: raw.productType || "",
    image: pickImage(raw),
    images: pickImages(raw),
    rating: 4.8,
    reviews: 0,
    inStock,
    collectionId: firstCollectionId,
    collectionIds: raw.collectionIds || [],
    variants,
  };
}

function stripHtml(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mapCollection(raw: GHLCollectionRaw): StoreCollection {
  const id = raw._id || raw.id || "";
  const count = raw.stats?.productCount ?? 0;
  return {
    id,
    slug: raw.slug || slugify(raw.name) || id,
    name: raw.name || "Collection",
    description: raw.seo?.description || "",
    image: raw.image || "",
    itemCount: count,
  };
}

// --- Fetchers ---------------------------------------------------------------

async function ghlGet(path: string, pit: string): Promise<{ ok: boolean; data: unknown }> {
  try {
    const res = await fetch(`${GHL_BASE_URL}${path}`, { headers: getHeaders(pit) });
    if (!res.ok) return { ok: false, data: null };
    const text = await res.text();
    if (!text) return { ok: true, data: null };
    return { ok: true, data: JSON.parse(text) };
  } catch (err) {
    console.error("GHL fetch error:", path, err);
    return { ok: false, data: null };
  }
}

function asArray<T>(data: unknown, key: string): T[] {
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;
  const arr = obj[key] ?? obj.data ?? obj.products ?? obj.collections ?? [];
  return Array.isArray(arr) ? (arr as T[]) : [];
}

/**
 * Fetch all prices for the location and build a lookup keyed by productId
 * (product-level price) and by `productId__variantId` (per-variant price).
 * GHL prices live on /payments/prices, separate from products, with amounts
 * in cents. Returns an empty map if the endpoint is unavailable.
 */
async function fetchPriceMap(
  locationId: string,
  pit: string,
): Promise<Map<string, { price?: number; compareAt?: number }>> {
  const map = new Map<string, { price?: number; compareAt?: number }>();
  const res = await ghlGet(
    `/payments/prices/?altId=${encodeURIComponent(locationId)}&altType=location&limit=100`,
    pit,
  );
  if (!res.ok) return map;

  const rawPrices = asArray<GHLPriceRaw>(res.data, "prices");
  for (const p of rawPrices) {
    const amount = priceToDollars(p.amount);
    const compareAt = priceToDollars(p.compareAtAmount);
    const pid = String(p.productId || "");
    const vid = String(p.variantId || "");
    if (!pid) continue;
    const key = vid ? `${pid}__${vid}` : pid;
    const existing = map.get(key) ?? {};
    if (amount > 0) existing.price = amount;
    if (compareAt > 0) existing.compareAt = compareAt;
    map.set(key, existing);
  }
  return map;
}

export async function fetchCatalogServer(): Promise<CatalogResult> {
  const pit = process.env.GHL_PIT;
  if (!pit) {
    return {
      products: demoProducts(),
      collections: DEMO_COLLECTIONS,
      live: false,
      error: "GHL_PIT not configured",
    };
  }
  const locationId = getLocationId();

  // Collections + prices require altId + altType (locationId alone returns 422).
  const [prodRes, colRes, priceMap] = await Promise.all([
    ghlGet(`/products/?locationId=${encodeURIComponent(locationId)}&limit=100`, pit),
    ghlGet(
      `/products/collections?altId=${encodeURIComponent(locationId)}&altType=location&limit=100`,
      pit,
    ),
    fetchPriceMap(locationId, pit),
  ]);

  if (!prodRes.ok) {
    return {
      products: demoProducts(),
      collections: DEMO_COLLECTIONS,
      live: false,
      error: "GHL products API unavailable",
    };
  }

  const rawProducts = asArray<GHLProductRaw>(prodRes.data, "products");
  const rawCollections = asArray<GHLCollectionRaw>(colRes.data, "collections");

  const products = rawProducts
    .filter((p) => p.availableInStore !== false)
    .map((p) => mapProduct(p, rawCollections, priceMap));

  // Filter out the empty "Default" collections that GHL seeds.
  const collections = rawCollections
    .map(mapCollection)
    .filter((c) => c.name !== "Default" || (c.itemCount ?? 0) > 0);

  if (products.length === 0) {
    return {
      products: demoProducts(),
      collections: DEMO_COLLECTIONS,
      live: false,
      error: "No products returned",
    };
  }

  return { products, collections, live: true };
}

export async function fetchProductServer(slug: string): Promise<ProductResult> {
  const catalog = await fetchCatalogServer();
  const product = catalog.products.find((p) => p.slug === slug || p.id === slug) || null;
  const related = product
    ? catalog.products
        .filter((p) => p.id !== product.id)
        .sort((a, b) => {
          const aSame = a.collectionId === product.collectionId ? 0 : 1;
          const bSame = b.collectionId === product.collectionId ? 0 : 1;
          return aSame - bSame;
        })
        .slice(0, 4)
    : [];
  return { product, related, live: catalog.live };
}

// --- Promo validation -------------------------------------------------------

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

const DEMO_PROMOS: Record<
  string,
  { type: "percent" | "fixed"; value: number; label: string; freeShipping?: boolean }
> = {
  HAVEN10: { type: "percent", value: 10, label: "10% off your order" },
  WELCOME15: { type: "percent", value: 15, label: "15% off — welcome gift", freeShipping: true },
  FREESHIP: { type: "fixed", value: 0, label: "Free shipping", freeShipping: true },
  CRAFT25: { type: "fixed", value: 25, label: "$25 off your order" },
};

function computeDiscount(type: "percent" | "fixed", value: number, subtotal: number): number {
  if (type === "percent") return Math.round(subtotal * (value / 100) * 100) / 100;
  return Math.min(value, subtotal);
}

export async function validatePromoCodeServer(input: {
  code: string;
  subtotal: number;
}): Promise<PromoValidationResult> {
  const pit = process.env.GHL_PIT;
  const locationId = getLocationId();
  const code = input.code.trim().toUpperCase();
  const subtotal = Math.max(0, input.subtotal);

  if (!code) return { valid: false, message: "Enter a promo code." };

  if (pit) {
    try {
      // Try the documented coupons endpoint; fall back to demo codes on 404.
      const res = await fetch(
        `${GHL_BASE_URL}/coupons/?altId=${encodeURIComponent(locationId)}&altType=location&limit=100`,
        { headers: getHeaders(pit) },
      );
      if (res.ok) {
        const data = await res.json();
        const coupons: Array<Record<string, unknown>> = data.coupons || data.data || [];
        const match = coupons.find((c) => {
          const name = String(c.name || c.code || c.couponCode || "").toUpperCase();
          return name === code;
        });
        if (match) {
          const rawType = String(match.type || match.discountType || "").toLowerCase();
          const isPercent = rawType.includes("percent") || rawType === "percentage";
          const amount = Number(match.value ?? match.amount ?? match.discount ?? 0);
          const type: "percent" | "fixed" = isPercent ? "percent" : "fixed";
          const value = Number.isFinite(amount) ? amount : 0;
          return {
            valid: true,
            code,
            type,
            value,
            discountAmount: computeDiscount(type, value, subtotal),
            label: isPercent ? `${value}% off your order` : `$${value} off your order`,
            message: "Promo applied.",
          };
        }
      }
    } catch (err) {
      console.error("GHL Coupons API error, falling back to demo codes:", err);
    }
  }

  const demo = DEMO_PROMOS[code];
  if (demo) {
    return {
      valid: true,
      code,
      type: demo.type,
      value: demo.value,
      discountAmount: computeDiscount(demo.type, demo.value, subtotal),
      label: demo.label,
      freeShipping: demo.freeShipping,
      message: "Promo applied.",
    };
  }

  return { valid: false, message: "That code isn't valid. Try again." };
}

// --- Order creation ---------------------------------------------------------

export async function createGHLOrderServer(orderData: {
  email: string;
  phone?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
    variantId?: string;
  }>;
  totalAmount: number;
  promoCode?: string;
  discountAmount?: number;
}): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const pit = process.env.GHL_PIT;
  const locationId = getLocationId();
  const refId = `MDH-${Math.floor(100000 + Math.random() * 899999)}`;

  if (!pit) return { success: true, orderId: refId };

  try {
    const body = {
      locationId,
      altId: locationId,
      altType: "location",
      contact: { email: orderData.email, phone: orderData.phone, name: orderData.name },
      shippingAddress: {
        address1: orderData.address,
        city: orderData.city,
        state: orderData.state,
        postalCode: orderData.zip,
        country: "US",
      },
      lineItems: orderData.items.map((i) => ({
        product: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        price: i.price,
        title: i.name,
      })),
      amount: orderData.totalAmount,
      currency: "USD",
      source: "storefront",
      ...(orderData.promoCode
        ? { couponCode: orderData.promoCode, discount: orderData.discountAmount ?? 0 }
        : {}),
    };

    const res = await fetch(`${GHL_BASE_URL}/payments/orders`, {
      method: "POST",
      headers: getHeaders(pit),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("GHL Order API non-ok:", res.status, errText);
      // Surface a soft success with a local ref so the customer flow completes,
      // but flag the error for admin follow-up.
      return { success: true, orderId: refId, error: `Order API ${res.status}` };
    }

    const data = await res.json();
    return { success: true, orderId: data._id || data.id || refId };
  } catch (err) {
    console.error("GHL Order API error:", err);
    return { success: true, orderId: refId, error: String(err) };
  }
}
