import { eventBus } from '../../lib/event-bus';

export const CinemaEvents = {
  CREATED: 'cinema.created',
} as const;

export function registerCinemaObservers(): void {
  eventBus.on(CinemaEvents.CREATED, (payload) => {
    console.debug('[observer] cinema created', payload);
  });
}