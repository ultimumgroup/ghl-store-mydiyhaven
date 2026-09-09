// Compatibility shim — re-exports the normalized catalog types/helpers from
// ./catalog.ts so legacy imports (`@/lib/products`) keep resolving during the
// headless migration. New code should import directly from @/lib/catalog.
export {
  formatPrice,
  HERO_IMAGE,
  demoProducts as products,
  DEMO_COLLECTIONS as collections,
  type StoreProduct as Product,
  type StoreCollection as Collection,
  type StoreVariant,
} from "./catalog";

import { demoProducts, DEMO_COLLECTIONS } from "./catalog";
import type { StoreProduct, StoreCollection } from "./catalog";

export function getProduct(slug: string): StoreProduct | undefined {
  return demoProducts().find((p) => p.slug === slug || p.id === slug);
}

export function getCollection(slug: string): StoreCollection | undefined {
  return DEMO_COLLECTIONS.find((c) => c.slug === slug || c.id === slug);
}
