import { Router } from 'express';
import multer from 'multer';
import { importController } from '../controllers/importController.js';
import { importTemplateController } from '../controllers/importTemplateController.js';
import { exportController } from '../controllers/exportController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateImportFile, validateMapping } from '../middlewares/importValidationMiddleware.js';

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

// Rotas de importação
// Preview do arquivo antes da importação (com e sem auth para debug)
router.post('/import/preview', authenticate, upload.single('file'), validateImportFile(), importController.preview);
router.post('/import/preview-test', upload.single('file'), validateImportFile(), importController.preview); // Sem auth para debug
router.post('/import/preview-simple', upload.single('file'), (req, res) => {
  const file = (req as any).file;
  if (file) {
    res.json({
      data: {
        headers: ['name', 'description', 'price', 'sku'], // Mock data
        preview: [
          { name: 'Produto Teste 1', description: 'Descrição teste', price: 10.99, sku: 'TEST001' },
          { name: 'Produto Teste 2', description: 'Descrição teste 2', price: 20.99, sku: 'TEST002' }
        ],
        totalRows: 2,
        validationErrors: [],
        suggestedMapping: { name: 'name', description: 'description', price: 'price', sku: 'sku' }
      }
    });
  } else {
    res.status(400).json({ message: 'Nenhum arquivo enviado' });
  }
}); // Sem middlewares

// Teste sem upload
router.get('/import/test', (req, res) => {
  res.json({ message: 'API funcionando', timestamp: new Date().toISOString() });
});

// Teste com upload básico sem middlewares
router.post('/import/test-upload', upload.single('file'), (req, res) => {
  const file = (req as any).file;
  if (file) {
    res.json({
      data: {
        message: 'Upload funcionando',
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        headers: ['name', 'sku'],
        preview: [
          { name: 'Teste Produto', sku: 'TEST001' }
        ],
        totalRows: 1,
        validationErrors: [],
        suggestedMapping: { name: 'name', sku: 'sku' }
      }
    });
  } else {
    res.status(400).json({ message: 'Nenhum arquivo enviado' });
  }
});

// Teste ultra-simples para XLSX (sem FileParser)
router.post('/import/test-xlsx-simple', upload.single('file'), (req, res) => {
  const file = (req as any).file;
  if (file) {
    // Simples verificação se o arquivo foi recebido
    const extension = file.originalname.split('.').pop()?.toLowerCase();

    res.json({
      data: {
        message: 'Upload de arquivo funcionando!',
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        extension: extension,
        isXlsx: extension === 'xlsx',
        headers: ['name', 'sku', 'description', 'price', 'category'],
        preview: [
          { name: `Produto ${extension?.toUpperCase()} 1`, sku: `${extension?.toUpperCase()}001`, description: `Produto de teste via ${extension?.toUpperCase()}`, price: 99.99, category: 'Eletrônicos' },
          { name: `Produto ${extension?.toUpperCase()} 2`, sku: `${extension?.toUpperCase()}002`, description: `Segundo produto via ${extension?.toUpperCase()}`, price: 149.50, category: 'Roupas' }
        ],
        totalRows: 2,
        validationErrors: [],
        suggestedMapping: { name: 'name', sku: 'sku', description: 'description', price: 'price', category: 'category' }
      }
    });
  } else {
    res.status(400).json({ message: 'Nenhum arquivo enviado' });
  }
});

// Importar produtos usando mapeamento
router.post('/import', authenticate, upload.single('file'), validateImportFile(), importController.importProducts);

// Templates de mapeamento
router.get('/import/templates', authenticate, importTemplateController.list);
router.post('/import/templates', authenticate, importTemplateController.create);
router.get('/import/templates/:id', authenticate, importTemplateController.get);
router.put('/import/templates/:id', authenticate, importTemplateController.update);
router.delete('/import/templates/:id', authenticate, importTemplateController.delete);

// Campos disponíveis para mapeamento
router.get('/import/fields', authenticate, importController.getProductFields);

// Rota para listar formatos de exportação disponíveis
router.get('/export/formats', authenticate, exportController.getExportFormats);

// Rota para exportar produtos (formato padrão: CSV)
router.get('/export', authenticate, exportController.exportProducts);

// Rota para exportar produtos em um formato específico
router.get('/export/:format', authenticate, exportController.exportProducts);

export default router;
