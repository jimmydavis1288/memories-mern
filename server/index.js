import 'dotenv/config';
import { pathToFileURL } from 'node:url';

import app from './app.js';
import { prisma } from './lib/prisma.js';

const startServer = async () => {
  await prisma.$connect();

  const port = process.env.PORT || 5000;
  const server = app.listen(port, () => {
    console.log(`Server Running on Port: http://localhost:${port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().catch(async (error) => {
    console.error('Unable to start API:', error.name || 'Error', error.code || 'NO_CODE');
    await prisma.$disconnect();
    process.exitCode = 1;
  });
}
