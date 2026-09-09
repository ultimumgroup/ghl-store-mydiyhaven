// Pure mapping of the verified GHL product/price API. No credentials or I/O.
import type { StoreProduct, StoreVariant, StoreCollection } from "./catalog";
export interface RawPrice {
  _id: string;
  product?: string;
  name?: string;
  type?: string;
  deleted?: boolean;
  currency: string;
  amount: number;
  compareAtPrice?: number;
  variantOptionIds?: string[];
  trackInventory?: boolean;
  availableQuantity?: number;
  allowOutOfStockPurchases?: boolean;
  sku?: string;
}
export interface RawProduct {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  availableInStore?: boolean;
  status?: string;
  collectionIds?: string[];
  variants?: { id?: string; name: string; options: { id: string; name: string }[] }[];
}
export interface RawCollection {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
  seo?: { description?: string };
  stats?: { productCount?: number };
}
export const textOnly = (s = "") =>
  s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
export function normalizeProduct(
  raw: RawProduct,
  prices: RawPrice[],
  collectionIds: string[],
  collections: StoreCollection[],
): StoreProduct {
  // Verified on this USD location: API amount 9 means $9, not 9 cents.
  // Never guess units from magnitude. Other currencies require explicit support.
  const valid = prices.filter(
    (p) =>
      !p.deleted &&
      p.type === "one_time" &&
      p.currency.toUpperCase() === "USD" &&
      Number.isFinite(p.amount) &&
      p.amount > 0,
  );
  const variants: StoreVariant[] = valid.map((p) => {
    const ids = p.variantOptionIds ?? [];
    const options = (raw.variants ?? []).flatMap((group) =>
      group.options
        .filter((o) => ids.includes(o.id))
        .map((o) => ({ id: o.id, name: group.name, value: o.name })),
    );
    const available =
      !p.trackInventory || p.allowOutOfStockPurchases === true || (p.availableQuantity ?? 0) > 0;
    return {
      id: p._id,
      priceId: p._id,
      name: p.name || "Standard",
      label: options.map((o) => o.value).join(" / ") || p.name || "Standard",
      options,
      price: p.amount,
      currency: "USD",
      available,
      ...(p.sku ? { sku: p.sku } : {}),
      ...(p.trackInventory && !p.allowOutOfStockPurchases
        ? { maxQuantity: Math.max(0, p.availableQuantity ?? 0) }
        : {}),
      ...(p.compareAtPrice != null && p.compareAtPrice > p.amount
        ? { compareAtPrice: p.compareAtPrice }
        : {}),
    };
  });
  const displayed = variants.filter((v) => v.available);
  const candidates = displayed.length ? displayed : variants;
  const lowest = candidates.reduce<StoreVariant | undefined>(
    (best, v) => (!best || v.price! < best.price! ? v : best),
    undefined,
  );
  const published = raw.availableInStore === true && (!raw.status || raw.status === "active");
  return {
    id: raw._id,
    slug: raw.slug || raw._id,
    name: raw.name,
    tagline: textOnly(raw.description).slice(0, 100),
    description: textOnly(raw.description),
    price: lowest?.price ?? 0,
    ...(lowest?.compareAtPrice ? { compareAtPrice: lowest.compareAtPrice } : {}),
    category: collections.find((c) => collectionIds.includes(c.id))?.name || "Shop",
    material: "",
    image: raw.image || "",
    images: raw.image ? [raw.image] : [],
    rating: 0,
    reviews: 0,
    inStock: published && variants.some((v) => v.available),
    collectionIds,
    ...(collectionIds[0] ? { collectionId: collectionIds[0] } : {}),
    variants,
  };
}
