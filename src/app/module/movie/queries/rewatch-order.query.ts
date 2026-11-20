import { MovieService } from '../movie.service';

export class RewatchOrderQuery {
  constructor(
    private readonly service: MovieService,
    private readonly movieId: string,
  ) {}

  execute() {
    return this.service.rewatchOrder(this.movieId);
  }
}