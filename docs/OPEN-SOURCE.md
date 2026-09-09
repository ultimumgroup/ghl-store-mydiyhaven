# Open-source recommendation

Prepared September 9, 2026.

Use MIT for Ultimum's reusable storefront code. It permits commercial use, modification, sublicensing and resale while requiring preservation of the copyright and license notice. Agencies can build closed client implementations. It does not require a visible website credit. The standard grant is in [LICENSE](../LICENSE); assets and upstream packages are covered in [third-party notices](../THIRD_PARTY_NOTICES.md). Source: [OSI MIT license](https://opensource.org/license/mit).

Apache 2.0 is another permissive choice, with an explicit contributor patent grant and patent-litigation termination provision. It adds notice obligations and expressly excludes trademark permission. Choose it if that patent language becomes a priority for a larger contributor ecosystem. MIT is simpler for this storefront. Source: [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.html).

## Product direction

Publish this as an early GHL storefront reference implementation. Catalog, variants, collection membership, stock-aware cart persistence and server-authoritative quotes are implemented. Paid checkout, tax, shipping calculation, coupon redemption and order placement are not implemented. Do not describe it as a complete Shopify replacement yet.

Keep the reusable GHL adapter, cart contracts, tests and UI available to agencies. Sell deployment, migration, store design, monitoring and support. The versioned AI Studio transfer bridge and managed custom-product studio could become separate paid services. MIT also allows competitors to sell their forks; distribution and trust must support the commercial model.

Larry's repository can remain a concrete example. After the API contracts and checkout are proven, extract a neutral starter with a single store configuration file, replacement assets, neutral metadata and a guided secret setup. Maintain this storefront as a consumer of that starter so fixes do not require separate manual implementations.

## Before promoting it as a general template

- Resolve the GHL export and build-package licensing questions in the notices. Public npm availability alone is not a redistribution license.
- Publish a clean neutral template without client biography, logos, historical product URLs, scope screenshots or customer/order exports.
- Add contribution guidance, a private security reporting route and supported runtime versions. Keep fixtures synthetic and live API tests read-only.
- Verify a real hosted checkout, including stock, tax, shipping and failure recovery, before promising purchase completion.
- Document what works in AI Studio hosting versus an independent host. The successful GitHub-to-AI-Studio import reported by the owner is useful evidence; it is not a documented bidirectional sync contract.

Making the repository private later does not recall copies already downloaded or remove rights already granted under MIT. Treat public releases as persistent. Keep future proprietary bridge/service code in a separate private repository if needed.

## README presentation

The README includes an actual desktop screenshot from the tested local storefront. The branded image illustrates this implementation and is excluded from the code license. A mobile collection screenshot also shows the current directory. Add a short demo after hosted performance and checkout status are verified. Keep screenshots free of tokens, account identifiers, customer details and browser administration panels.
