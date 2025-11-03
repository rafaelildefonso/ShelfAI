import { Router } from 'express';
import { activityController } from '../controllers/activityController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// GET /api/v1/activities - Listar atividades
router.get('/', activityController.list);

// GET /api/v1/activities/stats - Obter estatísticas
router.get('/stats', activityController.getStats);

// GET /api/v1/activities/:id - Obter atividade específica
router.get('/:id', activityController.get);

// DELETE /api/v1/activities/:id - Deletar atividade
router.delete('/:id', activityController.delete);

// DELETE /api/v1/activities/old - Deletar atividades antigas
router.delete('/old', activityController.deleteOld);

export default router;
