import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTestData(req: Request, res: Response, next: NextFunction) {
  try {
    // Cria categorias
    const cat1 = await (prisma as any).category.upsert({
      where: { name: 'Eletrônicos' },
      update: {},
      create: { name: 'Eletrônicos', description: 'Produtos eletrônicos' },
    });
    
    const cat2 = await (prisma as any).category.upsert({
      where: { name: 'Moda' },
      update: {},
      create: { name: 'Moda', description: 'Roupas e acessórios' },
    });
    
    // Cria usuário
    const user = await (prisma as any).user.upsert({
      where: { email: 'admin@shelfai.com' },
      update: {},
      create: {
        name: 'Admin',
        email: 'admin@shelfai.com',
        password: 'admin123',
        role: 'admin',
      },
    });
    
    // Cria produtos
    await (prisma as any).product.createMany({
      data: [
        {
          name: 'Smartphone X',
          description: 'Celular topo de linha',
          price: 3500,
          status: 'complete',
          categoryId: cat1.id,
          userId: user.id,
          tags: ['eletrônico', 'celular'],
        },
        {
          name: 'Camiseta Básica',
          description: '100% algodão',
          price: 39.9,
          status: 'complete',
          categoryId: cat2.id,
          userId: user.id,
          tags: ['moda', 'roupa'],
        },
      ],
      skipDuplicates: true,
    });
    
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
