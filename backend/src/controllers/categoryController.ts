import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Schema for category validation
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type CategoryInput = z.infer<typeof categorySchema>;

export const categoryController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await (prisma as any).category.findMany({
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
      const category = await (prisma as any).category.findUnique({
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
      const data: CategoryInput = categorySchema.parse(req.body);
      
      // Check if category with same name already exists
      const existingCategory = await (prisma as any).category.findUnique({
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
      
      const category = await (prisma as any).category.create({ 
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
      
      // Check if category exists
      const existingCategory = await (prisma as any).category.findUnique({
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
        const nameExists = await (prisma as any).category.findUnique({
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
      
      const category = await (prisma as any).category.update({ 
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
      
      // Check if category exists and has products
      const category = await (prisma as any).category.findUnique({
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
      
      await (prisma as any).category.delete({ where: { id } });
      
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
