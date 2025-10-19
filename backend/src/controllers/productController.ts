import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const productController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, pageSize = 20, search, categoryId, status } = req.query;
      const where: any = {};

      // 🔒 FILTRO DE SEGURANÇA: Usuários só podem ver seus próprios produtos
      if (req.user?.userId) {
        where.userId = req.user.userId;
      } else {
        // Se não há usuário autenticado, retorna lista vazia
        return res.json({ data: [], total: 0 });
      }

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
      const { id } = req.params; // Obter o ID do produto dos parâmetros da URL
      const product = await prisma.product.findUnique({
        where: { id },
        include: { user: true }, // Include user but not category
      });

      if (!product) return res.status(404).json({ error: { message: 'Produto não encontrado' } });

      // 🔒 VERIFICAÇÃO DE SEGURANÇA: Usuário só pode ver produtos que ele mesmo criou
      if (req.user?.userId && product.userId !== req.user.userId) {
        return res.status(403).json({ error: { message: 'Acesso negado. Você só pode ver seus próprios produtos.' } });
      }

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
          res.status(400).json({ error: { message: `Usuário com ID ${data[key]} não existe` } });
        }
      }
    };

    // 🔍 Validar IDs relacionados a usuários
    await validateUserId("userId");

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

      // 🔒 Primeiro, verificar se o produto existe e pertence ao usuário
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        return res.status(404).json({ error: { message: 'Produto não encontrado' } });
      }

      // 🔒 VERIFICAÇÃO DE SEGURANÇA: Usuário só pode editar produtos que ele mesmo criou
      if (req.user?.userId && existingProduct.userId !== req.user.userId) {
        return res.status(403).json({ error: { message: 'Acesso negado. Você só pode editar seus próprios produtos.' } });
      }

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

      // 🔒 Primeiro, verificar se o produto existe e pertence ao usuário
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        return res.status(404).json({ error: { message: 'Produto não encontrado' } });
      }

      // 🔒 VERIFICAÇÃO DE SEGURANÇA: Usuário só pode excluir produtos que ele mesmo criou
      if (req.user?.userId && existingProduct.userId !== req.user.userId) {
        return res.status(403).json({ error: { message: 'Acesso negado. Você só pode excluir seus próprios produtos.' } });
      }

      await prisma.product.delete({ where: { id } });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
};
