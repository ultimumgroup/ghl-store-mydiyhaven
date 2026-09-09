import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { BRAND_NAME } from "@/lib/brand";
import { getStoreDiagnostics } from "@/lib/diagnostics.functions";

export const Route = createFileRoute("/store-diagnostics")({
  head: () => ({
    meta: [
      { title: `Store Diagnostics — ${BRAND_NAME}` },
      {
        name: "description",
        content: "Read-only health report for the headless e-commerce integration.",
      },
      { property: "og:title", content: `Store Diagnostics — ${BRAND_NAME}` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DiagnosticsPage,
});

function DiagnosticsPage() {
  const runDiag = useServerFn(getStoreDiagnostics);
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["store-diagnostics"],
    queryFn: () => runDiag(),
    staleTime: 0,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Store Diagnostics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Read-only health report for the e-commerce integration. No side effects.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Running diagnostics…</p>}

      {error && (
        <div className="mt-8 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Error running diagnostics: {error.message}
        </div>
      )}

      {data && (
        <div className="mt-8 space-y-6">
          <Section title="Secrets">
            <Row label="GHL_PIT configured" value={data.secrets.GHL_PIT ? "Yes" : "No"} />
            <Row
              label="GHL_LOCATION_ID configured"
              value={data.secrets.GHL_LOCATION_ID ? "Yes" : "No"}
            />
            <Row label="Location ID" value={data.secrets.locationId} mono />
          </Section>

          <Section title="Catalog">
            <Row
              label="Status"
              value={
                <span
                  className={
                    data.catalog.live
                      ? "font-semibold text-primary"
                      : "font-semibold text-destructive"
                  }
                >
                  {data.catalog.live ? "LIVE" : "FALLBACK (demo)"}
                </span>
              }
            />
            {data.catalog.error && <Row label="Error" value={data.catalog.error} />}
            <Row label="Products" value={data.catalog.productCount} />
            <Row label="Collections" value={data.catalog.collectionCount} />
            <Row label="Priced products" value={data.catalog.pricedProductCount} />
            <Row label="Variants (expanded)" value={data.catalog.variantCount} />
            {data.catalog.sampleProduct && (
              <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sample product
                </p>
                <Row label="ID" value={data.catalog.sampleProduct.id} mono />
                <Row label="Name" value={data.catalog.sampleProduct.name} />
                <Row label="Slug" value={data.catalog.sampleProduct.slug} mono />
                <Row
                  label="Price"
                  value={
                    data.catalog.sampleProduct.price > 0
                      ? `$${data.catalog.sampleProduct.price.toFixed(2)}`
                      : "Price on request"
                  }
                />
                {data.catalog.sampleProduct.compareAtPrice != null && (
                  <Row
                    label="Compare-at"
                    value={`$${data.catalog.sampleProduct.compareAtPrice.toFixed(2)}`}
                  />
                )}
                <Row label="Variants" value={data.catalog.sampleProduct.variantCount} />
                <Row label="In stock" value={data.catalog.sampleProduct.inStock ? "Yes" : "No"} />
              </div>
            )}
          </Section>

          <Section title="Promo validation">
            <Row label="Demo codes" value={data.promo.demoCodes.join(", ")} mono />
            <Row
              label="Sample (HAVEN10)"
              value={
                <span
                  className={
                    data.promo.sampleValidation.valid
                      ? "font-semibold text-primary"
                      : "font-semibold text-destructive"
                  }
                >
                  {data.promo.sampleValidation.valid ? "VALID" : "INVALID"}
                </span>
              }
            />
            {data.promo.sampleValidation.message && (
              <Row label="Message" value={data.promo.sampleValidation.message} />
            )}
          </Section>

          <Section title="Payment capability">
            <Row label="Scope granted" value="payments/orders.collectPayment" mono />
            <Row label="Payment endpoint" value="/payments/orders/:orderId/record-payment" mono />
            <Row
              label="Status"
              value={<span className="font-semibold text-primary">Active</span>}
            />
          </Section>

          <p className="text-xs text-muted-foreground">Last run: {data.timestamp}</p>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-3 font-display text-lg font-semibold text-foreground">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right font-medium text-foreground ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}
