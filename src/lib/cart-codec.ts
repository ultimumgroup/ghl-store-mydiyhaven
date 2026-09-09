import type { StoreProduct, StoreVariant } from "./catalog";
export interface SavedLine {
  productId: string;
  variantId: string;
  quantity: number;
}
export interface CartItem {
  product: StoreProduct;
  variant: StoreVariant;
  quantity: number;
  lineKey: string;
}
export const MAX_CART_LINES = 20;
export const lineKeyFor = (productId: string, variantId?: string) =>
  `${productId}::${variantId || "default"}`;
export function parseCart(raw: unknown): SavedLine[] {
  if (!raw || typeof raw !== "object") return [];
  const data = raw as { v?: number; lines?: unknown[] };
  const rows = data.v === 2 && Array.isArray(data.lines) ? data.lines : [];
  const seen = new Set<string>();
  const result: SavedLine[] = [];
  for (const item of rows.slice(0, MAX_CART_LINES)) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    if (
      typeof r["productId"] !== "string" ||
      typeof r["variantId"] !== "string" ||
      !Number.isInteger(r["quantity"])
    )
      continue;
    if (!/^[\w-]{1,80}$/.test(r["productId"]) || !/^[\w-]{1,80}$/.test(r["variantId"])) continue;
    const quantity = r["quantity"] as number;
    if (quantity < 1 || quantity > 99) continue;
    const key = lineKeyFor(r["productId"], r["variantId"]);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ productId: r["productId"], variantId: r["variantId"], quantity });
  }
  return result;
}
export function restoreCart(saved: SavedLine[], products: StoreProduct[]): CartItem[] {
  return saved.flatMap((l) => {
    const product = products.find((p) => p.id === l.productId);
    const variant = product?.variants.find((v) => v.id === l.variantId);
    if (!product?.inStock || !variant?.available) return [];
    const quantity = Math.min(l.quantity, variant.maxQuantity ?? 99, 99);
    if (quantity < 1) return [];
    return [{ product, variant, quantity, lineKey: lineKeyFor(product.id, variant.id) }];
  });
}
export function serializeCart(items: CartItem[]): string {
  const value = JSON.stringify({
    v: 2,
    lines: items.map((i) => ({
      productId: i.product.id,
      variantId: i.variant.id,
      quantity: i.quantity,
    })),
  });
  if (items.length > MAX_CART_LINES || encodeURIComponent(value).length > 3500)
    throw new Error("This cart is full. Remove an item before adding another.");
  return value;
}
