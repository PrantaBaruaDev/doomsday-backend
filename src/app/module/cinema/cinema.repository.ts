import { db } from "@/app/lib/db";

export interface CinemaEntity {
  id: string;
  name: string;
  bundleSizes: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class PostgresCinemaRepository {
  async create(data: { name: string; bundleSizes: number[] }): Promise<CinemaEntity> {
    const created = await db.orm.public.Cinema.create({
      name: data.name,
      bundleSizes: data.bundleSizes,
      updatedAt: new Date(),
    });
    return created as CinemaEntity;
  }

  async findAll(): Promise<CinemaEntity[]> {
    const rows = await db.orm.public.Cinema.all();
    return rows as CinemaEntity[];
  }

  async findById(id: string): Promise<CinemaEntity | null> {
    const row = await db.orm.public.Cinema.where({ id }).first();
    return (row as CinemaEntity) || null;
  }

  async findByName(name: string): Promise<CinemaEntity | null> {
    const row = await db.orm.public.Cinema.where({ name }).first();
    return (row as CinemaEntity) || null;
  }
}