// Diagnostic helpers for the headless e-commerce integration.
// Exposed via the /api/store-diagnostics route and the getStoreDiagnostics
// server function. Safe to call anytime — read-only, no side effects.

import { fetchCatalogServer, validatePromoCodeServer } from "./ghl.server";

export interface DiagnosticResult {
  timestamp: string;
  secrets: {
    GHL_PIT: boolean;
    GHL_LOCATION_ID: boolean;
    locationId: string;
  };
  catalog: {
    live: boolean;
    error?: string;
    productCount: number;
    collectionCount: number;
    pricedProductCount: number;
    variantCount: number;
    sampleProduct?: {
      id: string;
      name: string;
      slug: string;
      price: number;
      compareAtPrice?: number;
      variantCount: number;
      inStock: boolean;
    };
  };
  promo: {
    demoCodes: string[];
    sampleValidation: { code: string; valid: boolean; message?: string };
  };
}

const DEMO_CODES = ["HAVEN10", "WELCOME15", "FREESHIP", "CRAFT25"];

export async function runDiagnostics(): Promise<DiagnosticResult> {
  const pit = process.env.GHL_PIT;
  const locationId = process.env.GHL_LOCATION_ID || "MSmQrVKlTBkzE6chWWis";

  const catalog = await fetchCatalogServer();

  const priced = catalog.products.filter(
    (p) => p.price > 0 || p.variants.some((v) => v.price != null && v.price > 0),
  );
  const variantCount = catalog.products.reduce((sum, p) => sum + p.variants.length, 0);
  const sample = catalog.products[0];

  // Validate a known demo code to confirm the promo path works end-to-end.
  const sampleValidation = await validatePromoCodeServer({
    code: "HAVEN10",
    subtotal: 100,
  });

  return {
    timestamp: new Date().toISOString(),
    secrets: {
      GHL_PIT: !!pit,
      GHL_LOCATION_ID: !!process.env.GHL_LOCATION_ID,
      locationId,
    },
    catalog: {
      live: catalog.live,
      error: catalog.error,
      productCount: catalog.products.length,
      collectionCount: catalog.collections.length,
      pricedProductCount: priced.length,
      variantCount,
      sampleProduct: sample
        ? {
            id: sample.id,
            name: sample.name,
            slug: sample.slug,
            price: sample.price,
            compareAtPrice: sample.compareAtPrice,
            variantCount: sample.variants.length,
            inStock: sample.inStock,
          }
        : undefined,
    },
    promo: {
      demoCodes: DEMO_CODES,
      sampleValidation: {
        code: "HAVEN10",
        valid: sampleValidation.valid,
        message: sampleValidation.message,
      },
    },
  };
}
