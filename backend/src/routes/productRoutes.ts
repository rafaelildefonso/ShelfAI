import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { auth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';

const router = Router();

const productSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number().optional(),
  originalPrice: z.number().optional(),
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
});

router.get('/', auth, productController.list);
router.get('/:id', auth, productController.get);
router.post('/', auth, validate(productSchema), productController.create);
router.put('/:id', auth, validate(productSchema.partial()), productController.update);
router.delete('/:id', auth, productController.remove);

export default router;
