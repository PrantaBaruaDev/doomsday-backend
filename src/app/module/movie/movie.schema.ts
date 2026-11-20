import { z } from 'zod';

const title = z.string().trim().min(1).max(200);
const releaseYear = z.number().int().min(1900).max(2100);
const runtimeMinutes = z.number().int().min(1).max(300);
const watched = z.boolean();
const prerequisiteIds = z.array(z.string().uuid()).max(50);

export const createMovieSchema = z.object({
  title,
  releaseYear,
  runtimeMinutes,
  watched: watched.optional().default(false),
  prerequisiteIds: prerequisiteIds.optional().default([]),
});

export const updateMovieSchema = z
  .object({
    title: title.optional(),
    releaseYear: releaseYear.optional(),
    runtimeMinutes: runtimeMinutes.optional(),
    watched: watched.optional(),
    prerequisiteIds: prerequisiteIds.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'At least one field must be provided',
  });

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;