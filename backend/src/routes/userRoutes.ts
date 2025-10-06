import { Router } from 'express';
import { userController } from '../controllers/userController';
import { auth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { z } from 'zod';

const router = Router();

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.string(),
});

router.get('/', auth, userController.list);
router.get('/:id', auth, userController.get);
router.post('/', auth, validate(userSchema), userController.create);
router.put('/:id', auth, validate(userSchema.partial()), userController.update);
router.delete('/:id', auth, userController.remove);

export default router;
