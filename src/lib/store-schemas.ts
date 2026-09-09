import { z } from "zod";
export const slugSchema = z.object({ slug: z.string().min(1).max(200) });
export const promoSchema = z.object({
  code: z.string().trim().min(1).max(50),
  subtotal: z.number().finite().min(0).max(1000000),
});
export const cartLinesSchema = z
  .array(
    z.object({
      productId: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),
      variantId: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),
      quantity: z.number().int().min(1).max(99),
    }),
  )
  .min(1)
  .max(20)
  .refine(
    (lines) =>
      new Set(lines.map((line) => `${line.productId}:${line.variantId}`)).size === lines.length,
    "Duplicate cart lines are not allowed",
  );
