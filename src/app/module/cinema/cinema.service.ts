import { ErrorFactory } from '../../errors/error-factory';
import { CinemaEntity, PostgresCinemaRepository } from './cinema.repository';
import { bookingStrategy } from './booking.strategy';
import { CreateCinemaInput } from './cinema.schema';

export class CinemaService {
  constructor(
    private readonly repo: PostgresCinemaRepository = new PostgresCinemaRepository(),
  ) {}

  async create(input: CreateCinemaInput): Promise<CinemaEntity> {
    const existing = await this.repo.findByName(input.name);
    if (existing) {
      throw ErrorFactory.conflict(
        `Cinema with name "${input.name}" already exists`,
        'CINEMA_NAME_TAKEN',
      );
    }
    return this.repo.create(input);
  }

  async list(): Promise<CinemaEntity[]> {
    return this.repo.findAll();
  }

  async getBookingQuote(id: string, groupSize: number) {
    const cinema = await this.repo.findById(id);
    if (!cinema) throw ErrorFactory.notFound('Cinema');
    
    return bookingStrategy.quote(cinema.bundleSizes, groupSize);
  }
}