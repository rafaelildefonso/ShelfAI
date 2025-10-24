import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// Extend PrismaClient to include category model
type PrismaClientWithCategory = PrismaClient & {
  category: {
    findMany: (args?: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any>;
    findFirst: (args: any) => Promise<any>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  };
  importTemplate: {
    findMany: (args?: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any>;
    findFirst: (args: any) => Promise<any>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    updateMany: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  };
};

// Debug: in development, print which DATABASE_URL is being used so we can
// quickly detect if Prisma is accidentally connecting to a SQLite file (e.g. file:./dev.db)
if (process.env.NODE_ENV !== 'production') {
  try {
    // keep this concise and safe
    const dbUrl = process.env.DATABASE_URL ?? '<not set>';
    console.log('[prisma] NODE_ENV=', process.env.NODE_ENV);
    console.log('[prisma] DATABASE_URL=', dbUrl);
    if (dbUrl.includes('file:') || dbUrl.endsWith('.db') || dbUrl.includes('sqlite')) {
      console.warn('[prisma][warn] DATABASE_URL looks like SQLite. If you expect Postgres, check your .env');
    }
  } catch (e) {
    // ignore logging errors
  }
}

const prisma = new PrismaClient() as PrismaClientWithCategory;

export default prisma;
