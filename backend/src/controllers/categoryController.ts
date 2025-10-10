import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for category validation
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

type CategoryInput = z.infer<typeof categorySchema>;

export const categoryController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany({
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

      // Validate ID format
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          error: {
            code: 'INVALID_ID',
            message: 'Invalid category ID',
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

      res.json(category);
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        const prismaError = err as { code: string };
        if (prismaError.code === 'P2023') {
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
      const data: CategoryInput = categorySchema.parse(req.body);

      // Check if category with same name already exists
      const existingCategory = await prisma.category.findUnique({
        where: { name: data.name },
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
        data,
        include: { products: false },
      });

      res.status(201).json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: err.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Validate ID format
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          error: {
            code: 'INVALID_ID',
            message: 'Invalid category ID',
          },
        });
      }

      const data: Partial<CategoryInput> = categorySchema.partial().parse(req.body);

      // Check if category exists
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

      // If name is being updated, check for duplicates
      if (data.name && data.name !== existingCategory.name) {
        const nameExists = await prisma.category.findUnique({
          where: { name: data.name },
        });

        if (nameExists) {
          return res.status(409).json({
            error: {
              code: 'DUPLICATE_NAME',
              message: 'A category with this name already exists',
            },
          });
        }
      }

      const category = await prisma.category.update({
        where: { id },
        data,
        include: { products: false },
      });

      res.json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: err.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }
      if (err && typeof err === 'object' && 'code' in err) {
        const prismaError = err as { code: string };
        if (prismaError.code === 'P2023') {
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

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Validate ID format
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          error: {
            code: 'INVALID_ID',
            message: 'Invalid category ID',
          },
        });
      }

      // Check if category exists and has products
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

      if (category._count.products > 0) {
        return res.status(400).json({
          error: {
            code: 'CATEGORY_IN_USE',
            message: 'Cannot delete category that has associated products',
            productCount: category._count.products,
          },
        });
      }

      await prisma.category.delete({ where: { id } });

      res.status(204).send();
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        const prismaError = err as { code: string };
        if (prismaError.code === 'P2025') {
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
