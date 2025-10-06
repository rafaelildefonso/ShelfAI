import { Router } from 'express';
import { categoryController } from '../controllers/categoryController';
import { auth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const categorySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

router.get('/', auth, categoryController.list);
router.get('/:id', auth, categoryController.get);
router.post('/', auth, validate(categorySchema), categoryController.create);
router.put('/:id', auth, validate(categorySchema.partial()), categoryController.update);
router.delete('/:id', auth, categoryController.remove);

export default router;
