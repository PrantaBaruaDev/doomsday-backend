import { Request, Response } from 'express';
import { CinemaService } from './cinema.service';
import { CreateCinemaInput } from './cinema.schema';

const service = new CinemaService();

export const cinemaController = {
  async create(req: Request, res: Response) {
    const input = (req as any).validatedBody as CreateCinemaInput;
    const created = await service.create(input);
    res.status(201).json(created);
  },

  async list(_req: Request, res: Response) {
    const cinemas = await service.list();
    res.json(cinemas);
  },

  async getBooking(req: Request, res: Response) {
    const groupSize = (req as any).validatedQuery.groupSize;
    const result = await service.getBookingQuote(req.params.id as string, groupSize);
    res.json(result);
  },
};