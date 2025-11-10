import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../prisma/client.js';
import { activityService } from '../services/activityService.js';

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

      // Get default categories (where userId is null) and user's custom categories
      const [defaultCategories, userCategories] = await Promise.all([
        prisma.category.findMany({
          where: { isDefault: true },
          orderBy: { name: 'asc' },
          include: { 
            products: { select: { id: true, name: true } } 
          },
        }),
        prisma.category.findMany({
          where: { 
            userId,
            isDefault: false
          },
          orderBy: { name: 'asc' },
          include: { 
            products: { select: { id: true, name: true } } 
          },
        })
      ]);

      // Combine both lists, marking default categories
      const categories = [
        ...defaultCategories.map(cat => ({ ...cat, isDefault: true })),
        ...userCategories.map(cat => ({ ...cat, isDefault: false }))
      ];

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
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      // Validate request body
      const validation = categorySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation error',
            details: validation.error.issues,
          },
        });
      }

      const data: CategoryInput & { isDefault?: boolean } = validation.data;

      // Only admins can create default categories
      if (data.isDefault) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true }
        });

        if (user?.role !== 'ADMIN') {
          return res.status(403).json({
            error: {
              code: 'FORBIDDEN',
              message: 'Only administrators can create default categories',
            },
          });
        }
      }

      // For default categories, check for existing default with same name
      // For user categories, check for existing category with same name for this user or in default
      const existingCategory = await prisma.category.findFirst({
        where: data.isDefault
          ? { name: data.name, isDefault: true }
          : {
              OR: [
                { name: data.name, userId },
                { name: data.name, isDefault: true } // Prevent duplicate names with default categories
              ]
            },
      });

      if (existingCategory) {
        return res.status(409).json({
          error: {
            code: 'DUPLICATE_CATEGORY',
            message: 'A category with this name already exists',
          },
        });
      }

      // Create new category
      const category = await prisma.category.create({
        data: {
          name: data.name,
          description: data.description,
          isDefault: data.isDefault || false,
          userId: data.isDefault ? null : userId, // Default categories have no user
        },
      });

      // Log activity
      await activityService.create({
        userId,
        type: 'system',
        action: 'create',
        entityType: 'CATEGORY',
        entityId: category.id,
        title: `Categoria ${category.isDefault ? 'Padrão ' : ''}Criada`,
        description: `Categoria "${category.name}" foi criada`,
        status: 'success'
      });

      res.status(201).json(category);
    } catch (err) {
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
