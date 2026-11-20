import { MovieService } from '../movie.service';

export class ListMoviesQuery {
  constructor(private readonly service: MovieService) {}

  execute() {
    return this.service.list();
  }
}