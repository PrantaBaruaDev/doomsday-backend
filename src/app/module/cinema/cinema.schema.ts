import { z } from 'zod';

export const createCinemaSchema = z.object({
  name: z.string().trim().min(1).max(200),
  bundleSizes: z
    .array(z.number().int().min(1).max(500))
    .min(1)
    .max(10)
    .refine((arr) => new Set(arr).size === arr.length, {
      message: 'Bundle sizes must be unique',
    }),
});

export const bookingQuerySchema = z.object({
  groupSize: z.coerce.number().int().min(1).max(10000),
});

export type CreateCinemaInput = z.infer<typeof createCinemaSchema>;