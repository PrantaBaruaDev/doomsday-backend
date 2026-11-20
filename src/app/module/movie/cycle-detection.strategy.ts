/**
 * Strategy interface for detecting whether adding a prerequisite edge
 * would create a cycle. Only DFS implementation is provided, but the
 * interface lets us swap in e.g. a Kahn-based validator later.
 */
export interface CycleDetectionStrategy {
  wouldCreateCycle(
    movieId: string,
    newPrerequisiteIds: string[],
    edges: Map<string, string[]>,
  ): boolean;
}

/**
 * DFS strategy.
 * Question: starting from each new prerequisite and following the
 * existing prerequisite edges, can we ever reach `movieId`?
 * If yes → cycle.
 */
export class DfsCycleDetectionStrategy implements CycleDetectionStrategy {
  wouldCreateCycle(
    movieId: string,
    newPrerequisiteIds: string[],
    edges: Map<string, string[]>,
  ): boolean {
    if (newPrerequisiteIds.includes(movieId)) return true;

    const visited = new Set<string>();
    const stack = [...newPrerequisiteIds];

    while (stack.length) {
      const current = stack.pop()!;
      if (current === movieId) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      const next = edges.get(current);
      if (next) {
        for (const n of next) stack.push(n);
      }
    }
    return false;
  }
}

export const cycleDetectionStrategy: CycleDetectionStrategy =
  new DfsCycleDetectionStrategy();