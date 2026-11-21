export interface BookingResult {
  possible: boolean;
  totalBundles?: number;
  bundles?: { size: number; count: number }[];
  reason?: string;
}

export interface BookingStrategy {
  quote(bundleSizes: number[], groupSize: number): BookingResult;
}

export class DpMinBundlesStrategy implements BookingStrategy {
  quote(bundleSizes: number[], groupSize: number): BookingResult {
    // Sort descending to prefer larger bundles on ties
    const sizes = [...new Set(bundleSizes)].sort((a, b) => b - a);
    const INF = Infinity;
    
    // dp[s] = min bundles to reach exactly s
    const dp = new Array(groupSize + 1).fill(INF);
    const pick = new Array(groupSize + 1).fill(-1); 
    dp[0] = 0;

    for (let s = 1; s <= groupSize; s++) {
      for (const b of sizes) {
        if (s - b >= 0 && dp[s - b] + 1 < dp[s]) {
          dp[s] = dp[s - b] + 1;
          pick[s] = b;
        }
      }
    }

    if (dp[groupSize] === INF) {
      return { possible: false, reason: 'NO_EXACT_COMBINATION' };
    }

    // Reconstruct the bundles
    const counts = new Map<number, number>();
    let current = groupSize;
    while (current > 0) {
      const b = pick[current];
      counts.set(b, (counts.get(b) ?? 0) + 1);
      current -= b;
    }

    const bundles = Array.from(counts.entries())
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => b.size - a.size);

    return {
      possible: true,
      totalBundles: dp[groupSize],
      bundles,
    };
  }
}

export const bookingStrategy = new DpMinBundlesStrategy();