import { createFileRoute } from "@tanstack/react-router";
import { HomeContent } from "@/components/store/home-content";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My DIY Haven | Healing Through Creativity" },
      {
        name: "description",
        content:
          "A veteran-owned creative business founded by Larry Dillon. Shop pens, pen blanks, apparel and gifts, and discover upcoming classes and studio experiences.",
      },
      { property: "og:title", content: "My DIY Haven — Create. Connect. Heal. Belong." },
      {
        property: "og:description",
        content:
          "Meaningful things to make. A welcoming place to belong. Meet Larry, explore the shop, and discover what's coming to the studio.",
      },
      { property: "og:url", content: "https://mydiyhaven.com/" },
    ],
    links: [{ rel: "canonical", href: "https://mydiyhaven.com/" }],
  }),
  component: HomeContent,
});
