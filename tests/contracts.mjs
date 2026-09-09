// Execute actual TypeScript modules with isolated fake env + fetch. No live mutations.
import assert from "node:assert/strict";
import vm from "node:vm";
import ts from "typescript";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
const calls = [];
const product = {
  _id: "p1",
  name: "Fixture pen",
  availableInStore: true,
  status: "active",
  variants: [
    {
      name: "Finish",
      options: [
        { id: "red", name: "Red" },
        { id: "blue", name: "Blue" },
      ],
    },
  ],
};
const prices = [
  {
    _id: "price1",
    name: "Red",
    amount: 9,
    currency: "USD",
    type: "one_time",
    variantOptionIds: ["red"],
    trackInventory: true,
    availableQuantity: 2,
  },
  {
    _id: "price2",
    name: "Blue",
    amount: 15,
    currency: "USD",
    type: "one_time",
    variantOptionIds: ["blue"],
    trackInventory: true,
    availableQuantity: 0,
  },
];
let fixtureProducts = [product];
let fixtureCollections = [];
const env = { GHL_PIT: "fake", GHL_LOCATION_ID: "fake" };
const context = vm.createContext({
  process: { env },
  console,
  Response,
  URLSearchParams,
  AbortSignal,
  setTimeout: (fn) => {
    fn();
    return 0;
  },
  fetch: async (url, options) => {
    assert.equal(options.method, undefined, "Adapter must be read-only");
    calls.push(url);
    const parsed = new URL(url);
    const path = parsed.pathname;
    const members = parsed.searchParams.has("collectionIds")
      ? fixtureProducts.filter((p) =>
          p.collectionIds?.includes(parsed.searchParams.get("collectionIds")),
        )
      : fixtureProducts;
    return Response.json(
      path === "/products/"
        ? { products: members, total: [{ total: members.length }] }
        : path.endsWith("/price")
          ? { prices, total: 2 }
          : path === "/products/collections"
            ? { data: fixtureCollections, total: fixtureCollections.length }
            : { data: [] },
    );
  },
});
const cache = new Map();
async function load(file) {
  file = resolve(file);
  if (cache.has(file)) return cache.get(file);
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
  const m = new vm.SourceTextModule(code, { context, identifier: file });
  cache.set(file, m);
  await m.link((spec) => load(resolve(dirname(file), spec + ".ts")));
  return m;
}
const mapper = await load("src/lib/ghl-catalog.ts");
await mapper.evaluate();
const mapped = mapper.namespace.normalizeProduct(
  product,
  prices,
  ["c1"],
  [{ id: "c1", name: "Pens" }],
);
assert.equal(mapped.price, 9);
assert.equal(mapped.variants[0].id, "price1");
assert.equal(mapped.variants[0].maxQuantity, 2);
assert.equal(mapped.variants[1].available, false);
assert.equal(mapped.variants.length, 2);
assert.equal(mapped.rating, 0);
const large = mapper.namespace.normalizeProduct(product, [{ ...prices[0], amount: 1250 }], [], []);
assert.equal(large.price, 1250, "No magnitude conversion");
const codec = await load("src/lib/cart-codec.ts");
await codec.evaluate();
const c = codec.namespace;
assert.equal(
  c.parseCart({ v: 2, lines: [{ productId: "p1", variantId: "price1", quantity: -1 }] }).length,
  0,
);
assert.equal(
  c.parseCart({ v: 2, lines: [{ productId: "p1", variantId: "price1", quantity: 1.5 }] }).length,
  0,
);
const restored = c.restoreCart(
  [
    { productId: "p1", variantId: "price1", quantity: 9 },
    { productId: "p1", variantId: "price2", quantity: 1 },
  ],
  [mapped],
);
assert.equal(restored.length, 1);
assert.equal(restored[0].quantity, 2);
const serialized = c.serializeCart(restored);
assert(!serialized.includes('price":'));
assert(!serialized.includes("description"));
assert.equal(c.parseCart(JSON.parse(serialized)).length, 1);
const server = await load("src/lib/ghl.server.ts");
await server.evaluate();
const api = server.namespace;
const before = calls.length;
const [catalog] = await Promise.all([api.fetchCatalogServer(), api.fetchCatalogServer()]);
assert.equal(catalog.products.length, 1);
assert.equal(calls.length - before, 3, "Concurrent catalog loads must share work");
const q = await api.quoteCartServer([
  { productId: "p1", variantId: "price1", quantity: 2, price: -100, totalAmount: -100 },
]);
assert.equal(q.subtotal, 18);
assert.equal(q.checkoutAvailable, false);
await assert.rejects(() =>
  api.quoteCartServer([{ productId: "p1", variantId: "price1", quantity: 3 }]),
);
await assert.rejects(() =>
  api.quoteCartServer([{ productId: "p1", variantId: "price2", quantity: 1 }]),
);
await assert.rejects(() =>
  api.quoteCartServer([
    { productId: "p1", variantId: "price1", quantity: 2 },
    { productId: "p1", variantId: "price1", quantity: 2 },
  ]),
);
const count = calls.length;
assert.equal((await api.createGHLOrderServer({})).success, false);
assert.equal(calls.length, count, "No simulated payment recording");
assert.equal((await api.validatePromoCodeServer({ code: "HAVEN10", subtotal: 100 })).valid, false);
// Cold directory must not fetch any prices; later requests resolve only their scope.
fixtureProducts = Array.from({ length: 12 }, (_, i) => ({
  ...product,
  _id: `scope${i}`,
  slug: `scope-${i}`,
  collectionIds: [i < 2 ? "small" : "large"],
}));
fixtureCollections = [
  { _id: "small", name: "Small", slug: "small" },
  { _id: "large", name: "Large", slug: "large" },
];
env.GHL_LOCATION_ID = "scope-fixture";
const directoryStart = calls.length;
const [directory] = await Promise.all([api.fetchCollectionsServer(), api.fetchCollectionsServer()]);
assert.equal(
  calls.length - directoryStart,
  4,
  "One product list, one collection list, two membership reads",
);
assert.equal(
  calls.slice(directoryStart).filter((u) => new URL(u).pathname.endsWith("/price")).length,
  0,
);
assert.equal(directory.collections[0].itemCount, 2);
assert.equal(directory.collections[1].itemCount, 10);
let start = calls.length;
const small = await api.fetchCollectionServer("small");
assert.equal(small.products.length, 2);
assert.equal(calls.length - start, 2, "Only the selected collection needs prices");
start = calls.length;
await api.fetchCollectionServer("small");
assert.equal(calls.length, start, "Warm prices should be shared");
assert.equal((await api.fetchCollectionServer("missing")).collections.length, 0);
assert.equal((await api.fetchProductServer("missing")).product, null);
start = calls.length;
const selected = await api.fetchCartProductsServer([
  { productId: "scope11", variantId: "price1", quantity: 1 },
]);
assert.equal(selected.products.length, 1);
assert.equal(calls.length - start, 1, "Saved cart must not load other products' prices");
start = calls.length;
await api.fetchFeaturedServer();
assert.equal(calls.length - start, 2, "Featured products reuse already resolved prices");
const detail = await api.fetchProductServer("scope-10");
assert.equal(detail.product.id, "scope10");
assert.equal(detail.related.length, 4);
assert(detail.related.every((p) => p.collectionIds.includes("large")));
console.log(
  "Scoped catalog tests passed: directory has zero price calls, counts, collection prices, warm cache, missing routes, selected cart, featured and related products.",
);
delete env.GHL_PIT;
await assert.rejects(() => api.fetchCatalogServer());
console.log(
  "Contract tests passed: money, real variants, inventory, compact cart, malformed data, cache coalescing, authoritative quote, no demo coupon or payment writes.",
);
