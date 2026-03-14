import { validateEnv } from './src/config/env.js';

// Validate environment before anything else
validateEnv();

import app from './src/app.js';
import { env } from './src/config/env.js';

// SERVER BOOTSTRAP
const server = app.listen(env.port, env.host, () => {
  console.log(`Server running on http://${env.host}:${env.port}`);
  console.log(`Environment: ${env.nodeEnv}`);
  console.log('Docs: GET /api/docs');
  console.log('Health: GET /health');
});

// GRACEFUL SHUTDOWN
const shutdown = (signal: string) => {
  console.log(`\n${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
