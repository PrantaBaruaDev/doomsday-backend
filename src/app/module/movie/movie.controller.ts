import { Request, Response } from 'express';
import { MovieService } from './movie.service';
import { CreateMovieCommand } from './commands/create-movie.command';
import { UpdateMovieCommand } from './commands/update-movie.command';
import { ListMoviesQuery } from './queries/list-movies.query';
import { RewatchOrderQuery } from './queries/rewatch-order.query';
import { CreateMovieInput, UpdateMovieInput } from './movie.schema';

const service = new MovieService();

export const movieController = {
  async create(req: Request, res: Response) {
    const input = (req as any).validatedBody as CreateMovieInput;
    const created = await new CreateMovieCommand(service, input).execute();
    res.status(201).json(created);
  },

  async list(_req: Request, res: Response) {
    const movies = await new ListMoviesQuery(service).execute();
    res.json(movies);
  },

  async update(req: Request, res: Response) {
    const input = (req as any).validatedBody as UpdateMovieInput;
    const updated = await new UpdateMovieCommand(
      service,
      req.params.id as string,
      input,
    ).execute();
    res.json(updated);
  },

  async rewatchOrder(req: Request, res: Response) {
    const result = await new RewatchOrderQuery(service, req.params.id as string).execute();
    res.json(result);
  },
};