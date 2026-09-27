import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { prisma } from './utils/prisma';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connectivity
    await prisma.$connect();
    console.log('[Database] Connected successfully to SQLite database via Prisma ORM.');

    app.listen(PORT, () => {
      console.log(`[Server] NOVA COMMAND backend listening on port ${PORT}`);
      console.log(`[Server] Health check available at: http://localhost:${PORT}/api/system/health`);
      console.log(`[Server] Status check available at: http://localhost:${PORT}/api/system/status`);
    });
  } catch (error) {
    console.error('[Server] Failed to start backend server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
