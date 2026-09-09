import { fetchCatalogServer } from "./ghl.server";
export async function runDiagnostics() {
  const c = await fetchCatalogServer();
  return {
    timestamp: new Date().toISOString(),
    catalog: {
      live: c.live,
      productCount: c.products.length,
      collectionCount: c.collections.length,
      pricedProductCount: c.products.filter((p) => p.price > 0).length,
      variantCount: c.products.reduce((n, p) => n + p.variants.length, 0),
      outOfStockVariants: c.products.flatMap((p) => p.variants).filter((v) => !v.available).length,
      collections: c.collections.map((c) => ({ name: c.name, itemCount: c.itemCount })),
    },
    checkout: { available: false, reason: "A supported payment handoff has not been configured." },
  };
}
