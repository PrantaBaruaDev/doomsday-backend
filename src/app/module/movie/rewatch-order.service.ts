import { MovieEntity } from './movie.repository';

export interface RewatchOrderEntry {
  id: string;
  title: string;
  releaseYear: number;
  runtimeMinutes: number;
  watched: boolean;
}

export interface RewatchOrderResult {
  targetMovieId: string;
  order: RewatchOrderEntry[];
  watchedCount: number;
  totalCount: number;
  unwatchedRuntimeMinutes: number;
}

/**
 * Pure function: no DB, no Prisma.
 *
 * @param targetId    the movie whose prerequisites we're collecting
 * @param edges       movieId -> prerequisiteIds (from repository)
 * @param moviesById  lookup for movie metadata
 */
export function computeRewatchOrder(
  targetId: string,
  edges: Map<string, string[]>,
  moviesById: Map<string, MovieEntity>,
): RewatchOrderResult {
  // 1) Collect all ancestors of target (exclusive) via DFS upward.
  const ancestors = new Set<string>();
  const stack = [...(edges.get(targetId) ?? [])];
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur === targetId) continue;
    if (ancestors.has(cur)) continue;
    ancestors.add(cur);
    for (const p of edges.get(cur) ?? []) stack.push(p);
  }

  // 2) Build in-degree + child adjacency inside the subgraph.
  const indeg = new Map<string, number>();
  const children = new Map<string, string[]>();
  for (const id of ancestors) {
    indeg.set(id, 0);
    children.set(id, []);
  }
  for (const id of ancestors) {
    for (const p of edges.get(id) ?? []) {
      if (!ancestors.has(p)) continue;
      indeg.set(id, (indeg.get(id) ?? 0) + 1);
      children.get(p)!.push(id);
    }
  }

  // 3) Deterministic tie-break: earlier release year, then id.
  const cmp = (a: string, b: string): number => {
    const ma = moviesById.get(a)!;
    const mb = moviesById.get(b)!;
    if (ma.releaseYear !== mb.releaseYear) {
      return ma.releaseYear - mb.releaseYear;
    }
    return ma.id.localeCompare(mb.id);
  };

  const ready: string[] = [];
  for (const [id, d] of indeg) if (d === 0) ready.push(id);

  const ordered: RewatchOrderEntry[] = [];
  while (ready.length) {
    ready.sort(cmp);
    const cur = ready.shift()!;
    const movie = moviesById.get(cur)!;
    ordered.push({
      id: movie.id,
      title: movie.title,
      releaseYear: movie.releaseYear,
      runtimeMinutes: movie.runtimeMinutes,
      watched: movie.watched,
    });
    for (const child of children.get(cur)!) {
      indeg.set(child, indeg.get(child)! - 1);
      if (indeg.get(child) === 0) ready.push(child);
    }
  }

  if (ordered.length !== ancestors.size) {
    // Should never happen if writes are validated, but keep as a safety net.
    throw new Error('Cycle detected while computing rewatch order');
  }

  const watchedCount = ordered.filter((m) => m.watched).length;
  const unwatchedRuntimeMinutes = ordered
    .filter((m) => !m.watched)
    .reduce((sum, m) => sum + m.runtimeMinutes, 0);

  return {
    targetMovieId: targetId,
    order: ordered,
    watchedCount,
    totalCount: ordered.length,
    unwatchedRuntimeMinutes,
  };
}