import { queryOptions } from "@tanstack/react-query";
import { getCatalog, getProduct } from "./ghl.functions";

export const catalogQueryOptions = () =>
  queryOptions({
    queryKey: ["catalog"],
    queryFn: () => getCatalog(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

export const productQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProduct({ data: { slug } }),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
