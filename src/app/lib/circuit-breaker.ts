type State = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  threshold: number;
  resetMs: number;
  name?: string;
}

export class CircuitOpenError extends Error {
  constructor(name: string) {
    super(`Circuit "${name}" is OPEN`);
    this.name = 'CircuitOpenError';
  }
}

export class CircuitBreaker<T = unknown> {
  private state: State = 'CLOSED';
  private failures = 0;
  private openedAt = 0;
  private readonly name: string;

  constructor(private readonly opts: CircuitBreakerOptions) {
    this.name = opts.name ?? 'default';
  }

  async run(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.openedAt >= this.opts.resetMs) {
        this.state = 'HALF_OPEN';
      } else {
        throw new CircuitOpenError(this.name);
      }
    }
    try {
      const result = await fn();
      this.failures = 0;
      this.state = 'CLOSED';
      return result;
    } catch (err) {
      this.failures += 1;
      if (this.failures >= this.opts.threshold) {
        this.state = 'OPEN';
        this.openedAt = Date.now();
      }
      throw err;
    }
  }

  getState(): State {
    return this.state;
  }
}

// Shared breaker used to guard DB health probes.
export const dbHealthBreaker = new CircuitBreaker({
  name: 'db-health',
  threshold: 5,
  resetMs: 10_000,
});