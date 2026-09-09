import { createFileRoute, Link } from "@tanstack/react-router";
export const Route = createFileRoute("/order-confirmation")({
  head: () => ({
    meta: [
      { title: "Order status — My DIY Haven" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-3xl">No verified order to display</h1>
      <p className="my-6">
        A reference in a link does not confirm an order or payment. Your saved cart is available for
        review.
      </p>
      <Link to="/checkout" className="underline">
        Review cart
      </Link>
    </section>
  ),
});
