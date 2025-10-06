import { Router } from 'express';
import multer from 'multer';
import { importController } from '../controllers/importController.js';
import { exportController } from '../controllers/exportController.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ storage });

// Rotas de importação/exportação
router.post('/import', auth, upload.single('file'), importController.importProducts);

// Rota para listar formatos de exportação disponíveis
router.get('/export/formats', auth, exportController.getExportFormats);

// Rota para exportar produtos (formato padrão: CSV)
router.get('/export', auth, exportController.exportProducts);

// Rota para exportar produtos em um formato específico
router.get('/export/:format', auth, exportController.exportProducts);

export default router;
