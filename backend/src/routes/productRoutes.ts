import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';

const router = Router();

const productSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number().optional(),
  originalPrice: z.number().optional(),
  costPrice: z.number().optional(),
  categoryId: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  status: z.string(),
  weight: z.number().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  userId: z.string().optional(),
  templateData: z.any().optional(),
});

router.get('/', authenticate, productController.list);
router.get('/:id', authenticate, productController.get);
router.post('/', authenticate, validate(productSchema), productController.create);
router.put('/:id', authenticate, validate(productSchema.partial()), productController.update);
router.delete('/:id', authenticate, productController.remove);

export default router;
