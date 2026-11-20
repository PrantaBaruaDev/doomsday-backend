// src/app/module/movie/movie.repository.ts
import { db } from "@/app/lib/db";

export interface MovieEntity {
  id: string;
  title: string;
  releaseYear: number;
  runtimeMinutes: number;
  watched: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  prerequisiteIds: string[];
}

export interface CreateMovieData {
  title: string;
  releaseYear: number;
  runtimeMinutes: number;
  watched: boolean;
  prerequisiteIds?: string[];
}

export interface UpdateMovieData {
  title?: string;
  releaseYear?: number;
  runtimeMinutes?: number;
  watched?: boolean;
  prerequisiteIds?: string[];
}

export class PostgresMovieRepository {
  
  // Helper to format the DB row
  private toEntity(row: any, prereqs: any[] = []): MovieEntity {
    return {
      ...row,
      prerequisiteIds: prereqs.map((p) => p.prerequisiteId),
    };
  }

  async findAll(): Promise<MovieEntity[]> {
    const rows = await db.orm.public.Movie.all();
    // Prisma 8: Fetch all prerequisites to map them manually
    const allPrereqs = await db.orm.public.MoviePrerequisite.all();
    
    return rows.map((row) => {
      const moviePrereqs = allPrereqs.filter((p) => p.movieId === row.id);
      return this.toEntity(row, moviePrereqs);
    });
  }

  async findById(id: string): Promise<MovieEntity | null> {
    const row = await db.orm.public.Movie.where({ id }).first();
    if (!row) return null;
    
    const prereqs = await db.orm.public.MoviePrerequisite.where({ movieId: id }).all();
    return this.toEntity(row, prereqs);
  }

  async findByTitle(title: string): Promise<MovieEntity | null> {
    const row = await db.orm.public.Movie.where({ title }).first();
    if (!row) return null;
    
    const prereqs = await db.orm.public.MoviePrerequisite.where({ movieId: row.id }).all();
    return this.toEntity(row, prereqs);
  }

  async existsByIds(ids: string[]): Promise<Set<string>> {
    if (ids.length === 0) return new Set();
    // Prisma 8 IN clause: we fetch and filter
    const rows = await db.orm.public.Movie.all();
    const existingIds = rows.filter(r => ids.includes(r.id)).map(r => r.id);
    return new Set(existingIds);
  }

  async getEdges(): Promise<Map<string, string[]>> {
    const allPrereqs = await db.orm.public.MoviePrerequisite.all();
    const map = new Map<string, string[]>();
    
    for (const p of allPrereqs) {
      const list = map.get(p.movieId) ?? [];
      list.push(p.prerequisiteId);
      map.set(p.movieId, list);
    }
    return map;
  }

  async create(data: CreateMovieData): Promise<MovieEntity> {
    // 1. Create the movie
    const created = await db.orm.public.Movie.create({
      title: data.title,
      releaseYear: data.releaseYear,
      runtimeMinutes: data.runtimeMinutes,
      watched: data.watched,
      updatedAt: new Date(), // Prisma 8 sometimes requires this explicitly
    });

    // 2. Create prerequisites explicitly (Prisma 8 relation handling)
    let createdPrereqs: any[] = [];
    if (data.prerequisiteIds && data.prerequisiteIds.length > 0) {
      for (const pid of data.prerequisiteIds) {
        const p = await db.orm.public.MoviePrerequisite.create({
          movieId: created.id,
          prerequisiteId: pid,
        });
        createdPrereqs.push(p);
      }
    }

    return this.toEntity(created, createdPrereqs);
  }

  async update(id: string, data: UpdateMovieData): Promise<MovieEntity> {
    // 1. Update the main movie fields
    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.releaseYear !== undefined) updatePayload.releaseYear = data.releaseYear;
    if (data.runtimeMinutes !== undefined) updatePayload.runtimeMinutes = data.runtimeMinutes;
    if (data.watched !== undefined) updatePayload.watched = data.watched;
    
    // Always update timestamp
    updatePayload.updatedAt = new Date();

    const updated = await db.orm.public.Movie.where({ id }).update(updatePayload);

    // 2. Handle prerequisites if they were provided
    if (data.prerequisiteIds !== undefined) {
      // Delete old ones
      const oldPrereqs = await db.orm.public.MoviePrerequisite.where({ movieId: id }).all();
      for (const p of oldPrereqs) {
        await db.orm.public.MoviePrerequisite.where({
          movieId: id,
          prerequisiteId: p.prerequisiteId
        }).delete();
      }
      
      // Create new ones
      for (const pid of data.prerequisiteIds) {
        await db.orm.public.MoviePrerequisite.create({
          movieId: id,
          prerequisiteId: pid,
        });
      }
    }

    // 3. Return the fresh entity
    return (await this.findById(id))!;
  }
}