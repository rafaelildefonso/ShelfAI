import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { activityService } from '../services/activityService.js';

const prisma = new PrismaClient();

interface CategoryInput {
  name: string;
  description?: string;
}

// Schema for bulk category creation
const bulkCategorySchema = {
  categories: [
    {
      name: String,
      description: { type: String, optional: true }
    }
  ]
} as const;

export const adminCategoryController = {
  async createDefault(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;

      // Check if category with same name already exists
      const existingCategory = await prisma.category.findFirst({
        where: { 
          name,
          isDefault: true 
        },
      });

      if (existingCategory) {
        return res.status(400).json({
          error: 'Já existe uma categoria padrão com este nome',
        });
      }

      // Para categorias padrão, associamos ao usuário admin ou deixamos sem usuário
      const categoryData: any = {
        name,
        description,
        isDefault: true,
      };

      // Se houver um usuário autenticado, associamos a ele
      if (req.user?.userId) {
        categoryData.user = {
          connect: { id: req.user.userId }
        };
      }

      const category = await prisma.category.create({
        data: categoryData,
      });

      // Log activity
      if (req.user?.userId) {
        await activityService.create({
          userId: req.user.userId,
          type: 'system',
          action: 'create',
          entityType: 'DEFAULT_CATEGORY',
          entityId: category.id,
          title: 'Categoria Padrão Criada',
          description: `Categoria padrão "${category.name}" foi criada`,
          status: 'success'
        });
      }

      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  },

  async listDefaults(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany({
        where: { isDefault: true },
        orderBy: { name: 'asc' },
      });
      res.json(categories);
    } catch (err) {
      next(err);
    }
  },

  async updateDefault(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      // Check if category exists and is default
      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category || !category.isDefault) {
        return res.status(404).json({ error: 'Categoria padrão não encontrada' });
      }

      // Check if name is being changed and if it's already taken
      if (name && name !== category.name) {
        const existingCategory = await prisma.category.findFirst({
          where: { 
            name,
            isDefault: true,
            NOT: { id }
          },
        });

        if (existingCategory) {
          return res.status(400).json({
            error: 'Já existe uma categoria padrão com este nome',
          });
        }
      }

      const updatedCategory = await prisma.category.update({
        where: { id },
        data: {
          name,
          description,
        },
      });

      // Log activity
      if (req.user?.userId) {
        await activityService.create({
          userId: req.user.userId,
          type: 'system',
          action: 'update',
          entityType: 'DEFAULT_CATEGORY',
          entityId: updatedCategory.id,
          title: 'Categoria Padrão Atualizada',
          description: `Categoria padrão "${updatedCategory.name}" foi atualizada`,
          status: 'success'
        });
      }

      res.json(updatedCategory);
    } catch (err) {
      next(err);
    }
  },

  async deleteDefault(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Check if category exists and is default
      const category = await prisma.category.findUnique({
        where: { id },
        include: { products: { take: 1 } },
      });

      if (!category || !category.isDefault) {
        return res.status(404).json({ error: 'Categoria padrão não encontrada' });
      }

      if (category.products.length > 0) {
        return res.status(400).json({
          error: 'Não é possível excluir uma categoria que possui produtos',
        });
      }

      await prisma.category.delete({
        where: { id },
      });

      // Log activity
      if (req.user?.userId) {
        await activityService.create({
          userId: req.user.userId,
          type: 'system',
          action: 'delete',
          entityType: 'DEFAULT_CATEGORY',
          entityId: id,
          title: 'Categoria Padrão Excluída',
          description: `Categoria padrão "${category.name}" foi excluída`,
          status: 'success'
        });
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async bulkCreateDefault(req: Request, res: Response, next: NextFunction) {
    try {
      const { categories } = req.body as { categories: Array<{ name: string; description?: string }> };
      const userId = req.user?.userId;

      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        return res.status(400).json({
          error: 'Lista de categorias inválida ou vazia',
        });
      }

      // Validate each category
      const validationErrors: Array<{ index: number; error: string }> = [];
      
      categories.forEach((category, index) => {
        if (!category.name || typeof category.name !== 'string' || category.name.trim() === '') {
          validationErrors.push({
            index,
            error: 'O nome da categoria é obrigatório',
          });
        }
      });

      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'Erro de validação',
          details: validationErrors,
        });
      }

      // Check for duplicate names in the request
      const names = categories.map(c => c.name.trim().toLowerCase());
      const uniqueNames = new Set(names);
      
      if (uniqueNames.size !== names.length) {
        return res.status(400).json({
          error: 'Não são permitidas categorias duplicadas no mesmo arquivo',
        });
      }

      // Check for existing categories with the same names
      const existingCategories = await prisma.category.findMany({
        where: {
          name: { in: names },
          isDefault: true,
        },
        select: { name: true },
      });

      if (existingCategories.length > 0) {
        const existingNames = existingCategories.map(c => c.name);
        return res.status(400).json({
          error: 'Algumas categorias já existem',
          existingCategories: existingNames,
        });
      }

      // Prepare data for bulk insert
      const categoryData = categories.map(category => ({
        name: category.name.trim(),
        description: category.description?.trim() || null,
        isDefault: true,
        ...(userId && { userId }),
      }));

      // Use transaction to ensure all or nothing
      const result = await prisma.$transaction(
        categoryData.map(category => 
          prisma.category.create({ data: category })
        )
      );

      // Log activity
      if (userId) {
        await activityService.create({
          userId,
          type: 'system',
          action: 'import',
          entityType: 'DEFAULT_CATEGORY',
          entityId: 'bulk_operation',
          title: 'Categorias Padrão Importadas',
          description: `${result.length} categorias foram importadas com sucesso`,
          status: 'success',
          metadata: {
            count: result.length,
            categories: result.map(c => c.name)
          }
        });
      }

      res.status(201).json({
        message: `${result.length} categorias criadas com sucesso`,
        count: result.length,
        categories: result,
      });
    } catch (err) {
      console.error('Error in bulkCreateDefault:', err);
      next(err);
    }
  },
};
