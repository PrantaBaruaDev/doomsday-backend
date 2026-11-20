export type EventHandler = (payload: any) => void | Promise<void>;

export class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  on(event: string, handler: EventHandler): void {
    const list = this.handlers.get(event) ?? [];
    list.push(handler);
    this.handlers.set(event, list);
  }

  async emit(event: string, payload: unknown): Promise<void> {
    const list = this.handlers.get(event) ?? [];
    for (const handler of list) {
      try {
        await handler(payload);
      } catch (err) {
        // Observers must not break the emitter.
        // eslint-disable-next-line no-console
        console.error(`[event-bus] handler failed for "${event}"`, err);
      }
    }
  }
}

export const eventBus = new EventBus();