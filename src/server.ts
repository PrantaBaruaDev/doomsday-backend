import { createApp } from './app';
import { config } from './app/lib/config';
import { db } from '@prisma/db';

async function main() {
  const app = createApp();
  const server = app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on :${config.port} (${config.nodeEnv})`);
  });

  const shutdown = async (sig: string) => {
    // eslint-disable-next-line no-console
    console.log(`[server] ${sig} received, shutting down`);
    server.close(async () => {
      try {
        if (typeof (db as any).$disconnect === 'function') {
          await (db as any).$disconnect();
        } else if (typeof (db as any).disconnect === 'function') {
          await (db as any).disconnect();
        }
      } catch (e) {
        console.error("Server Problem Shutdown!");
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] fatal', err);
  process.exit(1);
});