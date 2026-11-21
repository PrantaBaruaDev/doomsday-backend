import { Router } from 'express';
import { cinemaController } from './cinema.controller';
import { validate } from '../../middleware/validate';
import { createCinemaSchema, bookingQuerySchema } from './cinema.schema';
import { wrap } from '../../middleware/decorators';

export const cinemaRouter = Router();

cinemaRouter.post(
  '/',
  validate(createCinemaSchema, 'body'),
  wrap(cinemaController.create),
);

cinemaRouter.get('/', wrap(cinemaController.list));

cinemaRouter.get(
  '/:id/booking',
  validate(bookingQuerySchema, 'query'),
  wrap(cinemaController.getBooking),
);