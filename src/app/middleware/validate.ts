import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema, source: 'body' | 'query' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(source === 'body' ? req.body : req.query);
      (req as any)[source === 'body' ? 'validatedBody' : 'validatedQuery'] = parsed;
      next();
    } catch (err) {
      next(err);
    }
  };