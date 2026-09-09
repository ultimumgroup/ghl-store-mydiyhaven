// Client-safe catalog types + bundled demo fallback catalog.
// Imported by both client (types/demo data) and server modules.

export interface StoreVariant {
  id: string;
  name: string;
  /** Display label combining its option values, e.g. "Small / Amber" */
  label: string;
  options: Array<{ id: string; name: string; value: string }>;
  price?: number; // override price for this variant (in dollars)
  image?: string;
  sku?: string;
  available: boolean;
}

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number; // dollars; 0 means "price on request" / not configured
  compareAtPrice?: number;
  category: string;
  material: string;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  badge?: string;
  inStock: boolean;
  collectionId?: string;
  collectionIds?: string[];
  variants: StoreVariant[];
}

/**
 * Admin price overrides. The sub-account's products don't carry prices in the
 * e-commerce API (hasPrices: false). Until prices are set in the GHL store
 * admin, map known product IDs/slugs → dollar prices here so the storefront
 * can sell them. Products without an override show "Price on request".
 *
 * Keep this in sync with the GHL store admin; when prices are set there,
 * these overrides become redundant and can be removed.
 */
export const PRICE_OVERRIDES: Record<string, number> = {
  // Add entries as: "productId": 49.99  or  "product-slug": 49.99
};

/** True when the product has a real, purchasable price. */
export function priceAvailable(product: StoreProduct): boolean {
  if (product.price > 0) return true;
  return product.variants.some((v) => v.price != null && v.price > 0);
}

/**
 * Resolves the price to display on a product card.
 * - No variants: the product price (or undefined if unpriced).
 * - All variants share one price: that single price.
 * - Variants have differing prices: the minimum, flagged as "starting at".
 */
export interface DisplayPrice {
  amount: number;
  startingAt: boolean;
}

export function displayPrice(product: StoreProduct): DisplayPrice | undefined {
  const variantPrices = product.variants
    .map((v) => v.price)
    .filter((p): p is number => p != null && p > 0);

  if (variantPrices.length === 0) {
    return product.price > 0 ? { amount: product.price, startingAt: false } : undefined;
  }

  const min = Math.min(...variantPrices);
  const max = Math.max(...variantPrices);
  // If the product has a non-variant base price and no variant differs, use it.
  const allSame = min === max;
  return { amount: min, startingAt: !allSame };
}

export interface StoreCollection {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  itemCount?: number;
  productIds?: string[];
}

export interface CatalogResult {
  products: StoreProduct[];
  collections: StoreCollection[];
  /** When true the data came from the live GHL API; false = demo fallback. */
  live: boolean;
  error?: string;
}

export interface ProductResult {
  product: StoreProduct | null;
  related: StoreProduct[];
  live: boolean;
}

export const DEMO_ASSET = "https://vibe.filesafe.space/1788904025281039367/assets";

export const HERO_IMAGE = `${DEMO_ASSET}/17038bb9-b3dd-47e7-a91d-8fd235668c93.png`;

export const DEMO_COLLECTIONS: StoreCollection[] = [
  {
    id: "tableware",
    slug: "tableware-drinkware",
    name: "Tableware & Drinkware",
    description: "Wheel-thrown mugs, gradient plates, and rustic terracotta nesting bowls.",
    image: `${DEMO_ASSET}/b2979b6c-279d-4bd5-83c3-1e04797a771b.png`,
  },
  {
    id: "textiles",
    slug: "home-textiles",
    name: "Home Textiles",
    description: "Hand-loomed merino wool throws and stonewashed European linen runners.",
    image: `${DEMO_ASSET}/74d4933d-432e-44e2-83e8-5ec1e3f88b86.png`,
  },
  {
    id: "decor",
    slug: "decor-accents",
    name: "Decor & Home Accents",
    description: "Coil-sculpted ceramic vases and hand-poured soy wax candles.",
    image: `${DEMO_ASSET}/7301659f-8b33-4ba2-b44e-1c73b6f70df2.png`,
  },
  {
    id: "kitchen",
    slug: "kitchen-living",
    name: "Kitchen & Woodwork",
    description: "Live-edge American black walnut serving boards and kitchen staples.",
    image: `${DEMO_ASSET}/4e8e9f3e-98b3-4bfc-911c-e1babfcf5e6e.png`,
  },
];

