import { PrismaClient } from '@prisma/client';

// Extend PrismaClient to include category model
type PrismaClientWithCategory = PrismaClient & {
  category: {
    findMany: (args?: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  };
};

const prisma = new PrismaClient() as PrismaClientWithCategory;

export default prisma;
