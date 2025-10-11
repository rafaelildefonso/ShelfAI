import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

function transformProductData(data: any) {
  const transformed = { ...data };

  // Converter strings vazias para undefined
  Object.keys(transformed).forEach(key => {
    if (transformed[key] === '' || transformed[key] === null || transformed[key] === undefined) {
      transformed[key] = undefined;
    }
  });

  // Converter números
  if (transformed.price !== undefined) transformed.price = Number(transformed.price);
  if (transformed.originalPrice !== undefined) transformed.originalPrice = Number(transformed.originalPrice);
  if (transformed.costPrice !== undefined) transformed.costPrice = Number(transformed.costPrice);
  if (transformed.weight !== undefined) transformed.weight = Number(transformed.weight);
  if (transformed.length !== undefined) transformed.length = Number(transformed.length);
  if (transformed.width !== undefined) transformed.width = Number(transformed.width);
  if (transformed.height !== undefined) transformed.height = Number(transformed.height);

  // Converter booleanos
  if (transformed.featured !== undefined) transformed.featured = Boolean(transformed.featured);
  if (transformed.active !== undefined) transformed.active = Boolean(transformed.active);

  // Converter tags
  if (transformed.tags !== undefined && typeof transformed.tags === 'string') {
    transformed.tags = transformed.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
  }

  return transformed;
}

export function validate(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Primeiro transformar os dados
    req.body = transformProductData(req.body);

    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Validation error', details: result.error } });
    }
    next();
  };
}
