import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Layers } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { collectionsQueryOptions } from "@/lib/catalog-query";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: `Shop Collections — ${BRAND_NAME}` },
      {
        name: "description",
        content:
          "Explore pen blanks, handmade pens, military designs, apparel and more from My DIY Haven, a veteran-owned creative shop.",
      },
      { property: "og:title", content: `Shop Collections — ${BRAND_NAME}` },
      {
        property: "og:description",
        content:
          "Explore pen blanks, handmade pens, military designs, apparel and more from My DIY Haven, a veteran-owned creative shop.",
      },
      { property: "og:url", content: "https://mydiyhaven.com/collections" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://mydiyhaven.com/collections" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(collectionsQueryOptions()),
  component: CollectionsIndexPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Couldn't load collections</h1>
      <p className="mt-2 text-sm text-muted-foreground">{String(error.message)}</p>
    </div>
  ),
});

function CollectionsIndexPage() {
  const { data } = useSuspenseQuery(collectionsQueryOptions());
  const { collections } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">
          <Layers className="h-4 w-4" /> Curated Sets & Series
        </div>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Our Collections
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Find a design that means something to you, a blank for your next pen, or a gift with a
          personal touch. Explore the collections below.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((col) => (
          <Link
            key={col.id}
            to="/collections/$slug"
            params={{ slug: col.slug }}
            className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              {col.image ? (
                <img
                  src={col.image}
                  alt=""
                  loading="lazy"
                  width={600}
                  height={450}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Layers className="h-10 w-10" />
                </div>
              )}
            </div>
            <div className="p-6">
              <h2 className="font-display text-2xl font-bold text-foreground">{col.name}</h2>
              {col.description && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {col.description}
                </p>
              )}
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                View collection ({col.itemCount} pieces) <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
