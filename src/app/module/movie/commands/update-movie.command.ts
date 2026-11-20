import { MovieService } from '../movie.service';
import { UpdateMovieInput } from '../movie.schema';

export class UpdateMovieCommand {
  constructor(
    private readonly service: MovieService,
    private readonly id: string,
    private readonly input: UpdateMovieInput,
  ) {}

  execute() {
    return this.service.update(this.id, this.input);
  }
}