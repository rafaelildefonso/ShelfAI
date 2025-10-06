import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  originalPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft']).default('draft'),
  weight: z.number().min(0).optional(),
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  model: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
  stockLocation: z.string().optional(),
  origin: z.enum(['manual', 'import']).optional(),
  internalNotes: z.string().optional()
});

export const updateProductSchema = createProductSchema.partial();