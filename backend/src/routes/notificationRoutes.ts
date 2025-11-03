import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// GET /api/v1/notifications - Listar notificações
router.get('/', notificationController.list);

// GET /api/v1/notifications/unread-count - Contar não lidas
router.get('/unread-count', notificationController.countUnread);

// GET /api/v1/notifications/:id - Obter notificação específica
router.get('/:id', notificationController.get);

// PATCH /api/v1/notifications/:id/read - Marcar como lida
router.patch('/:id/read', notificationController.markAsRead);

// PATCH /api/v1/notifications/read-all - Marcar todas como lidas
router.patch('/read-all', notificationController.markAllAsRead);

// DELETE /api/v1/notifications/:id - Deletar notificação
router.delete('/:id', notificationController.delete);

// DELETE /api/v1/notifications/read - Deletar todas lidas
router.delete('/read', notificationController.deleteAllRead);

export default router;
