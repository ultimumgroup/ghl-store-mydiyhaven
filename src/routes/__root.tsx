import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportVibeError } from "../lib/vibe-error-reporting";
import { CartProvider } from "../lib/cart-context";
import { CartUIProvider } from "../lib/cart-ui";
import { PromoProvider } from "../lib/promo-context";
import { Header } from "../components/store/header";
import { Footer } from "../components/store/footer";
import { CartDrawer } from "../components/store/cart-drawer";
import { Toaster } from "@/components/ui/sonner";
import { BRAND_NAME } from "@/lib/brand";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportVibeError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${BRAND_NAME} — Healing Through Creativity` },
      {
        name: "description",
        content:
          "Veteran-owned creative goods, custom work and a welcoming vision for community. Meet founder Larry Dillon and discover My DIY Haven.",
      },
      { name: "author", content: BRAND_NAME },
      { property: "og:title", content: `${BRAND_NAME} — Healing Through Creativity` },
      {
        property: "og:description",
        content: "Create. Connect. Heal. Belong. Veteran-owned My DIY Haven.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "My DIY Haven" },
      { property: "og:image", content: "https://mydiyhaven.com/images/my-diy-haven-round.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/images/my-diy-haven-gold-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://mydiyhaven.com/#organization",
                  name: "My DIY Haven",
                  url: "https://mydiyhaven.com/",
                  logo: "https://mydiyhaven.com/images/my-diy-haven-round.png",
                  slogan: "Healing Through Creativity",
                  founder: { "@id": "https://mydiyhaven.com/about#larry" },
                },
                {
                  "@type": "Person",
                  "@id": "https://mydiyhaven.com/about#larry",
                  name: "Larry Dillon",
                  url: "https://mydiyhaven.com/about",
                  image: "https://mydiyhaven.com/images/larry-dillon-headshot.jpg",
                  jobTitle: "Founder",
                  worksFor: { "@id": "https://mydiyhaven.com/#organization" },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://mydiyhaven.com/#website",
                  name: "My DIY Haven",
                  url: "https://mydiyhaven.com/",
                  publisher: { "@id": "https://mydiyhaven.com/#organization" },
                },
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <CartUIProvider>
          <PromoProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main id="main-content" className="flex-1" tabIndex={-1}>
                {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
                <Outlet />
              </main>
              <Footer />
            </div>
            <CartDrawer />
            <Toaster />
          </PromoProvider>
        </CartUIProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}
