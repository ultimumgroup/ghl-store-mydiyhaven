import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/store/product-card";
import { ArrowLeft, Sparkles, Layers } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { catalogQueryOptions } from "@/lib/catalog-query";

export const Route = createFileRoute("/collections/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(catalogQueryOptions());
    const collection =
      data.collections.find((c) => c.slug === params.slug || c.id === params.slug) || null;
    if (!collection) throw notFound();
    return { collection };
  },
  head: ({ loaderData }) => {
    const colName = loaderData?.collection?.name || "Collection";
    return {
      meta: [
        { title: `${colName} — ${BRAND_NAME}` },
        {
          name: "description",
          content:
            loaderData?.collection?.description || "Handcrafted products in this collection.",
        },
        { property: "og:title", content: `${colName} — ${BRAND_NAME}` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Collection not found</h1>
      <p className="mt-2 text-muted-foreground">
        The collection you are looking for does not exist.
      </p>
      <Link to="/collections" className="mt-4 inline-block text-primary hover:underline">
        Back to all collections
      </Link>
    </div>
  ),
  component: CollectionDetailPage,
});

function CollectionDetailPage() {
  const { collection } = Route.useLoaderData();
  const { data } = useSuspenseQuery(catalogQueryOptions());
  const colProducts = data.products.filter(
    (p) =>
      p.collectionId === collection.id ||
      p.collectionIds?.includes(collection.id) ||
      p.category.toLowerCase().includes(collection.id.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/collections"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All Collections
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm lg:p-12">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Handcrafted Series
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {collection.name}
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              {collection.description}
            </p>
          </div>
          <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-muted lg:aspect-[4/3]">
            {collection.image ? (
              <img
                src={collection.image}
                alt={collection.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Layers className="h-10 w-10" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Pieces in this collection ({colProducts.length})
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {colProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
