import { MovieService } from '../movie.service';
import { CreateMovieInput } from '../movie.schema';

export class CreateMovieCommand {
  constructor(
    private readonly service: MovieService,
    private readonly input: CreateMovieInput,
  ) {}

  execute() {
    return this.service.create(this.input);
  }
}