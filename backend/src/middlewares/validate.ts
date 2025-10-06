import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function validate(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { message: 'Validation error', details: result.error } });
    }
    next();
  };
}
