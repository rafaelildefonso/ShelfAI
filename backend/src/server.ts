// Load environment variables as early as possible
import 'dotenv/config';

// Initialize Prisma client first
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import app from './app.js';

const PORT = process.env.PORT || 3001;

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`ShelfAI backend running on http://localhost:${PORT}`);
});