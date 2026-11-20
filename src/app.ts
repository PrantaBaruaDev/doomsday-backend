import express from 'express';
import cors from 'cors';
import { requestLogger } from './app/middleware/request-logger';
import { errorHandler } from './app/middleware/error-handler';
// import { movieRouter } from './app/module/movie/movie.routes';
// import { cinemaRouter } from './app/module/cinema/cinema.routes';
import { dbHealthBreaker } from './app/lib/circuit-breaker';
import { db } from '@prisma/db';
// import { registerMovieObservers } from './app/module/movie/movie.events';
// import { registerCinemaObservers } from './app/module/cinema/cinema.events';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // wire observers
  // registerMovieObservers();
  // registerCinemaObservers();

  app.get('/health', async (_req, res) => {
    try {
      await dbHealthBreaker.run(async () => {
        await db.orm.public.Movie.all({ take: 1 } as any); 
      });

      res.json({ ok: true, db: 'up', breaker: dbHealthBreaker.getState() });
    } catch (err) {
      res.status(503).json({
        ok: false,
        db: 'down',
        breaker: dbHealthBreaker.getState(),
      });
    }
  });

  // app.use('/api/movies', movieRouter);
  // app.use('/api/cinemas', cinemaRouter);

  app.use(errorHandler);
  return app;
}