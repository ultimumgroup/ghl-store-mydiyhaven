import { createFileRoute } from "@tanstack/react-router";
import { HomeContent } from "@/components/store/home-content";
import { BRAND_NAME } from "@/lib/brand";
import { catalogQueryOptions } from "@/lib/catalog-query";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND_NAME} — Handmade Home Goods` },
      {
        name: "description",
        content:
          "Handcrafted ceramics, textiles, and woodwork made in small batches. Objects shaped by hand and meant to last a lifetime.",
      },
      { property: "og:title", content: `${BRAND_NAME} — Handmade Home Goods` },
      {
        property: "og:description",
        content: "Handcrafted ceramics, textiles, and woodwork made in small batches.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions()),
  component: Index,
});

function Index() {
  return <HomeContent />;
}
