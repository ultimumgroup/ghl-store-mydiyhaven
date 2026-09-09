import { createFileRoute } from "@tanstack/react-router";
import { getStoreDiagnostics } from "@/lib/diagnostics.functions";
export const Route = createFileRoute("/store-diagnostics")({
  head: () => ({
    meta: [{ title: "Store diagnostics" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  loader: () => getStoreDiagnostics(),
  component: Diagnostics,
});
function Diagnostics() {
  const data = Route.useLoaderData();
  return (
    <section className="mx-auto max-w-3xl p-6">
      <h1 className="font-display text-3xl">Store diagnostics</h1>
      <p>Public catalog health only. No credentials, customer data or raw upstream responses.</p>
      <pre className="mt-6 overflow-auto rounded-lg bg-muted p-4 text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}
