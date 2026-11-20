#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/ef96f24a0ffd443695e8f72d956de8adc16e3aee560e5e2f77c5f45305d183ec/contract';
import endContract from '../../snapshots/ef96f24a0ffd443695e8f72d956de8adc16e3aee560e5e2f77c5f45305d183ec/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Cinema',
        columns: [
          col('bundleSizes', 'int4[]', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1', many: true },
          }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Cinema_bundleSizes_elem_not_null_eadec4c0',
            sql`array_position("bundleSizes", NULL) IS NULL`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Movie',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('releaseYear', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('runtimeMinutes', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('watched', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'MoviePrerequisite',
        columns: [
          col('movieId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('prerequisiteId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['movieId', 'prerequisiteId'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Cinema',
        constraint: 'Cinema_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Movie',
        constraint: 'Movie_title_key',
        columns: ['title'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'MoviePrerequisite',
        index: 'MoviePrerequisite_movieId_idx_8cb9f9db',
        columns: ['movieId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'MoviePrerequisite',
        index: 'MoviePrerequisite_prerequisiteId_idx_5e30fd01',
        columns: ['prerequisiteId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'MoviePrerequisite',
        foreignKey: {
          name: 'MoviePrerequisite_movieId_fkey',
          columns: ['movieId'],
          references: { schema: 'public', table: 'Movie', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'MoviePrerequisite',
        foreignKey: {
          name: 'MoviePrerequisite_prerequisiteId_fkey',
          columns: ['prerequisiteId'],
          references: { schema: 'public', table: 'Movie', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
