import { Router } from 'express';
import { upload } from '../services/fileUploadService.js';
import * as fileController from '../controllers/fileController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Upload product image
router.post(
  '/upload/product',
  authenticate,
  upload.single('image'),
  fileController.uploadProductImage
);

// Delete product image
router.delete(
  '/delete/product',
  authenticate,
  fileController.deleteProductImage
);

export default router;
