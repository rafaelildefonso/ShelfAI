import { Router } from 'express';
import { authController } from '../controllers/authController.js';

const router = Router();

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// Rotas protegidas
router.get('/me', authController.getProfile);
router.put('/update-password', authController.updatePassword);
router.put('/update-profile', authController.updateProfile);

// Rotas administrativas
router.get('/users', authController.getAllUsers);
router.patch('/users/:id/deactivate', authController.deactivateUser);
router.patch('/users/:id/activate', authController.activateUser);

export default router;
