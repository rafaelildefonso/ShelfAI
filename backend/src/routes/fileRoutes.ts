import { Router } from 'express';
import { upload } from '../services/fileUploadService.js';
import * as fileController from '../controllers/fileController.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

// Upload product image
router.post(
  '/upload/product',
  auth,
  upload.single('image'),
  fileController.uploadProductImage
);

// Delete product image
router.delete(
  '/delete/product',
  auth,
  fileController.deleteProductImage
);

export default router;
