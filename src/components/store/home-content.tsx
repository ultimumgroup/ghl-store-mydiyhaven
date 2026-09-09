import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Truck, Leaf, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { HERO_IMAGE } from "@/lib/catalog";
import { BRAND_NAME } from "@/lib/brand";
import { catalogQueryOptions } from "@/lib/catalog-query";

export function HomeContent() {
  const { data } = useSuspenseQuery(catalogQueryOptions());
  const products = data.products;
  const featured = products.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-20">
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center rounded-full bg-accent/60 px-3 py-1 text-xs font-medium text-accent-foreground">
              Handmade in small batches
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
              Objects made slowly, meant to last a lifetime.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              {BRAND_NAME} is a studio of ceramicists, weavers, and woodworkers. Every piece is
              shaped by hand and finished with intention — for a home that feels gathered, not
              furnished.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#shop">
                  Shop the collection <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#story">Our story</a>
              </Button>
            </div>
            <div className="mt-10 flex gap-8">
              <div>
                <p className="font-display text-2xl font-bold text-foreground">12k+</p>
                <p className="text-xs text-muted-foreground">Homes warmed</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-foreground">4.8★</p>
                <p className="text-xs text-muted-foreground">Avg. rating</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-foreground">100%</p>
                <p className="text-xs text-muted-foreground">Handmade</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-xl shadow-primary/10">
              <img
                src={HERO_IMAGE}
                alt="Handcrafted ceramic home goods in warm earthy tones"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border bg-card p-4 shadow-lg sm:block">
              <p className="font-display text-sm font-semibold text-foreground">Free shipping</p>
              <p className="text-xs text-muted-foreground">on orders over $150</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            {
              icon: HandHeart,
              title: "Made by hand",
              text: "Each piece shaped and finished by a single maker.",
            },
            {
              icon: Leaf,
              title: "Natural materials",
              text: "Clay, wool, linen, and walnut — nothing synthetic.",
            },
            {
              icon: Truck,
              title: "Shipped with care",
              text: "Plastic-free packaging, carbon-neutral delivery.",
            },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-foreground">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product grid */}
      <section id="shop" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              The collection
            </h2>
            <p className="mt-2 text-muted-foreground">
              {products.length} pieces, each made in limited quantities.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Story */}
      <section id="story" className="border-t border-border bg-secondary/30">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              Our story
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              A studio built around the maker's hand.
            </h2>
            <p className="mt-4 text-muted-foreground">
              We began as a single pottery wheel in a converted barn. Today, {BRAND_NAME} is a
              collective of artisans who believe that the objects we live with should carry the mark
              of the person who made them — the slight imperfections, the warmth of a hand-formed
              edge, the patience of a slow process.
            </p>
            <p className="mt-4 text-muted-foreground">
              Nothing here is mass-produced. When a piece sells out, it returns only when the maker
              has time to make it again.
            </p>
          </div>
          <div id="craft" className="grid grid-cols-2 gap-4">
            {products.slice(2, 6).map((p) => (
              <Link
                key={p.id}
                to="/products/$slug"
                params={{ slug: p.slug }}
                className="overflow-hidden rounded-xl"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
