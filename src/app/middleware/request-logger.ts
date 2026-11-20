import pinoHttp from 'pino-http';
import pino from 'pino';
import { config } from '../lib/config';

export const logger = pino({
  level: config.logLevel,
  transport:
    config.nodeEnv === 'development' ? { target: 'pino-pretty' } : undefined,
});

export const requestLogger = pinoHttp({ logger });