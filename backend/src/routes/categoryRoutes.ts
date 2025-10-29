import { Router } from 'express';
import { categoryController } from '../controllers/categoryController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';

const router = Router();

const categorySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

router.get('/', authenticate, categoryController.list);
router.get('/:id', authenticate, categoryController.get);
router.post('/', authenticate, validate(categorySchema), categoryController.create);
router.put('/:id', authenticate, validate(categorySchema.partial()), categoryController.update);
router.delete('/:id', authenticate, categoryController.remove);

export default router;
