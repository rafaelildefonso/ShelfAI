import { Router } from 'express';
import { adminAuth } from '../middlewares/adminAuth.js';
import { adminCategoryController } from '../controllers/adminCategoryController.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(adminAuth);

// Admin category routes
router.post('/categories/default', adminCategoryController.createDefault);
router.post('/categories/default/bulk', adminCategoryController.bulkCreateDefault);
router.get('/categories/default', adminCategoryController.listDefaults);
router.put('/categories/default/:id', adminCategoryController.updateDefault);
router.delete('/categories/default/:id', adminCategoryController.deleteDefault);

export default router;
