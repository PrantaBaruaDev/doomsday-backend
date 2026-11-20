import { NextFunction, Request, Response } from 'express';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export const wrap =
  (fn: AsyncHandler) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const out = await fn(req, res, next);
      if (!res.headersSent && out !== undefined) res.json(out);
    } catch (err) {
      next(err);
    }
  };

export const withTiming =
  (fn: AsyncHandler, label: string): AsyncHandler =>
  async (req, res, next) => {
    const start = Date.now();
    try {
      return await fn(req, res, next);
    } finally {
      // eslint-disable-next-line no-console
      console.debug(`[timing] ${label} ${Date.now() - start}ms`);
    }
  };