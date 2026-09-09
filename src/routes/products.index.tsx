import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/store/product-card";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/brand";
import { catalogQueryOptions } from "@/lib/catalog-query";
import { displayPrice } from "@/lib/catalog";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: `Shop Pens, Pen Blanks & More — ${BRAND_NAME}` },
      {
        name: "description",
        content:
          "Shop pen blanks, handmade pens, apparel, signs and creative supplies from My DIY Haven, Larry Dillon’s veteran-owned shop.",
      },
      { property: "og:title", content: `Shop Pens, Pen Blanks & More — ${BRAND_NAME}` },
      {
        property: "og:description",
        content:
          "Shop pen blanks, handmade pens, apparel, signs and creative supplies from My DIY Haven, Larry Dillon’s veteran-owned shop.",
      },
      { property: "og:url", content: "https://mydiyhaven.com/products" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mydiyhaven.com/products" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions()),
  component: ProductsCatalogPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Couldn't load products</h1>
      <p className="mt-2 text-sm text-muted-foreground">{String(error.message)}</p>
    </div>
  ),
});

function ProductsCatalogPage() {
  const { data } = useSuspenseQuery(catalogQueryOptions());
  const products = data.products;
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        const matchesSearch =
          searchQuery.trim() === "" ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.material.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc")
          return (displayPrice(a)?.amount ?? 0) - (displayPrice(b)?.amount ?? 0);
        if (sortBy === "price-desc")
          return (displayPrice(b)?.amount ?? 0) - (displayPrice(a)?.amount ?? 0);
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Full Studio Catalog
          </span>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            All Products
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            {data.live
              ? `${products.length} products for your next project, personal gift, or everyday favorite.`
              : "Pen blanks, handmade pens, apparel and more from Larry’s shop."}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products, designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "featured" | "price-asc" | "price-desc")}
              className="h-10 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="my-16 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="font-display text-lg font-semibold text-foreground">
            No products match your search or filter
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try broadening your search term or picking a different category.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
