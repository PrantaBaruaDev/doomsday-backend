import { eventBus } from '../../lib/event-bus';
import { ErrorFactory } from '../../errors/error-factory';
import {
  MovieEntity,
  PostgresMovieRepository,
} from './movie.repository';
import { cycleDetectionStrategy } from './cycle-detection.strategy';
import { computeRewatchOrder, RewatchOrderResult } from './rewatch-order.service';
import { MovieEvents } from './movie.events';
import { CreateMovieInput, UpdateMovieInput } from './movie.schema';

export class MovieService {
  constructor(
    private readonly repo: PostgresMovieRepository  = new PostgresMovieRepository(),
  ) {}

  async create(input: CreateMovieInput): Promise<MovieEntity> {
    // Title uniqueness (pre-check — DB constraint is the true guard)
    const existing = await this.repo.findByTitle(input.title);
    if (existing) {
      throw ErrorFactory.conflict(
        `Movie with title "${input.title}" already exists`,
        'MOVIE_TITLE_TAKEN',
      );
    }

    // All prerequisites must exist
    if (input.prerequisiteIds?.length) {
      const found = await this.repo.existsByIds(input.prerequisiteIds);
      const missing = input.prerequisiteIds.filter((id) => !found.has(id));
      if (missing.length) {
        throw ErrorFactory.validation(
          { missingPrerequisiteIds: missing },
          'One or more prerequisite movies were not found',
        );
      }
    }

    // A brand-new movie has no dependents yet, so a self-loop is the only cycle
    // possible on create.
    if (input.prerequisiteIds?.includes('')) {
      throw ErrorFactory.validation({}, 'Invalid prerequisite id');
    }

    const created = await this.repo.create(input);
    await eventBus.emit(MovieEvents.CREATED, { id: created.id, title: created.title });
    if (created.watched) {
      await eventBus.emit(MovieEvents.WATCHED, { id: created.id });
    }
    return created;
  }

  async list(): Promise<MovieEntity[]> {
    return this.repo.findAll();
  }

  async update(id: string, input: UpdateMovieInput): Promise<MovieEntity> {
    const current = await this.repo.findById(id);
    if (!current) throw ErrorFactory.notFound('Movie');

    // Uniqueness if title changes
    if (input.title && input.title !== current.title) {
      const existing = await this.repo.findByTitle(input.title);
      if (existing) {
        throw ErrorFactory.conflict(
          `Movie with title "${input.title}" already exists`,
          'MOVIE_TITLE_TAKEN',
        );
      }
    }

    // If prerequisites provided: check existence + cycle
    if (input.prerequisiteIds !== undefined) {
      if (input.prerequisiteIds.includes(id)) {
        // self-dependency
        throw ErrorFactory.circularDependency();
      }
      if (input.prerequisiteIds.length) {
        const found = await this.repo.existsByIds(input.prerequisiteIds);
        const missing = input.prerequisiteIds.filter((x) => !found.has(x));
        if (missing.length) {
          throw ErrorFactory.validation(
            { missingPrerequisiteIds: missing },
            'One or more prerequisite movies were not found',
          );
        }
      }

      const edges = await this.repo.getEdges();
      // Replace current outgoing edges for this movie with the proposed set
      edges.set(id, [...input.prerequisiteIds]);
      const cycle = cycleDetectionStrategy.wouldCreateCycle(
        id,
        input.prerequisiteIds,
        edges,
      );
      if (cycle) throw ErrorFactory.circularDependency();
    }

    const updated = await this.repo.update(id, input);
    await eventBus.emit(MovieEvents.UPDATED, { id });
    if (input.watched === true && current.watched === false) {
      await eventBus.emit(MovieEvents.WATCHED, { id });
    }
    return updated;
  }

  async rewatchOrder(id: string): Promise<RewatchOrderResult> {
    const target = await this.repo.findById(id);
    if (!target) throw ErrorFactory.notFound('Movie');

    const [edges, allMovies] = await Promise.all([
      this.repo.getEdges(),
      this.repo.findAll(),
    ]);
    const moviesById = new Map(allMovies.map((m) => [m.id, m]));

    const result = computeRewatchOrder(id, edges, moviesById);
    await eventBus.emit(MovieEvents.REWATCH_ORDER_GENERATED, {
      movieId: id,
      totalCount: result.totalCount,
    });
    return result;
  }
}