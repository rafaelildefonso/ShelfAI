import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const productController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, pageSize = 20, search, categoryId, status } = req.query;
      const where: any = {};
      if (search) {
        where.name = { contains: search };
      }
      if (categoryId) {
        where.categoryId = categoryId;
      }
      if (status) {
        where.status = status;
      }
      const products = await prisma.product.findMany({
        where,
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' },
        include: { user: true }, // Include user relation only
      });
      const total = await prisma.product.count({ where });
      res.json({ data: products, total });
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: { id },
        include: { user: true }, // Include user but not category
      });
      if (!product) return res.status(404).json({ error: { message: 'Produto não encontrado' } });
      res.json(product);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      // Usar userId do token JWT se disponível, caso contrário deixar sem userId
      if (req.user?.userId) {
        data.userId = req.user.userId;
        data.createdById = req.user.userId;
        data.lastEditedById = req.user.userId;
      } else {
        console.warn("Nenhum usuário autenticado encontrado no token!");
      }
      // Não definir userId se não há usuário autenticado
      delete (data as any).user;
    delete (data as any).createdBy;
    delete (data as any).lastEditedBy;

      // Se foi enviado categoryName ao invés de categoryId, criar ou encontrar a categoria
      if (data.categoryName && !data.categoryId) {
        let category = await (prisma as any).category.findUnique({
          where: { name: data.categoryName }
        });

        if (!category) {
          category = await (prisma as any).category.create({
            data: {
              name: data.categoryName,
              description: `Categoria ${data.categoryName}`
            }
          });
        }

        data.categoryId = category.id;
        delete data.categoryName;
      }

      // 🧠 Função auxiliar para validar usuários
    const validateUserId = async (key: string) => {
      if (data[key]) {
        const userExists = await prisma.user.findUnique({
          where: { id: data[key] },
        });
        if (!userExists) {
          console.warn(`${key} inválido, removendo do payload: ${data[key]}`);
          delete data[key];
        }
      }
    };

    // 🔍 Validar IDs relacionados a usuários
    await validateUserId("userId");
    await validateUserId("createdById");
    await validateUserId("lastEditedById");

      const product = await prisma.product.create({ data });
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Usar userId do token JWT se disponível, caso contrário deixar sem userId
      if (req.user?.userId) {
        data.userId = req.user.userId;
      }
      // Não definir userId se não há usuário autenticado

      // Se foi enviado categoryName ao invés de categoryId, criar ou encontrar a categoria
      if (data.categoryName && !data.categoryId) {
        let category = await (prisma as any).category.findUnique({
          where: { name: data.categoryName }
        });

        if (!category) {
          category = await (prisma as any).category.create({
            data: {
              name: data.categoryName,
              description: `Categoria ${data.categoryName}`
            }
          });
        }

        data.categoryId = category.id;
        delete data.categoryName; // Remover o campo que não existe no schema
      }

      const product = await prisma.product.update({ where: { id }, data });
      res.json(product);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.product.delete({ where: { id } });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
};
