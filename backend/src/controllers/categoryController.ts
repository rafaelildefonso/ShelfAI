import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../prisma/client.js';
import { activityService } from '../services/activityService';

// Schema for category validation
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type CategoryInput = z.infer<typeof categorySchema>;

export const categoryController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const categories = await prisma.category.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
        include: { 
          products: {
            select: { id: true, name: true }
          } 
        },
      });
      res.json(categories);
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          products: {
            select: { id: true, name: true, price: true }
          }
        },
      });

      if (!category) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found'
          }
        });
      }

      // 🔒 VERIFICAÇÃO DE SEGURANÇA: Usuário só pode ver categorias que ele mesmo criou
      if (category.userId !== userId) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Acesso negado. Você só pode ver suas próprias categorias.',
          },
        });
      }

      res.json(category);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2023') {
          return res.status(400).json({
            error: {
              code: 'INVALID_ID',
              message: 'Invalid category ID format'
            }
          });
        }
      }
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = categorySchema.parse(req.body);
      
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      // Check if category with same name exists for this user
      const existingCategory = await prisma.category.findUnique({
        where: { 
          name_userId: {
            name: data.name,
            userId: userId
          }
        },
      });
      
      if (existingCategory) {
        return res.status(409).json({
          error: {
            code: 'DUPLICATE_NAME',
            message: 'A category with this name already exists',
          },
        });
      }
      
      const category = await prisma.category.create({ 
        data: {
          ...data,
          userId
        },
        include: { products: false },
      });
      
      // Registrar atividade
      await activityService.logCategoryActivity(
        userId,
        'create',
        category.id,
        category.name
      );
      
      res.status(201).json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: err.issues,
          },
        });
      }
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: Partial<CategoryInput> = categorySchema.partial().parse(req.body);
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      // Check if category exists and belongs to user
      const existingCategory = await prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found',
          },
        });
      }

      // 🔒 VERIFICAÇÃO DE SEGURANÇA: Usuário só pode editar categorias que ele mesmo criou
      if (existingCategory.userId !== userId) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Acesso negado. Você só pode editar suas próprias categorias.',
          },
        });
      }

      // If name is being updated, check for duplicates within user's categories
      if (data.name && data.name !== existingCategory.name) {
        const nameExists = await prisma.category.findFirst({
          where: {
            name: data.name,
            userId: userId
          },
        });

        if (nameExists) {
          return res.status(409).json({
            error: {
              code: 'DUPLICATE_NAME',
              message: 'Você já possui uma categoria com este nome',
            },
          });
        }
      }

      const category = await prisma.category.update({
        where: { id },
        data,
        include: { products: false },
      });

      // Registrar atividade
      await activityService.logCategoryActivity(
        userId,
        'update',
        category.id,
        category.name
      );

      res.json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: err.issues,
          },
        });
      }
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      // Check if category exists and belongs to user
      const category = await prisma.category.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
      });

      if (!category) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Category not found',
          },
        });
      }

      // VERIFICAÇÃO DE SEGURANÇA: Usuário só pode excluir categorias que ele mesmo criou
      if (category.userId !== userId) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Acesso negado. Você só pode excluir suas próprias categorias.',
          },
        });
      }

      if (category._count.products > 0) {
        return res.status(400).json({
          error: {
            code: 'CATEGORY_IN_USE',
            message: 'Cannot delete category that has associated products',
            productCount: category._count.products,
          },
        });
      }

      const categoryName = category.name;
      await prisma.category.delete({ where: { id } });

      // Registrar atividade
      await activityService.logCategoryActivity(
        userId,
        'delete',
        id,
        categoryName
      );

      res.status(204).send();
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          return res.status(404).json({
            error: {
              code: 'NOT_FOUND',
              message: 'Category not found',
            },
          });
        }
      }
      next(err);
    }
  },
};
