import { queryOptions } from "@tanstack/react-query";
import {
  getCatalog,
  getProduct,
  getCollections,
  getCollection,
  getFeatured,
} from "./ghl.functions";

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

export const collectionsQueryOptions = () =>
  queryOptions({
    queryKey: ["collections"],
    queryFn: () => getCollections(),
    staleTime: 60_000,
    gcTime: 300_000,
  });
export const collectionQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["collection", slug],
    queryFn: () => getCollection({ data: { slug } }),
    staleTime: 60_000,
    gcTime: 300_000,
  });
export const featuredQueryOptions = () =>
  queryOptions({
    queryKey: ["featured"],
    queryFn: () => getFeatured(),
    staleTime: 60_000,
    gcTime: 300_000,
  });