export function demoProducts(): StoreProduct[] {
  return [
    {
      id: "1",
      slug: "hearth-stoneware-mug",
      name: "Hearth Stoneware Mug",
      tagline: "Wheel-thrown, wood-kiln fired",
      description:
        "Each mug is hand-thrown on the wheel and finished with a reactive clay glaze that pools amber in the grooves. No two are alike — slight variations in tone and form are the signature of the maker's hand.",
      price: 38,
      category: "Drinkware",
      collectionId: "tableware",
      material: "Stoneware clay",
      image: `${DEMO_ASSET}/b2979b6c-279d-4bd5-83c3-1e04797a771b.png`,
      images: [
        `${DEMO_ASSET}/b2979b6c-279d-4bd5-83c3-1e04797a771b.png`,
        `${DEMO_ASSET}/7c6f1693-377a-4fb8-939f-3288d4225323.png`,
      ],
      rating: 4.9,
      reviews: 214,
      badge: "Bestseller",
      inStock: true,
      variants: [
        {
          id: "1-small",
          name: "Small",
          label: "Small · 8oz",
          options: [{ id: "size", name: "Size", value: "Small · 8oz" }],
          price: 38,
          available: true,
        },
        {
          id: "1-large",
          name: "Large",
          label: "Large · 12oz",
          options: [{ id: "size", name: "Size", value: "Large · 12oz" }],
          price: 44,
          available: true,
        },
      ],
    },
    {
      id: "2",
      slug: "amber-weave-throw",
      name: "Amber Weave Throw",
      tagline: "Hand-loomed pure wool",
      description:
        "Woven on a traditional floor loom from undyed merino wool, this throw is brushed soft and finished with a hand-knotted fringe. Warm enough for winter evenings, light enough for a summer porch.",
      price: 168,
      category: "Textiles",
      collectionId: "textiles",
      material: "Pure merino wool",
      image: `${DEMO_ASSET}/74d4933d-432e-44e2-83e8-5ec1e3f88b86.png`,
      images: [`${DEMO_ASSET}/74d4933d-432e-44e2-83e8-5ec1e3f88b86.png`],
      rating: 4.8,
      reviews: 96,
      inStock: true,
      variants: [],
    },
    {
      id: "3",
      slug: "cocoa-curve-vase",
      name: "Cocoa Curve Vase",
      tagline: "Sculptural, single-stem",
      description:
        "A slow-built coil vase with an organic, asymmetric silhouette. The deep cocoa body is burnished by hand to a soft sheen, making it as much a sculptural object as a vessel.",
      price: 92,
      category: "Decor",
      collectionId: "decor",
      material: "Earthenware",
      image: `${DEMO_ASSET}/7301659f-8b33-4ba2-b44e-1c73b6f70df2.png`,
      images: [`${DEMO_ASSET}/7301659f-8b33-4ba2-b44e-1c73b6f70df2.png`],
      rating: 4.9,
      reviews: 58,
      badge: "New",
      inStock: true,
      variants: [],
    },
    {
      id: "4",
      slug: "harvest-plate-set",
      name: "Harvest Plate Set",
      tagline: "Set of four, stackable",
      description:
        "A set of four dinner plates glazed in a gradient of cream to amber. Designed to stack neatly and mix freely — each piece carries the maker's mark on the foot.",
      price: 124,
      category: "Tableware",
      collectionId: "tableware",
      material: "Stoneware clay",
      image: `${DEMO_ASSET}/7c6f1693-377a-4fb8-939f-3288d4225323.png`,
      images: [`${DEMO_ASSET}/7c6f1693-377a-4fb8-939f-3288d4225323.png`],
      rating: 4.7,
      reviews: 132,
      inStock: true,
      variants: [],
    },
    {
      id: "5",
      slug: "ember-soy-candle",
      name: "Ember Soy Candle",
      tagline: "Cedar & smoked vanilla",
      description:
        "Hand-poured soy wax in a reusable amber glass vessel, scented with cedar, smoked vanilla, and a whisper of clove. Burns clean for 50+ hours; the glass is meant to be kept.",
      price: 32,
      category: "Home",
      collectionId: "decor",
      material: "Soy wax · amber glass",
      image: `${DEMO_ASSET}/ba6ba8dd-76c4-42ab-a507-988397a844d8.png`,
      images: [`${DEMO_ASSET}/ba6ba8dd-76c4-42ab-a507-988397a844d8.png`],
      rating: 4.8,
      reviews: 301,
      badge: "Bestseller",
      inStock: true,
      variants: [
        {
          id: "5-travel",
          name: "Travel",
          label: "Travel Tin · 4oz",
          options: [{ id: "size", name: "Size", value: "Travel Tin · 4oz" }],
          price: 24,
          available: true,
        },
        {
          id: "5-standard",
          name: "Standard",
          label: "Amber Glass · 8oz",
          options: [{ id: "size", name: "Size", value: "Amber Glass · 8oz" }],
          price: 32,
          available: true,
        },
        {
          id: "5-large",
          name: "Large",
          label: "Amber Glass · 12oz",
          options: [{ id: "size", name: "Size", value: "Amber Glass · 12oz" }],
          price: 42,
          available: false,
        },
      ],
    },
    {
      id: "6",
      slug: "oatmeal-linen-runner",
      name: "Oatmeal Linen Runner",
      tagline: "Stonewashed, fringed",
      description:
        "Woven from heavyweight European flax and stonewashed to a lived-in softness. The hand-fringed edges soften any table — it only looks better with age and washing.",
      price: 64,
      category: "Textiles",
      collectionId: "textiles",
      material: "Pure linen",
      image: `${DEMO_ASSET}/faab0bda-1d9a-43a9-bd7a-67748640dbe1.png`,
      images: [`${DEMO_ASSET}/faab0bda-1d9a-43a9-bd7a-67748640dbe1.png`],
      rating: 4.6,
      reviews: 47,
      inStock: true,
      variants: [
        {
          id: "6-short",
          name: "Short",
          label: "72in",
          options: [{ id: "length", name: "Length", value: "72in" }],
          price: 64,
          available: true,
        },
        {
          id: "6-long",
          name: "Long",
          label: "90in",
          options: [{ id: "length", name: "Length", value: "90in" }],
          price: 74,
          available: true,
        },
      ],
    },
    {
      id: "7",
      slug: "walnut-serving-board",
      name: "Walnut Serving Board",
      tagline: "Live-edge, food-safe",
      description:
        "Cut from a single slab of American black walnut and finished with a food-safe walnut oil. The live edge is left natural; each board is a one-of-one grain pattern.",
      price: 86,
      category: "Kitchen",
      collectionId: "kitchen",
      material: "Black walnut",
      image: `${DEMO_ASSET}/4e8e9f3e-98b3-4bfc-911c-e1babfcf5e6e.png`,
      images: [`${DEMO_ASSET}/4e8e9f3e-98b3-4bfc-911c-e1babfcf5e6e.png`],
      rating: 4.9,
      reviews: 119,
      inStock: true,
      variants: [],
    },
    {
      id: "8",
      slug: "terracotta-bowl-set",
      name: "Terracotta Bowl Set",
      tagline: "Set of three, nesting",
      description:
        "Three nesting bowls in graduated sizes, each with an organic, hand-pinched rim. The terracotta body is sealed with a food-safe glaze inside and left matte outside.",
      price: 78,
      category: "Tableware",
      collectionId: "tableware",
      material: "Terracotta",
      image: `${DEMO_ASSET}/3d659f90-8803-4caf-893a-5392732b1380.png`,
      images: [`${DEMO_ASSET}/3d659f90-8803-4caf-893a-5392732b1380.png`],
      rating: 4.7,
      reviews: 84,
      inStock: true,
      variants: [],
    },
  ];
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}
