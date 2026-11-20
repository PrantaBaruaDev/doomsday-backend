import { eventBus } from '../../lib/event-bus';

export const MovieEvents = {
  CREATED: 'movie.created',
  UPDATED: 'movie.updated',
  WATCHED: 'movie.watched',
  REWATCH_ORDER_GENERATED: 'movie.rewatchOrderGenerated',
} as const;

export function registerMovieObservers(): void {
  // Example observer 1: log watched events
  eventBus.on(MovieEvents.WATCHED, (payload) => {
    // eslint-disable-next-line no-console
    console.debug('[observer] movie watched', payload);
  });

  // Example observer 2: log rewatch-order requests (would be analytics in prod)
  eventBus.on(MovieEvents.REWATCH_ORDER_GENERATED, (payload) => {
    // eslint-disable-next-line no-console
    console.debug('[observer] rewatch order', payload);
  });
}