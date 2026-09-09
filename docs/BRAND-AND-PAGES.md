# My DIY Haven — brand and page implementation

## Direction

The site now centers Larry Dillon's supplied story and the existing brand promise, **Healing Through Creativity**. The tone is welcoming, personal and grounded in making. It serves the online shop while introducing the larger studio/community vision. It does not describe crafting as a medical treatment or promise outcomes.

The supplied colorful handprint wordmark anchors the header. Gold variants appear on the deeper olive surfaces and in restrained accents. The round mark and all supplied alternatives are retained for future applications. The palette combines warm paper `#FAF7F0`, olive `#303B2D`, walnut ink `#292D24`, clay `#814C37`, linen `#EEEADF`, and highlight gold `#DFBB6B`. Gold is used on dark surfaces or as decoration, not low-contrast body text on ivory. DM Serif Display supplies an approachable editorial heading style; DM Sans provides readable navigation and body copy.

We considered a rotating hero and a static hero. A single full-bleed woodturning photo with an olive overlay was selected: the message stays stable, there are no autoplay controls or motion demands, and the image relates directly to Larry's origin story. Candle-making imagery introduces the future studio. Both photos are illustrative licensed stock, not representations of Larry's actual space; replace them with real shop images when available. See IMAGE-SOURCES.md.

## Pages and navigation

- `/`: mission-led hero, purpose strip, shop/collection paths, live product preview, Larry introduction, upcoming classes/studio and belonging CTA.
- `/about`: Larry's supplied military/teaching/coaching history, personal woodturning experience, people-first mission and portrait.
- `/studio`: future candle/soap classes, open studio and private events; clear coming-soon status and visible FAQs. No invented hours, dates, fees, addresses, booking forms or confirmations.
- `/products`, `/collections`, detail routes: existing live GHL shopping experience with corrected product-derived metadata and canonical URLs.

Global navigation now links to actual pages, including an expandable mobile menu. Within-page story/offerings anchors remain where they are useful; old global home-anchor navigation is gone. Footer links are real destinations rather than placeholder policy labels. The understated Ultimum wordmark treatment follows shared site references and links to `https://ultimumgroup.com/solutions/dev/smart-websites`.

The home story renders without waiting for a full GHL catalog crawl. Its optional product preview fetches after hydration and provides a catalog link if unavailable. Catalog/detail pages retain server-rendered product content. This choice preserves fast access to the brand message without introducing fake product content.

## Assets

Moved Larry's original headshot and six supplied brand PNGs from Downloads into `public/images/`. Originals are preserved; headshot cropping is CSS only with a circular frame. The PIT-scope screenshot was moved into `docs/reference/`, outside public web assets. Local Ultimum SVG copied from the shared starter. No credential values are included in these artifacts.

## SEO/GEO

The supplied bio is the source for Larry's history. The current Shopify homepage was reviewed at https://mydiyhaven.com/ and supports the existing veteran-owned shop context; the new content follows the broader vision supplied in this conversation. The Shopify integration import is acknowledged as the product source. This pass does not claim a line-by-line Shopify/Etsy migration reconciliation or add unsupported review/sales statistics.

Pages have unique titles/descriptions and canonical URLs. Global Organization, Person and WebSite structured data connects Larry and My DIY Haven. Product schema reflects live catalog data and omits fabricated ratings. Product/collection misses return real 404 responses. Upcoming experiences have no Event schema because dates/booking details are not announced. No invented street address, opening hours or local service area appears in structured data.

`public/sitemap.xml` includes 195 canonical URLs generated from the live published products and named collections plus the five main pages. Regenerate with `python3 scripts/generate-sitemap.py` after catalog changes or before deployment; the static sitemap is not a webhook-driven sync. Robots advertises the canonical sitemap. Cart/review/diagnostic pages retain noindex metadata. Protect staging via deployment controls; canonical tags do not make a staging site private.

See SEO-LAUNCH.md for remaining policy, redirects, attribution and paid-checkout launch work. Payment remains disabled pending the invoice experiment described in CHECKOUT-OPTIONS.md. No customer-facing reservation capture was added because there is no configured calendar/form destination yet.

## Review and validation

The site stays on the GHL AI Studio TanStack Start/React stack. Tests cover TypeScript, adapter/cart contracts, production build, desktop/mobile navigation, no horizontal overflow, portrait/assets loading, canonical/schema validity and meaningful page content with JavaScript disabled. Screenshots are under ignored `test-results/` for local visual review.

Before launch: add actual shop photography, confirm visit/contact information and policies, set up and link the GHL event/calendar experience, finalize paid checkout, confirm domain routing and Shopify redirects, and test the deployed AI Studio runtime. This pass creates local reviewable pages and assets; it does not deploy them.
