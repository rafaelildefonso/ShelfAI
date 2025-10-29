import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';

const router = Router();

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.string(),
});

router.get('/', authenticate, userController.list);
router.get('/:id', authenticate, userController.get);
router.post('/', authenticate, validate(userSchema), userController.create);
router.put('/:id', authenticate, validate(userSchema.partial()), userController.update);
router.delete('/:id', authenticate, userController.remove);

export default router;
