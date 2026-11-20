import { Router } from 'express';
import { movieController } from './movie.controller';
import { validate } from '../../middleware/validate';
import { createMovieSchema, updateMovieSchema } from './movie.schema';
import { wrap } from '../../middleware/decorators';

export const movieRouter = Router();

movieRouter.post(
  '/',
  validate(createMovieSchema, 'body'),
  wrap(movieController.create),
);

movieRouter.get('/', wrap(movieController.list));

movieRouter.patch(
  '/:id',
  validate(updateMovieSchema, 'body'),
  wrap(movieController.update),
);

movieRouter.get('/:id/rewatch-order', wrap(movieController.rewatchOrder));